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
    // We add enough buffer to make the chart look nice
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
                volume += (e.intensity * 10);
                
                // Impact calculation
                const volatilitySpike = e.impact * (e.intensity / 5.0);
                const permanentMove = e.impact * e.stickiness;
                
                const spikePrice = close + volatilitySpike;
                
                high = Math.max(high, close, spikePrice);
                low = Math.min(low, close, spikePrice);
                
                close = close + permanentMove;
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