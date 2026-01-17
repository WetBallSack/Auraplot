import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const HELIO_WEBHOOK_SECRET = Deno.env.get('HELIO_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to find user ID by email since metadata might be missing
async function findUserByEmail(supabase: any, email: string) {
    console.log(`[Lookup] Searching for user with email: ${email}`);
    let page = 1;
    const perPage = 50; // Batch size
    
    // Safety limit to prevent infinite loops if DB is huge (for MVP this is fine)
    while (page <= 20) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ 
            page: page, 
            perPage: perPage 
        });
        
        if (error) {
            console.error("[Lookup] List users error:", error);
            return null;
        }
        
        if (!users || users.length === 0) break;

        const match = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (match) return match.id;

        page++;
    }
    return null;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`[Webhook] Hit: ${req.method} ${req.url}`);

    if (!HELIO_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[CRITICAL] Missing secrets.");
      return new Response(JSON.stringify({ error: "Server Configuration Error" }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.includes(HELIO_WEBHOOK_SECRET)) {
      console.error(`[Auth] Failed. Received: ${authHeader}`);
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid Secret" }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const bodyText = await req.text();
    console.log(`[Payload] Raw: ${bodyText}`);
    
    let payload;
    try {
        payload = JSON.parse(bodyText);
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 1. Parsing Logic
    if (typeof payload.transaction === 'string') {
        try {
            const parsedTx = JSON.parse(payload.transaction);
            if (!payload.transactionObject) {
                payload.transactionObject = parsedTx;
            }
        } catch (e) {
            console.warn("[Parse] Failed to parse transaction string:", e);
        }
    }

    const txObj = payload.transactionObject || payload;
    const objectStatus = txObj?.transactionStatus;
    const rootStatus = payload.transactionStatus || payload.status;
    const eventType = payload.event;

    // Normalize status
    const status = (objectStatus || rootStatus || '').toUpperCase();
    console.log(`[Logic] Extracted Status: ${status}, Event: ${eventType}`);

    // 2. Success Validation
    const isSuccess = 
        status === 'SUCCESS' || 
        status === 'CONFIRMED' || 
        status === 'ENDED' ||
        eventType === 'ENDED' || 
        (eventType === 'STARTED' && status === 'SUCCESS');

    if (!isSuccess) {
        return new Response(JSON.stringify({ message: `Ignored: Status is ${status}, Event is ${eventType}` }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 3. Metadata Extraction
    let meta = payload.metadata || payload.meta || txObj?.meta || txObj?.metadata || {};
    if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch (e) {}
    }

    let userId = meta?.userId || meta?.custom_userId || payload.custom_userId || payload.userId;
    const plan = meta?.plan || meta?.custom_plan || payload.plan || 'pro';
    
    const email = txObj?.customerDetails?.email || payload.email || payload.customerEmail;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    if (!userId) {
        console.log("[Logic] userId missing in metadata. Attempting email lookup...");
        
        if (email) {
            userId = await findUserByEmail(supabase, email);
            if (userId) {
                console.log(`[Logic] Found userId ${userId} via email ${email}`);
            } else {
                console.error(`[Logic] User not found for email: ${email}`);
                return new Response(JSON.stringify({ error: "User email not found in DB" }), { 
                    status: 200, 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        } else {
            console.error("[Logic] No userId AND no email found in payload.");
            return new Response(JSON.stringify({ error: "Missing identity info" }), { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }

    // 4. Update Database
    console.log(`[Db] Upgrading ${userId} to ${plan}`);

    // Expiry Logic: 30 days for monthly, null for lifetime
    let expiresAt = null;
    if (plan !== 'lifetime') {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        expiresAt = d.toISOString();
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { 
            is_pro: true, 
            plan: plan,
            last_payment_id: txObj.id || txObj.transactionSignature || payload.id || 'unknown',
            pro_since: new Date().toISOString(),
            pro_expires_at: expiresAt
        }
    });

    if (error) {
        console.error("[Db] Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    console.log(`[Success] User ${userId} upgraded.`);
    return new Response(JSON.stringify({ success: true, userId, expiresAt }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`[Exception] ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})