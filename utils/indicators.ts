import { OHLC } from '../types';

interface LineData { time: string | number; value: number; }
interface HistogramData { time: string | number; value: number; color?: string; }

export const calculateEMA = (data: OHLC[], period: number): LineData[] => {
  if (data.length < period) return [];
  
  const k = 2 / (period + 1);
  let ema = data[0].close;
  const result: LineData[] = [{ time: data[0].time, value: ema }];

  for (let i = 1; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push({ time: data[i].time, value: ema });
  }
  return result;
};

export const calculateRSI = (data: OHLC[], period: number = 14): LineData[] => {
  if (data.length <= period) return [];

  const result: LineData[] = [];
  let gains = 0;
  let losses = 0;

  // Initial calculation
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Subsequent calculations
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    
    result.push({ time: data[i].time, value: rsi });
  }
  return result;
};

export const calculateBollinger = (data: OHLC[], period: number = 20, stdDev: number = 2) => {
  if (data.length < period) return { upper: [], lower: [] };

  const upper: LineData[] = [];
  const lower: LineData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b.close, 0);
    const mean = sum / period;
    
    const variance = slice.reduce((a, b) => a + Math.pow(b.close - mean, 2), 0) / period;
    const sd = Math.sqrt(variance);
    
    upper.push({ time: data[i].time, value: mean + (sd * stdDev) });
    lower.push({ time: data[i].time, value: mean - (sd * stdDev) });
  }
  return { upper, lower };
};

export const calculateMACD = (data: OHLC[]) => {
  // Standard MACD (12, 26, 9)
  const fastPeriod = 12;
  const slowPeriod = 26;
  const signalPeriod = 9;

  if (data.length < slowPeriod + signalPeriod) return { macd: [], signal: [], histogram: [] };

  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);

  // Map to dictionary for easy lookup by time
  const fastMap = new Map(emaFast.map(i => [i.time, i.value]));
  
  const macdLine: LineData[] = [];
  
  emaSlow.forEach(slow => {
    const fastVal = fastMap.get(slow.time);
    if (fastVal !== undefined) {
      macdLine.push({ time: slow.time, value: fastVal - slow.value });
    }
  });

  // Calculate Signal Line (EMA 9 of MACD Line)
  // We need to convert MACD line back to OHLC-like structure or reuse EMA logic for simple arrays
  // Reusing logic by mocking object structure
  const macdAsOHLC = macdLine.map(m => ({ close: m.value, time: m.time } as OHLC));
  const signalLine = calculateEMA(macdAsOHLC, signalPeriod);
  
  const signalMap = new Map(signalLine.map(s => [s.time, s.value]));
  const histogram: HistogramData[] = [];

  macdLine.forEach(m => {
    const sVal = signalMap.get(m.time);
    if (sVal !== undefined) {
      const val = m.value - sVal;
      histogram.push({
        time: m.time,
        value: val,
        color: val >= 0 ? '#00C896' : '#FF5F5F'
      });
    }
  });

  return { macd: macdLine, signal: signalLine, histogram };
};