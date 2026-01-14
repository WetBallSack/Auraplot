
import { LifeEvent, OHLC, MarketSummary, Timeframe } from '../types';

// Helper to format date as YYYY-MM-DD for lightweight-charts (Daily)
const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper to get Unix Timestamp for lightweight-charts (Intraday)
const formatTimestamp = (date: Date): number => {
  return Math.floor(date.getTime() / 1000); // Seconds
};

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

// Simple seeded random number generator to ensure consistency across re-renders/timeframes
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

// --- CORE GENERATION LOGIC ---

/**
 * NECM (Non-linear Event Candle Model) Logic
 * Translates event data into financial OHLC candle values.
 * 
 * @param impact -10 (bearish) to 10 (bullish)
 * @param intensity 0 (calm) to 10 (chaotic)
 * @param stickiness 0 (local) to 1 (macro/global) - mapped to s in logic
 * @param basePrice current market price
 */
export const calculateEventCandle = (impact: number, intensity: number, stickiness: number, basePrice: number) => {
    // 1. Normalization
    // impact: -10 to 10 -> -1.0 to 1.0
    const i = Math.max(Math.min(impact / 10.0, 1.0), -1.0);
    // intensity: 0 to 10 -> 0.0 to 1.0
    const n = Math.max(Math.min(intensity / 10.0, 1.0), 0.0);
    // stickiness: 0 to 1 -> 0.0 to 1.0 (Equivalent to scale/10 in python logic)
    const s = Math.max(Math.min(stickiness, 1.0), 0.0);

    // 2. Coefficients (Adjust to calibrate sensitivity)
    const K = 0.15;      // Max body displacement (15% of price)
    const LAMBDA = 0.08; // Max volatility/wick extension (8% of price)

    // 3. Calculate Body Displacement (Non-linear)
    const signI = i >= 0 ? 1 : -1;
    // Uses power of 1.5 so high impact moves price exponentially more
    const deltaP = basePrice * signI * Math.pow(Math.abs(i), 1.5) * Math.pow(s, 1.2) * K;

    // 4. Calculate Volatility / Wicks
    // Intensity squared creates "explosive" wicks as it approaches 10
    const sigma = basePrice * Math.pow(n, 2) * Math.sqrt(s) * LAMBDA;

    // 5. Calculate Asymmetric Skew (Panic Factor)
    const skew = 1 + (Math.max(0, -i) * n);

    // 6. Final OHLC Logic
    const openP = basePrice;
    const closeP = openP + deltaP;

    // High: Top of body + volatility (slightly dampened if crashing)
    const highP = Math.max(openP, closeP) + (sigma * (1 - 0.2 * Math.max(0, -i)));

    // Low: Bottom of body - volatility (enhanced by skew)
    const lowP = Math.min(openP, closeP) - (sigma * skew);

    return {
        open: openP,
        high: highP,
        low: lowP,
        close: closeP,
        // Helper for volume calculation if needed elsewhere
        impliedVolume: intensity * 10 
    };
};

// We generate the "Master" timeline at 1-hour resolution.
// This ensures that when we aggregate to 4H or 1D, the Highs/Lows/Closes match perfectly.
const generateHourlyMasterData = (initialScore: number, events: LifeEvent[]): OHLC[] => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Determine Range
    let startDate = new Date();
    let endDate = new Date();
  
    if (sortedEvents.length > 0) {
      startDate = new Date(sortedEvents[0].date);
      endDate = new Date(sortedEvents[sortedEvents.length - 1].date);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Add Buffer (in hours)
    const bufferHours = 48; 
    const loopStart = addMinutes(startDate, -(bufferHours * 60));
    const loopEnd = addMinutes(endDate, (bufferHours * 60));
    
    // Round to nearest hour
    loopStart.setMinutes(0, 0, 0);
    
    const masterData: OHLC[] = [];
    let currentScore = initialScore;
    let currentDate = new Date(loopStart);
    let seed = initialScore + events.length; // Seed for randomness

    // Hourly Noise volatility
    const hourlyVolatility = 0.4; 

    while (currentDate <= loopEnd) {
        const nextHour = addMinutes(currentDate, 60);
        
        // Find events in this hour
        const bucketEvents = sortedEvents.filter(e => {
            const eTime = new Date(e.date).getTime();
            return eTime >= currentDate.getTime() && eTime < nextHour.getTime();
        });

        let open = currentScore;
        let close = currentScore;
        let high = currentScore;
        let low = currentScore;
        let volume = 0;
        let isEvent = false;
        let eventName = '';

        // Apply Events
        if (bucketEvents.length > 0) {
            isEvent = true;
            eventName = bucketEvents.map(e => e.name).join(', ');
            
            bucketEvents.forEach(e => {
                const candle = calculateEventCandle(e.impact, e.intensity, e.stickiness, close);
                
                high = Math.max(high, candle.high);
                low = Math.min(low, candle.low);
                close = candle.close;
                volume += candle.impliedVolume;
            });

            // Ensure H/L encompass the final close
            high = Math.max(high, close);
            low = Math.min(low, close);
        } else {
            // Apply Noise
            const rand = seededRandom(seed++);
            const noise = (rand - 0.5) * hourlyVolatility;
            close = open + noise;

            const wickRand = seededRandom(seed++);
            const wickSize = wickRand * (hourlyVolatility * 0.5);
            high = Math.max(open, close) + wickSize;
            low = Math.min(open, close) - wickSize;
            
            volume = Math.floor(seededRandom(seed++) * 5);
        }

        // Clamp 0-100
        high = Math.min(100, Math.max(0, high));
        low = Math.min(100, Math.max(0, low));
        open = Math.min(100, Math.max(0, open));
        close = Math.min(100, Math.max(0, close));

        // We use unix timestamp for master data
        masterData.push({
            time: formatTimestamp(currentDate), 
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
            volume,
            isEvent,
            eventName
        });

        currentScore = close;
        currentDate = nextHour;
    }

    return masterData;
};

