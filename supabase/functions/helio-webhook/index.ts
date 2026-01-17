
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const HELIO_WEBHOOK_SECRET = Deno.env.get('HELIO_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req: Request) => {
  // 1. Handle CORS (for testing via browser/Postman)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    console.log(`[Webhook] Hit: ${req.method} ${req.url}`);

    // 2. Validate Environment
    if (!HELIO_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[CRITICAL] Missing one or more secrets (HELIO_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).");
      return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 });
    }

    // 3. Permissive Authorization Check
    // We check if the header *contains* the secret, rather than exact matching, 
    // to handle variations like "Bearer <SECRET>" vs "<SECRET>".
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.includes(HELIO_WEBHOOK_SECRET)) {
      console.error(`[Auth] Failed. Header: ${authHeader.substring(0, 10)}... vs Secret: ${HELIO_WEBHOOK_SECRET.substring(0, 5)}...`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 4. Parse Body
    const bodyText = await req.text();
    console.log(`[Payload] Raw: ${bodyText}`); // Log EVERYTHING so you can see the exact JSON structure
    
    let payload;
    try {
        payload = JSON.parse(bodyText);
    } catch (e) {
        console.error("[Json] Failed to parse body");
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    // 5. Check Transaction Status
    // Helio uses 'transactionStatus', sometimes nested, or top level 'status'.
    // We normalize to uppercase and check for success indicators.
    const status = (payload.transactionStatus || payload.status || '').toUpperCase();
    console.log(`[Logic] Transaction Status found: ${status}`);

    if (status !== 'SUCCESS' && status !== 'CONFIRMED') {
        console.log(`[Logic] Ignoring non-success status.`);
        return new Response(JSON.stringify({ message: "Ignored: Not successful" }), { status: 200 });
    }

    // 6. Extract Metadata (User ID)
    let meta = payload.metadata;
    // Handle double-stringified metadata (common in webhooks)
    if (typeof meta === 'string') {
        try {
            meta = JSON.parse(meta);
        } catch (e) {
            console.error("[Metadata] Could not parse string metadata:", meta);
        }
    }

    const userId = meta?.userId;
    const plan = meta?.plan || 'pro';

    if (!userId) {
        console.error("[Logic] No 'userId' found in metadata. Keys found:", meta ? Object.keys(meta) : 'null');
        return new Response(JSON.stringify({ error: "Missing userId in metadata" }), { status: 400 });
    }

    // 7. Update User in Supabase
    console.log(`[Db] Upgrading user ${userId} to ${plan}...`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { 
            is_pro: true, 
            plan: plan,
            last_payment_id: payload.id || payload.transactionSignature,
            pro_since: new Date().toISOString()
        }
    });

    if (error) {
        console.error("[Db] Update Failed:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log(`[Success] Upgrade successful for ${userId}`);
    return new Response(JSON.stringify({ success: true, userId }), { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
    });

  } catch (err: any) {
    console.error(`[Exception] Uncaught error: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})
