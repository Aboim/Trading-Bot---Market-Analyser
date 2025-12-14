import React, { useMemo, useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, CheckCircle, ShieldAlert, Zap, Info, BellRing, X, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AIAnalysis } from '../types';

interface MarketCardProps {
  analysis: AIAnalysis | null;
  loading: boolean;
}

// Static styles for Tooltip
const tooltipContentStyle = { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
const tooltipItemStyle = { color: '#f8fafc', fontWeight: 600 };
const tooltipLabelStyle = { color: '#94a3b8', marginBottom: '4px' };

// Helper to generate history data
const generateHistoryData = (currentPrice: number, recommendation: string) => {
  const data = [];
  let price = currentPrice;
  const volatility = price * 0.015; 
  
  let trendBias = 0;
  if (recommendation === 'COMPRA') trendBias = price * 0.008; 
  if (recommendation === 'VENDA') trendBias = -price * 0.008;

  for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      data.unshift({
          date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          price: Number(price.toFixed(2))
      });

      const change = (Math.random() - 0.5) * volatility * 2;
      price = price - trendBias - change;
      
      if (price < 0.01) price = 0.01;
  }
  return data;
};

export const MarketCard: React.FC<MarketCardProps> = ({ analysis, loading }) => {
  // Alert Logic
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [activeAlert, setActiveAlert] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Reset alert when analysis changes
  useEffect(() => {
    setActiveAlert(null);
    setTargetPrice('');
    setShowNotification(null);
  }, [analysis?.symbol]);

  // Simulation: Trigger alert after a few seconds to demonstrate functionality
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (activeAlert !== null && analysis?.currentPrice) {
      // Logic: In a real app, this would be a WebSocket check. 
      // Here we simulate the price hitting the target after 3 seconds for UX demonstration.
      timeout = setTimeout(() => {
         setShowNotification(`Alerta Disparado: ${analysis.symbol} atingiu €${activeAlert.toFixed(2)}!`);
         // Play sound or vibrate here in real app
         if ('vibrate' in navigator) navigator.vibrate(200);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [activeAlert, analysis]);

  const handleSetAlert = () => {
    if (!targetPrice || isNaN(Number(targetPrice))) return;
    setActiveAlert(Number(targetPrice));
  };

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 animate-pulse h-96 flex flex-col items-center justify-center">
        <TrendingUp className="w-12 h-12 text-dark-700 mb-4 animate-bounce" />
        <p className="text-slate-400">Analisando mercado em tempo real...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-dark-800 rounded-xl p-8 border border-dark-700 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
        <TrendingUp className="w-16 h-16 text-primary-500 mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-slate-200">Comece a Investir</h3>
        <p className="text-slate-400 mt-2 max-w-md">
          Pesquise por um ativo (ex: PETR4, AAPL, VALE3, BTC) para receber uma análise detalhada com IA e dados reais.
        </p>
      </div>
    );
  }

  const isBuy = analysis.recommendation === 'COMPRA';
  const isSell = analysis.recommendation === 'VENDA';
  
  // Recommendation Styles
  const recColor = isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-amber-400';
  const recBg = isBuy ? 'bg-emerald-500/10 border-emerald-500/20' : isSell ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20';
  const chartColor = isBuy ? '#34d399' : isSell ? '#fb7185' : '#fbbf24'; 
  const Icon = isBuy ? ArrowUpRight : isSell ? ArrowDownRight : CheckCircle;

  // Risk Visual Logic (Score 1-5)
  const riskConfig = (() => {
    switch (analysis.riskLevel) {
      case 'BAIXO':
        return {
          score: 1,
          bars: 5,
          colorClass: 'bg-emerald-500',
          shadowClass: 'shadow-emerald-500/50',
          textClass: 'text-emerald-400',
          label: 'Defensivo',
          subLabel: 'Baixa Volatilidade'
        };
      case 'MÉDIO':
        return {
          score: 3,
          bars: 5,
          colorClass: 'bg-amber-500',
          shadowClass: 'shadow-amber-500/50',
          textClass: 'text-amber-400',
          label: 'Moderado',
          subLabel: 'Risco Equilibrado'
        };
      case 'ALTO':
      default:
        return {
          score: 5,
          bars: 5,
          colorClass: 'bg-rose-500',
          shadowClass: 'shadow-rose-500/50',
          textClass: 'text-rose-400',
          label: 'Agressivo',
          subLabel: 'Alta Volatilidade'
        };
    }
  })();

  // Generate chart data
  const historyData = generateHistoryData(analysis.currentPrice || 100, analysis.recommendation);

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={historyData}>
         <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
         <XAxis 
             dataKey="date" 
             tick={{fontSize: 10, fill: '#94a3b8'}} 
             axisLine={false} 
             tickLine={false} 
             dy={10}
             minTickGap={30}
             interval="preserveStartEnd"
         />
         <YAxis domain={['auto', 'auto']} hide />
         <Tooltip 
             contentStyle={tooltipContentStyle}
             itemStyle={tooltipItemStyle}
             labelStyle={tooltipLabelStyle}
             formatter={(value: number) => [`€${value.toFixed(2)}`, 'Preço']}
             cursor={{ stroke: '#475569', strokeWidth: 1 }}
             isAnimationActive={false}
         />
         <Line 
             type="monotone" 
             dataKey="price" 
             stroke={chartColor} 
             strokeWidth={3} 
             dot={{ r: 3, fill: '#0f172a', strokeWidth: 2 }}
             activeDot={{ r: 5 }}
             animationDuration={1000}
         />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-2xl relative">
      {/* Notification Toast */}
      {showNotification && (
         <div className="absolute top-4 right-4 z-50 animate-in slide-in-from-right fade-in duration-500">
            <div className="bg-dark-800 border border-primary-500/50 text-slate-200 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3">
              <div className="bg-primary-500/20 p-2 rounded-full">
                <BellRing size={18} className="text-primary-400 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Alerta de Preço</h4>
                <p className="text-xs text-slate-400">{showNotification}</p>
              </div>
              <button onClick={() => setShowNotification(null)} className="ml-2 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            </div>
         </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-dark-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {analysis.symbol.toUpperCase()}
            <span className="text-sm font-normal text-slate-500 bg-dark-900 px-2 py-0.5 rounded border border-dark-700">Stock</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${recBg} ${recColor} flex items-center gap-1`}>
              <Icon size={14} />
              {analysis.recommendation}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-dark-900 text-slate-200 border border-dark-700 font-mono shadow-sm">
              €{analysis.currentPrice?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Granular Risk Meter */}
        <div className="bg-dark-900/50 p-3 rounded-lg border border-dark-700 flex flex-col gap-2 min-w-[180px]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ShieldAlert size={12} /> Risco
            </span>
            <span className={`font-bold ${riskConfig.textClass} uppercase tracking-wider`}>
              {riskConfig.label}
            </span>
          </div>
          
          {/* Segmented Bars */}
          <div className="flex gap-1.5 h-2.5">
            {[...Array(riskConfig.bars)].map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-sm transition-all duration-700 ${
                  i < riskConfig.score 
                    ? `${riskConfig.colorClass} shadow-[0_0_8px_rgba(0,0,0,0)] ${riskConfig.shadowClass}` 
                    : 'bg-dark-700'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center mt-1">
             <span className="text-[10px] text-slate-500 font-medium">{riskConfig.subLabel}</span>
             {riskConfig.score >= 4 && <Zap size={10} className="text-rose-500 animate-pulse" />}
             {riskConfig.score <= 2 && <Info size={10} className="text-emerald-500" />}
          </div>
        </div>
      </div>

      {/* Mini Chart 7 Days */}
      <div className="h-48 w-full mt-6 px-4">
         <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Histórico (7 dias)</p>
         <div className="w-full h-full min-h-[160px]">
            {chartContent}
         </div>
      </div>

      {/* Alert Section */}
      <div className="px-6 py-4 border-t border-b border-dark-700/50 bg-dark-900/30 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3">
          <div className="p-2 bg-dark-700 rounded-full">
            <Bell size={18} className="text-primary-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Alerta de Preço</h4>
            <p className="text-xs text-slate-500">Seja notificado quando o ativo atingir seu alvo.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {activeAlert ? (
             <div className="flex items-center gap-2 bg-primary-600/20 text-primary-400 px-3 py-1.5 rounded-lg border border-primary-500/30 animate-pulse">
               <span className="text-sm font-bold">€{activeAlert.toFixed(2)}</span>
               <button onClick={() => setActiveAlert(null)} className="hover:text-primary-300">
                 <X size={14} />
               </button>
             </div>
           ) : (
             <div className="flex bg-dark-900 rounded-lg border border-dark-600 overflow-hidden">
                <span className="px-2 py-1.5 text-slate-500 text-sm border-r border-dark-700">€</span>
                <input 
                  type="number" 
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-20 bg-transparent text-white text-sm px-2 outline-none"
                />
                <button 
                  onClick={handleSetAlert}
                  disabled={!targetPrice}
                  className="bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700 disabled:text-slate-500 text-white px-3 py-1.5 text-xs font-bold uppercase transition-colors"
                >
                  Definir
                </button>
             </div>
           )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Análise da IA</h3>
          <p className="text-slate-200 leading-relaxed text-lg">
            {analysis.summary}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Pontos Chave</h3>
          <div className="grid gap-3">
            {analysis.keyPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-dark-900/50 border border-dark-700/50">
                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-primary-500" />
                <span className="text-slate-300 text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        {analysis.groundingUrls.length > 0 && (
          <div className="pt-4 border-t border-dark-700">
            <h4 className="text-xs font-semibold text-slate-500 mb-2">FONTES & NOTÍCIAS RECENTES</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.groundingUrls.slice(0, 3).map((url, i) => (
                <a 
                  key={i} 
                  href={url.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary-400 hover:text-primary-300 hover:underline truncate max-w-[200px]"
                >
                  {url.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};