// Aggregate the master hourly data into the requested timeframe
const aggregateData = (masterData: OHLC[], timeframe: Timeframe): OHLC[] => {
    if (timeframe === '1H') return masterData;

    const aggregated: OHLC[] = [];
    let bucketSize = 4; // Default 4H
    if (timeframe === '1D') bucketSize = 24;

    for (let i = 0; i < masterData.length; i += bucketSize) {
        const slice = masterData.slice(i, i + bucketSize);
        if (slice.length === 0) break;

        const first = slice[0];
        const last = slice[slice.length - 1];

        // Aggregate High/Low/Vol
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const volume = slice.reduce((acc, d) => acc + (d.volume || 0), 0);
        
        // Combine Events
        const eventsInSlice = slice.filter(d => d.isEvent);
        const isEvent = eventsInSlice.length > 0;
        const eventName = isEvent ? eventsInSlice.map(d => d.eventName).join(', ') : undefined;

        // Determine Time label
        // For 1D, we need YYYY-MM-DD string. For 4H, Unix timestamp.
        let timeVal: string | number = first.time;
        
        if (timeframe === '1D') {
             // Convert unix back to date object to format as string
             const dateObj = new Date((first.time as number) * 1000);
             timeVal = formatDateString(dateObj);
        }

        aggregated.push({
            time: timeVal,
            open: first.open,
            high: high,
            low: low,
            close: last.close,
            volume: volume,
            isEvent,
            eventName
        });
    }

    return aggregated;
};

export const generateMarketHistory = (
  initialScore: number, 
  events: LifeEvent[], 
  timeframe: Timeframe = '1D'
): { history: OHLC[], summary: MarketSummary, periodName: string } => {
  
  // 1. Generate High-Res Master Data
  const masterData = generateHourlyMasterData(initialScore, events);

  // 2. Aggregate to requested timeframe
  const history = aggregateData(masterData, timeframe);

  // 3. Calculate Summaries (Always based on master data for accuracy)
  let summaryHigh = initialScore;
  let summaryLow = initialScore;
  let totalVolume = 0;

  masterData.forEach(d => {
      if (d.high > summaryHigh) summaryHigh = d.high;
      if (d.low < summaryLow) summaryLow = d.low;
      totalVolume += (d.volume || 0);
  });

  const summaryOpen = initialScore;
  const summaryClose = masterData[masterData.length - 1].close;
  
  // Sort events to find date range for naming
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let periodName = "Intraday Session";
  if (sortedEvents.length > 0) {
    const startD = new Date(sortedEvents[0].date);
    const endD = new Date(sortedEvents[sortedEvents.length - 1].date);
    const startStr = startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const year = endD.getFullYear();
    periodName = startStr === endStr ? `${startStr}, ${year}` : `${startStr} - ${endStr}, ${year}`;
  }

  const roe = summaryOpen === 0 ? 0 : ((summaryClose - summaryOpen) / summaryOpen) * 100;
  const isLiquidationRisk = summaryLow <= 15;

  return {
    periodName,
    history,
    summary: {
      open: Number(summaryOpen.toFixed(2)),
      high: Number(summaryHigh.toFixed(2)),
      low: Number(summaryLow.toFixed(2)),
      close: Number(summaryClose.toFixed(2)),
      volume: totalVolume,
      roe: Number(roe.toFixed(2)),
      isLiquidationRisk
    }
  };
};

export const formatCurrency = (val: number) => {
  return val.toFixed(2);
};
