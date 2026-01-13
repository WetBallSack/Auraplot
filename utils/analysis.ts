import { OHLC, AnalysisResult } from '../types';
import { calculateRSI, calculateEMA } from './indicators';

export const analyzeMarket = (data: OHLC[]): AnalysisResult => {
  if (data.length < 5) {
    return {
      sentiment: 'Neutral',
      score: 0,
      confidence: 0,
      targetPrice: data[data.length - 1]?.close || 50,
      signals: ['Insufficient data for technical analysis'],
      description: 'Market history is too short to determine a trend.'
    };
  }

  const lastCandle = data[data.length - 1];
  const prevCandle = data[data.length - 2];
  const currentPrice = lastCandle.close;

  // 1. Calculate Indicators
  const rsiSeries = calculateRSI(data, 14);
  const emaShortSeries = calculateEMA(data, 7);
  const emaLongSeries = calculateEMA(data, 21);

  const currentRSI = rsiSeries.length > 0 ? rsiSeries[rsiSeries.length - 1].value : 50;
  const currentEMAShort = emaShortSeries.length > 0 ? emaShortSeries[emaShortSeries.length - 1].value : currentPrice;
  const currentEMALong = emaLongSeries.length > 0 ? emaLongSeries[emaLongSeries.length - 1].value : currentPrice;

  // 2. Scoring System (-10 to 10)
  let score = 0;
  const signals: string[] = [];

  // Trend Analysis (EMA Cross) - Strong Indicator
  if (currentEMAShort > currentEMALong) {
    score += 4; 
    signals.push('Golden Cross (Uptrend Confirmed)');
  } else if (currentEMAShort < currentEMALong) {
    score -= 4; 
    signals.push('Death Cross (Downtrend Confirmed)');
  }

  // Trend Slope - Immediate Momentum
  const prevEMAShort = emaShortSeries.length > 1 ? emaShortSeries[emaShortSeries.length - 2].value : currentEMAShort;
  const emaSlope = currentEMAShort - prevEMAShort;
  
  if (emaSlope > 0.1) {
      score += 2;
      signals.push('Short-term momentum is positive');
  } else if (emaSlope < -0.1) {
      score -= 2;
      signals.push('Short-term momentum is negative');
  }

  // Momentum (RSI) - Contrarian indicator at extremes
  if (currentRSI > 75) {
    score -= 1; // Pullback risk
    signals.push(`RSI Overbought (${currentRSI.toFixed(0)}) - Consolidation expected`);
  } else if (currentRSI < 25) {
    score += 1; // Bounce likely
    signals.push(`RSI Oversold (${currentRSI.toFixed(0)}) - Relief rally likely`);
  } else {
     // Trend Confirmation for mid-range
     if (currentRSI > 55 && score > 0) score += 1;
     if (currentRSI < 45 && score < 0) score -= 1;
  }

  // Volume Confirmation (Only if significant)
  if (lastCandle.volume && prevCandle.volume && lastCandle.volume > prevCandle.volume * 1.5) {
      if (lastCandle.close > lastCandle.open) {
        score += 1;
        signals.push('High volume buying detected');
      } else {
        score -= 1;
        signals.push('High volume selling pressure');
      }
  }

  // 3. Determine Sentiment & Confidence
  let sentiment: AnalysisResult['sentiment'] = 'Neutral';
  if (score >= 3) sentiment = 'Bullish';
  else if (score <= -3) sentiment = 'Bearish';

  // Confidence calculation
  const absScore = Math.abs(score);
  // Max score is roughly 8-9. Map to 60-95%
  const confidence = Math.min(95, 60 + (absScore * 4));

  // 4. Calculate Target
  // Use Average True Range (ATR) approximation for volatility
  const volatility = (lastCandle.high - lastCandle.low) / lastCandle.open; // percentage range
  const volatilityFactor = Math.max(0.05, volatility * 5); // Ensure at least 5% move projection
  
  // Projection based on score intensity
  const direction = score > 0 ? 1 : -1;
  const percentChange = direction * (Math.abs(score) / 10) * volatilityFactor;
  
  let targetPrice = currentPrice * (1 + percentChange);
  targetPrice = Math.min(100, Math.max(0, targetPrice)); // Clamp

  // Description Generation
  let description = '';
  if (sentiment === 'Bullish') {
      description = `Technical structure is constructive. Moving averages suggest accumulating emotional capital. Immediate resistance projected at ${targetPrice.toFixed(2)}.`;
  } else if (sentiment === 'Bearish') {
      description = `Market structure is deteriorating. Momentum has shifted negative, suggesting a period of burnout or regression. Support testing likely near ${targetPrice.toFixed(2)}.`;
  } else {
      description = `Price action is chopping sideways. Indecisive signals suggest a holding pattern until a new catalyst event occurs. Monitor volatility.`;
  }

  return {
    sentiment,
    score,
    confidence,
    targetPrice,
    signals,
    description
  };
};