
import { GoogleGenAI } from "@google/genai";
import { SavedSession } from "../types";

export const generateMorningBrief = async (sessions: SavedSession[], userName: string, language: string = 'en'): Promise<string> => {
  // 1. Sort and extract events first
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
  
  const events = recentSessions
    .flatMap(s => s.events || [])
    .slice(0, 15);

  if (events.length === 0) {
    return language === 'zh'
        ? "分析师提示：暂无市场数据。请初始化会话以建立基准。"
        : "Analyst Note: No market data available. Initialize a session to establish a baseline for your volatility index.";
  }

  // 2. Check for API Key. If missing, use offline simulation mode to prevent app breakage.
  // We check safely for process.env to ensure compatibility across different build environments.
  const hasKey = typeof process !== 'undefined' && process.env && process.env.API_KEY;

  if (!hasKey) {
      console.warn("Aura: API Key missing. Switched to Simulation Mode.");
      
      const lastEvent = events[0];
      const isBullish = lastEvent.impact >= 0;
      const eventName = lastEvent.name;
      const intensity = lastEvent.intensity > 7 ? 'High' : 'Moderate';
      
      // Simulation: Simple template based on last event
      if (language === 'zh') {
          return `市场简报 (模拟): [${eventName}] 引发${isBullish ? '多头行情' : '抛售压力'}。
展望：${isBullish ? '上升趋势确立，动能强劲。' : '流动性收紧，测试下方支撑。'}
操作：${isBullish ? '建议增持优质资产。' : '建议对冲风险，减少敞口。'}`;
      }

      return `MARKET UPDATE (SIMULATED): ${isBullish ? 'Rally' : 'Correction'} triggered by [${eventName}]. Volume: ${intensity}.
OUTLOOK: ${isBullish ? 'Bullish structure confirmed. Momentum building.' : 'Bearish divergence. Support levels failing.'}
ACTION: ${isBullish ? 'Long position recommended.' : 'Liquidate weak positions.'}`;
  }

  // 3. AI Generation
  // @ts-ignore - Process env is handled by bundler or shim
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Format events for the prompt
  const eventLog = events.map(e =>
    `- ${e.name} (Impact: ${e.impact}, Intensity: ${e.intensity})`
  ).join('\n');

  const langInstruction = language === 'zh' ? "Respond in Chinese (Mandarin)." : "Respond in English.";

  const prompt = `
    Role: Chief Market Analyst at Aura Terminals.
    User: ${userName} (The "Asset").
    Context: Analyze the user's recent life events as if they were financial market movements (stocks/crypto).

    Recent Data:
    ${eventLog}

    Instructions:
    1. ${langInstruction}
    2. Use financial trading jargon (e.g., "sell-off", "support levels", "alpha", "pricing in", "bullish/bearish divergence", "liquidity crisis").
    3. Analyze the recent volatility. Negative events are dips/crashes. Positive events are rallies.
    4. Provide a "Morning Brief" with a specific "Trade Setup" (actionable advice for the day).
    5. Be professional, slightly cynical, and intense. Like a Bloomberg terminal feed or a high-frequency trading desk.
    6. Keep it concise (max 60 words).

    Format example:
    "MARKET UPDATE: Heavy sell-off in [Life Sector] following [Event]. Support holding at [Level].
    OUTLOOK: Volatility expected.
    ACTION: Long position on [Good Habit]."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Flash for low latency UI component
      contents: prompt,
    });
    return response.text?.trim() || (language === 'zh' ? "分析引擎无响应。" : "Analysis Engine silent.");
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Graceful fallback
    return language === 'zh' 
        ? "数据流连接中断。无法连接至神经核心。" 
        : "Data stream connection interrupted. Neural Core unreachable.";
  }
};
