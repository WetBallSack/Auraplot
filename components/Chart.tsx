
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, LineStyle, PriceScaleMode } from 'lightweight-charts';
import { OHLC } from '../types';
import { calculateEMA, calculateRSI, calculateBollinger, calculateMACD } from '../utils/indicators';
import clsx from 'clsx';
import { useTheme } from '../contexts/ThemeContext';
import { Camera, Lock } from 'lucide-react';

interface ChartProps {
  data: OHLC[];
  isPro?: boolean;
  percentageMode?: boolean;
  hideControls?: boolean;
}

type IndicatorType = 'EMA' | 'RSI' | 'BB' | 'MACD';

export const Chart: React.FC<ChartProps> = ({ data, isPro = false, percentageMode = false, hideControls = false }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const { theme } = useTheme();
  
  const [activeIndicators, setActiveIndicators] = useState<Record<IndicatorType, boolean>>({
    EMA: false,
    RSI: false,
    BB: false,
    MACD: false,
  });

  const toggleIndicator = (type: IndicatorType) => {
    setActiveIndicators(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleExport = () => {
    if (!isPro) {
        alert("Feature Locked: Upgrade to Aura Pro to export high-resolution chart snapshots for your records.");
        return;
    }
    
    if (chartInstanceRef.current) {
        const canvas = chartInstanceRef.current.takeScreenshot();
        const link = document.createElement('a');
        link.download = `aura-chart-export-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
  };

  // Update chart options when theme changes
  useEffect(() => {
    if (chartInstanceRef.current) {
        const isDark = theme === 'dark';
        chartInstanceRef.current.applyOptions({
            layout: {
                textColor: isDark ? '#9CA3AF' : '#1B3129',
                background: { type: ColorType.Solid, color: 'transparent' },
            },
            grid: {
                vertLines: { color: isDark ? '#374151' : '#F0F3F5' },
                horzLines: { color: isDark ? '#374151' : '#F0F3F5' },
            },
            timeScale: {
                borderColor: isDark ? '#374151' : '#E5E7EB',
            }
        });
    }
  }, [theme]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
    }

    const isDark = theme === 'dark';

    // 1. Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#9CA3AF' : '#1B3129',
        fontFamily: 'Inter',
      },
      grid: {
        vertLines: { color: isDark ? '#374151' : '#F0F3F5' },
        horzLines: { color: isDark ? '#374151' : '#F0F3F5' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 350,
      timeScale: {
        visible: true,
        borderColor: isDark ? '#374151' : '#E5E7EB',
        fixLeftEdge: false,
        fixRightEdge: false,
        rightOffset: 12,
        timeVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
        mode: percentageMode ? PriceScaleMode.Percentage : PriceScaleMode.Normal,
        scaleMargins: {
            top: 0.1,
            bottom: activeIndicators.RSI || activeIndicators.MACD ? 0.3 : 0.1,
        }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      }
    });
    
    chartInstanceRef.current = chart;

    // 2. Main Candlestick Series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00C896',
      downColor: '#FF5F5F',
      borderVisible: false,
      wickUpColor: '#00C896',
      wickDownColor: '#FF5F5F',
    });

    const chartData = data.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        color: d.isEvent ? (d.close >= d.open ? '#00C896' : '#FF5F5F') : (isDark ? '#4B5563' : '#E5E7EB'),
        wickColor: d.isEvent ? (d.close >= d.open ? '#00C896' : '#FF5F5F') : (isDark ? '#6B7280' : '#D1D5DB'),
    }));
    candlestickSeries.setData(chartData as any);

    // 3. Highlight "Today" & Events
    if (data.length > 0) {
        const lastCandle = data[data.length - 1];
        
        const markers = data
            .filter(d => d.isEvent && d.time !== lastCandle.time)
            .map(d => ({
                time: d.time,
                position: 'aboveBar',
                color: isDark ? '#E5E7EB' : '#1B3129',
                shape: 'arrowDown',
                text: d.eventName || 'Event',
            }));
            
        const lastDayEvent = data.find(d => d.time === lastCandle.time && d.isEvent);
        if (lastDayEvent) {
             markers.push({
                time: lastCandle.time,
                position: 'aboveBar',
                color: isDark ? '#E5E7EB' : '#1B3129',
                shape: 'arrowDown',
                text: lastDayEvent.eventName || 'Event',
             } as any);
        }

        markers.push({
            time: lastCandle.time,
            position: 'belowBar',
            color: '#00C896',
            shape: 'arrowUp',
            text: 'YOU',
            size: 2,
        } as any);

        candlestickSeries.setMarkers(markers as any);
    }

    // 4. Indicators

    // EMA
    if (activeIndicators.EMA) {
        const emaData = calculateEMA(data, 20);
        const emaSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            priceScaleId: 'right',
        });
        emaSeries.setData(emaData as any);
    }

    // Bollinger Bands
    if (activeIndicators.BB) {
        const { upper, lower } = calculateBollinger(data);
        const upperSeries = chart.addLineSeries({
            color: 'rgba(0, 200, 150, 0.5)',
            lineWidth: 1,
            priceScaleId: 'right',
        });
        const lowerSeries = chart.addLineSeries({
            color: 'rgba(0, 200, 150, 0.5)',
            lineWidth: 1,
            priceScaleId: 'right',
        });
        upperSeries.setData(upper as any);
        lowerSeries.setData(lower as any);
    }

    // RSI
    if (activeIndicators.RSI) {
        const rsiSeries = chart.addLineSeries({
            color: '#9333ea',
            lineWidth: 2,
            priceScaleId: 'rsi',
        });
        
        const rsiData = calculateRSI(data);
        rsiSeries.setData(rsiData as any);

        chart.priceScale('rsi').applyOptions({
            scaleMargins: { top: 0.75, bottom: 0 },
            borderVisible: false,
        });
        
        rsiSeries.createPriceLine({
            price: 70,
            color: 'rgba(147, 51, 234, 0.3)',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
            axisLabelVisible: false,
            title: ''
        });
        rsiSeries.createPriceLine({
            price: 30,
            color: 'rgba(147, 51, 234, 0.3)',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
            axisLabelVisible: false,
            title: ''
        });
    }

    // MACD
    if (activeIndicators.MACD) {
        const { macd, signal, histogram } = calculateMACD(data);
        const macdScaleId = 'macd';
        
        const macdSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            priceScaleId: macdScaleId,
        });
        const signalSeries = chart.addLineSeries({
            color: '#FF6D00',
            lineWidth: 2,
            priceScaleId: macdScaleId,
        });
        const histSeries = chart.addHistogramSeries({
            priceScaleId: macdScaleId,
        });

        macdSeries.setData(macd as any);
        signalSeries.setData(signal as any);
        histSeries.setData(histogram as any);

        chart.priceScale(macdScaleId).applyOptions({
            scaleMargins: { top: 0.75, bottom: 0 },
            borderVisible: false,
        });
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
          chartInstanceRef.current.remove();
          chartInstanceRef.current = null;
      }
    };
  }, [data, activeIndicators, theme, percentageMode]);

  return (
    <div className="w-full flex flex-col gap-2 relative">
        {/* Indicator Controls */}
        <div className="flex gap-2 justify-end px-4 items-center">
             {(['EMA', 'BB', 'RSI', 'MACD'] as IndicatorType[]).map((ind) => (
                <button
                    key={ind}
                    onClick={() => toggleIndicator(ind)}
                    className={clsx(
                        "px-2 py-1 text-[10px] font-bold rounded border transition-colors",
                        activeIndicators[ind] 
                            ? "bg-accent text-white border-accent" 
                            : "bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                >
                    {ind}
                </button>
            ))}
            
            {!hideControls && (
                <>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    
                    <button
                        onClick={handleExport}
                        className={clsx(
                            "p-1 rounded border transition-colors flex items-center gap-1",
                            isPro 
                                ? "bg-white dark:bg-gray-800 text-gray-500 hover:text-primary border-gray-200 dark:border-gray-700" 
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-transparent cursor-pointer hover:text-primary"
                        )}
                        title={isPro ? "Export Chart" : "Export locked (Pro only)"}
                    >
                        <Camera size={14} />
                        {!isPro && <Lock size={10} />}
                    </button>
                </>
            )}
        </div>
        
        {/* Chart Container */}
        <div ref={chartContainerRef} className="w-full h-[350px]" />
    </div>
  );
};
