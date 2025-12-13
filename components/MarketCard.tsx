import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { AIAnalysis } from '../types';

interface MarketCardProps {
  analysis: AIAnalysis | null;
  loading: boolean;
}

export const MarketCard: React.FC<MarketCardProps> = ({ analysis, loading }) => {
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
  
  const recColor = isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-amber-400';
  const recBg = isBuy ? 'bg-emerald-500/10 border-emerald-500/20' : isSell ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20';
  const Icon = isBuy ? ArrowUpRight : isSell ? ArrowDownRight : CheckCircle;

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-dark-700 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{analysis.symbol.toUpperCase()}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${recBg} ${recColor} flex items-center gap-1`}>
              <Icon size={14} />
              {analysis.recommendation}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-dark-700 text-slate-300 border border-dark-600">
              RISCO: {analysis.riskLevel}
            </span>
          </div>
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