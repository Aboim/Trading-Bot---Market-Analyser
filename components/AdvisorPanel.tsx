import React, { useState } from 'react';
import { Target, Calculator, PieChart, CheckCircle2, Loader2, Sparkles, Settings } from 'lucide-react';
import { generateInvestmentPlan, hasGeminiApiKey } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; 

interface AdvisorPanelProps {
  onOpenSettings: () => void;
}

export const AdvisorPanel: React.FC<AdvisorPanelProps> = ({ onOpenSettings }) => {
  const [monthly, setMonthly] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthly || !target) return;

    setLoading(true);
    const result = await generateInvestmentPlan(Number(monthly), Number(target));
    setPlan(result);
    setLoading(false);
  };

  const isOffline = !hasGeminiApiKey();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Calculator className="text-primary-500" /> Parâmetros
          </h2>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Investimento Mensal (€)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">€</span>
                <input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  placeholder="Ex: 500"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Objetivo / Meta (€)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">€</span>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Ex: 100000"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !monthly || !target}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700 disabled:text-slate-500 text-white font-bold py-3 rounded-lg mt-4 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Criando Estratégia...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Gerar Plano
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-dark-700 text-xs text-slate-500 leading-relaxed">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Cálculos baseados em taxas de juros reais.
            </p>
            <p className="flex items-start gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Sugestões personalizadas de ativos.
            </p>
            <p className="flex items-start gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Diversificação automática de risco.
            </p>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="lg:col-span-2">
        {!plan ? (
          <div className="bg-dark-800/50 rounded-xl border border-dark-700 border-dashed p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
            <Target className="w-20 h-20 text-dark-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300">Defina sua meta</h3>
            <p className="text-slate-500 max-w-md mt-2">
              Preencha os valores ao lado para que nossa IA calcule a melhor rota e os melhores ativos para atingir sua independência financeira.
            </p>
          </div>
        ) : (
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-dark-700">
               <PieChart className="w-8 h-8 text-primary-400" />
               <h2 className="text-2xl font-bold text-white">Seu Plano Personalizado</h2>
            </div>
            
            <div className="prose prose-invert prose-slate max-w-none">
              {/* Simple parser for markdown-like structure since we can't easily add deps */}
              {plan.split('\n').map((line, i) => {
                if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-primary-400 mt-6 mb-3">{line.replace('###', '')}</h3>;
                if (line.startsWith('##')) return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4 border-l-4 border-primary-500 pl-3">{line.replace('##', '')}</h2>;
                if (line.startsWith('**')) return <p key={i} className="font-bold text-slate-200 my-2">{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('-')) return <li key={i} className="text-slate-300 ml-4 mb-1 list-disc">{line.replace('-', '')}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="text-slate-300 leading-relaxed mb-2">{line.replace(/\*\*/g, '')}</p>;
              })}
            </div>

            {isOffline && (
                <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-amber-200">
                        <span className="font-bold block sm:inline mb-1 sm:mb-0">⚠️ Modo Simulação:</span> Para receber um plano personalizado com IA real, configure sua chave de API.
                    </div>
                    <button 
                        onClick={onOpenSettings}
                        className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-amber-900/20"
                    >
                        <Settings size={16} /> Configurar API Key
                    </button>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-dark-700 flex justify-end">
              <button 
                onClick={() => window.print()} 
                className="text-sm text-slate-500 hover:text-white transition-colors underline"
              >
                Imprimir / Salvar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};