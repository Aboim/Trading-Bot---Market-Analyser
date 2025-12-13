import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AIAnalysis } from '../types';

interface SimulatedChartProps {
  analysis: AIAnalysis | null;
}

// Generates synthetic data based on the recommendation to visualize the trend
// In a real production app with paid APIs, this would use real historical data
const generateData = (trend: 'COMPRA' | 'VENDA' | 'MANTER') => {
  const data = [];
  let value = 100;
  const points = 30;

  for (let i = 0; i < points; i++) {
    const randomChange = (Math.random() - 0.5) * 5;
    let trendBias = 0;
    
    if (trend === 'COMPRA') trendBias = 1.5;
    if (trend === 'VENDA') trendBias = -1.5;
    
    value = value + randomChange + trendBias;
    // prevent negative
    if(value < 10) value = 10;

    data.push({
      date: `${i + 1}d`,
      value: parseFloat(value.toFixed(2))
    });
  }
  return data;
};

export const SimulatedChart: React.FC<SimulatedChartProps> = ({ analysis }) => {
  const data = useMemo(() => {
    if (!analysis) return generateData('MANTER');
    return generateData(analysis.recommendation);
  }, [analysis]);

  const isPositive = analysis?.recommendation === 'COMPRA';
  const isNegative = analysis?.recommendation === 'VENDA';
  
  const strokeColor = isPositive ? '#10b981' : isNegative ? '#f43f5e' : '#f59e0b';
  const fillColor = isPositive ? '#10b981' : isNegative ? '#f43f5e' : '#f59e0b';

  return (
    <div className="h-full min-h-[300px] w-full bg-dark-800 rounded-xl border border-dark-700 p-4">
      <div className="mb-4">
        <h3 className="text-slate-400 text-sm uppercase tracking-wider">Tendência Projetada (30 dias)</h3>
        {!analysis && <p className="text-xs text-slate-500">Dados simulados para visualização</p>}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={fillColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="date" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};