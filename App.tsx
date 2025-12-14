import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, DollarSign, LineChart, Bot, BrainCircuit, X, Smartphone, Code2 } from 'lucide-react';
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
  const [showInstallModal, setShowInstallModal] = useState(false);

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
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      setShowInstallModal(true);
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
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
              InvestMind
            </span>
          </div>
          <div className="flex items-center gap-4">
             
             <div className="flex gap-2 bg-dark-800 p-1 rounded-lg border border-dark-700 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
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
                 <Bot size={14} /> <span className="hidden sm:inline">Bot</span>
               </button>
               <button 
                onClick={() => setCurrentView(ViewState.ADVISOR)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${currentView === ViewState.ADVISOR ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <BrainCircuit size={14} /> <span className="hidden sm:inline">Consultor</span>
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

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Instalar Aplicativo</h3>
              <button onClick={() => setShowInstallModal(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-primary-900/20 border border-primary-500/20 rounded-lg p-4">
                <h4 className="flex items-center gap-2 font-bold text-primary-400 mb-2">
                  <Smartphone size={18} /> Versão Rápida (PWA)
                </h4>
                <p className="text-sm text-slate-300 mb-2">
                  Instale agora sem baixar arquivos pesados. Funciona offline e é super rápido.
                </p>
                <ol className="text-xs text-slate-400 list-decimal ml-4 space-y-1">
                  <li>No seu navegador, toque em <strong>Menu</strong> (três pontos ou compartilhar).</li>
                  <li>Selecione <strong>"Adicionar à Tela Inicial"</strong> ou "Instalar Aplicativo".</li>
                </ol>
              </div>

              <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4">
                <h4 className="flex items-center gap-2 font-bold text-emerald-400 mb-2">
                  <Code2 size={18} /> Versão Nativa (APK)
                </h4>
                <p className="text-sm text-slate-300 mb-2">
                  Para desenvolvedores ou uso avançado. O projeto já está configurado.
                </p>
                <div className="bg-black rounded p-2 font-mono text-xs text-slate-400 overflow-x-auto">
                  npm install<br/>
                  npm run apk:build
                </div>
              </div>
            </div>
            <div className="p-4 bg-dark-900 text-center">
              <button 
                onClick={() => setShowInstallModal(false)}
                className="text-slate-400 hover:text-white text-sm font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}