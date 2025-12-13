import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, DollarSign, LineChart, Download, Bot, BrainCircuit } from 'lucide-react';
import { analyzeAsset, getMarketOverview } from './services/geminiService';
import { SearchBar } from './components/SearchBar';
import { MarketCard } from './components/MarketCard';
import { SimulatedChart } from './components/SimulatedChart';
import { TradingBotPanel } from './components/TradingBotPanel';
import { AdvisorPanel } from './components/AdvisorPanel';
import { AIAnalysis, ViewState } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [marketSummary, setMarketSummary] = useState<string>('Carregando dados do mercado global...');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Load initial market overview and setup PWA install prompt
  useEffect(() => {
    const fetchOverview = async () => {
      const summary = await getMarketOverview();
      setMarketSummary(summary);
    };
    fetchOverview();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSearch = async (symbol: string) => {
    setCurrentView(ViewState.DASHBOARD); // Ensure we show the result
    setIsLoading(true);
    setCurrentAnalysis(null); 
    try {
      const result = await analyzeAsset(symbol);
      setCurrentAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 font-sans selection:bg-primary-500/30">
      {/* Navigation */}
      <nav className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView(ViewState.DASHBOARD)}>
            <div className="bg-primary-600 p-2 rounded-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              InvestMind
            </span>
          </div>
          <div className="flex items-center gap-4">
             {installPrompt && (
               <button 
                 onClick={handleInstallClick}
                 className="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-slate-600"
               >
                 <Download size={14} />
                 Instalar App
               </button>
             )}
             <div className="flex gap-2 bg-dark-800 p-1 rounded-lg border border-dark-700 overflow-x-auto">
               <button 
                onClick={() => setCurrentView(ViewState.DASHBOARD)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${currentView === ViewState.DASHBOARD ? 'bg-dark-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Analisar
               </button>
               <button 
                onClick={() => setCurrentView(ViewState.BOT)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${currentView === ViewState.BOT ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <Bot size={14} /> Trading Bot
               </button>
               <button 
                onClick={() => setCurrentView(ViewState.ADVISOR)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${currentView === ViewState.ADVISOR ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <BrainCircuit size={14} /> Consultor IA
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* VIEW: DASHBOARD (Manual Analysis) */}
        {currentView === ViewState.DASHBOARD && (
          <>
            <section className="text-center py-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Invista com a inteligência da <span className="text-primary-500">IA</span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                Analise ações, FIIs e criptomoedas em segundos. Obtenha cotações em tempo real e recomendações baseadas em dados fundamentais.
              </p>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              
              {installPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="mt-4 sm:hidden inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/20"
                >
                  <Download size={16} />
                  Instalar Aplicativo
                </button>
              )}
            </section>

            <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-dark-700 p-2 rounded-md shrink-0">
                <LayoutDashboard className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                 <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-1 block">Resumo do Mercado Hoje</span>
                 <p className="text-sm text-slate-300 leading-snug">
                   {marketSummary}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <MarketCard analysis={currentAnalysis} loading={isLoading} />
              </div>
              <div className="space-y-6">
                <SimulatedChart analysis={currentAnalysis} />
                <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                  <h3 className="text-slate-100 font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Dicas de Investimento
                  </h3>
                  <ul className="space-y-3">
                    <li className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></span>
                      Diversifique sempre sua carteira para mitigar riscos.
                    </li>
                    <li className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></span>
                      Analise o P/L (Preço sobre Lucro) antes de comprar.
                    </li>
                    <li className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></span>
                      Fique atento às taxas de juros (Selic/Fed Funds).
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-dark-700">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <LineChart className="w-4 h-4" />
                      <span>Dados fornecidos via Google Search Grounding</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW: TRADING BOT */}
        {currentView === ViewState.BOT && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Bot de Trading Automatizado</h1>
              <p className="text-slate-400">
                Este robô utiliza a API Gemini para escanear ativos da Watchlist, analisar o sentimento do mercado em tempo real e executar ordens virtuais.
              </p>
            </div>
            <TradingBotPanel />
          </div>
        )}

        {/* VIEW: ADVISOR (NEW) */}
        {currentView === ViewState.ADVISOR && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Consultor Financeiro Pessoal</h1>
              <p className="text-slate-400">
                Crie um plano sob medida. Informe quanto você pode investir e onde quer chegar, e a IA traçará a rota para sua liberdade financeira.
              </p>
            </div>
            <AdvisorPanel />
          </div>
        )}

      </main>
    </div>
  );
}