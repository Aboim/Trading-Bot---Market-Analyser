import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, TrendingUp, History, Wallet, AlertCircle } from 'lucide-react';
import { analyzeAsset } from '../services/geminiService';
import { AIAnalysis, Portfolio, Trade } from '../types';

interface TradingBotPanelProps {
  initialBalance?: number;
}

const WATCHLIST = ['BTC', 'ETH', 'PETR4', 'VALE3', 'AAPL', 'NVDA', 'ITUB4', 'AMZN'];

export const TradingBotPanel: React.FC<TradingBotPanelProps> = ({ initialBalance = 10000 }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('Aguardando início...');
  const [logs, setLogs] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    balance: initialBalance,
    holdings: {},
    history: []
  });

  const processingRef = useRef(false);

  // Helper to add logs with timestamp
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  const executeTrade = (analysis: AIAnalysis) => {
    const { symbol, currentPrice, recommendation } = analysis;
    if (currentPrice <= 0) {
      addLog(`ERRO: Preço inválido para ${symbol}. Ignorando.`);
      return;
    }

    setPortfolio(prev => {
      const newPortfolio = { ...prev };
      
      // LOGIC: BUY
      if (recommendation === 'COMPRA') {
        // Simple strategy: Invest 10% of available balance per trade
        const investAmount = newPortfolio.balance * 0.10;
        if (investAmount < currentPrice) {
          addLog(`ALERTA: Saldo insuficiente para comprar ${symbol}.`);
          return prev;
        }

        const quantity = Math.floor(investAmount / currentPrice);
        if (quantity > 0) {
          const totalCost = quantity * currentPrice;
          newPortfolio.balance -= totalCost;
          newPortfolio.holdings[symbol] = (newPortfolio.holdings[symbol] || 0) + quantity;
          
          const trade: Trade = {
            id: Date.now().toString(),
            symbol,
            type: 'BUY',
            price: currentPrice,
            quantity,
            timestamp: new Date(),
            total: totalCost
          };
          newPortfolio.history.unshift(trade);
          addLog(`ORDEM EXECUTADA: Compra de ${quantity}x ${symbol} a €${currentPrice.toFixed(2)}`);
        }
      } 
      // LOGIC: SELL
      else if (recommendation === 'VENDA') {
        const currentQty = newPortfolio.holdings[symbol] || 0;
        if (currentQty > 0) {
          const totalValue = currentQty * currentPrice;
          newPortfolio.balance += totalValue;
          newPortfolio.holdings[symbol] = 0; // Sell all
          
          const trade: Trade = {
            id: Date.now().toString(),
            symbol,
            type: 'SELL',
            price: currentPrice,
            quantity: currentQty,
            timestamp: new Date(),
            total: totalValue
          };
          newPortfolio.history.unshift(trade);
          addLog(`ORDEM EXECUTADA: Venda de ${currentQty}x ${symbol} a €${currentPrice.toFixed(2)}`);
        } else {
          addLog(`SINAL DE VENDA: ${symbol}, mas não há posição na carteira.`);
        }
      } else {
        addLog(`MANTER: IA decidiu não operar ${symbol} agora.`);
      }

      return newPortfolio;
    });
  };

  const runBotIteration = async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      // Pick random asset
      const symbol = WATCHLIST[Math.floor(Math.random() * WATCHLIST.length)];
      setCurrentAction(`Analisando mercado: ${symbol}...`);
      
      const analysis = await analyzeAsset(symbol);
      
      setCurrentAction(`Decisão para ${symbol}: ${analysis.recommendation} (${analysis.riskLevel})`);
      executeTrade(analysis);

    } catch (e) {
      addLog('Erro no ciclo do bot.');
    } finally {
      processingRef.current = false;
      // If still running, set status to waiting
      if (isRunning) {
        setTimeout(() => {
            if(isRunning) setCurrentAction("Escaneando próxima oportunidade...");
        }, 2000);
      }
    }
  };

  useEffect(() => {
    // Fixed: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to support browser environments where NodeJS types might be missing
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning) {
      addLog('Bot iniciado. Algoritmo de IA ativo.');
      // Run immediately
      runBotIteration();
      // Then run every 15 seconds to avoid API Rate Limits
      interval = setInterval(runBotIteration, 15000);
    } else {
      setCurrentAction('Bot pausado.');
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Calculate Net Worth
  const getEstimatedNetWorth = () => {
    // In a real app we'd need live prices for holdings, here we assume cash is main metric
    // or we could store entry price. For simplicity, we just show Balance + Estimate
    return portfolio.balance; 
  };

  const netWorth = getEstimatedNetWorth();
  const profitLoss = netWorth - initialBalance;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Control Panel & Stats */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="text-primary-500" /> Carteira
            </h2>
            <div className={`px-2 py-1 rounded text-xs font-bold ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isRunning ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm">Saldo Disponível</p>
              <p className="text-3xl font-mono text-white">€{portfolio.balance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Lucro/Prejuízo (P&L)</p>
              <p className={`text-xl font-mono ${profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profitLoss >= 0 ? '+' : ''}€{profitLoss.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                isRunning 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
              }`}
            >
              {isRunning ? <><Pause size={20} /> PAUSAR BOT</> : <><Play size={20} /> INICIAR BOT</>}
            </button>
            <p className="text-xs text-center text-slate-500 mt-3">
              *Paper Trading: Simulação sem risco real.
            </p>
          </div>
        </div>

        {/* Current Holdings */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Posições Atuais</h3>
          {Object.keys(portfolio.holdings).length === 0 ? (
            <p className="text-slate-500 text-sm italic">Nenhuma posição aberta.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(portfolio.holdings).map(([symbol, qty]) => (
                // Fixed: Cast qty to number to prevent 'Operator > cannot be applied to types unknown and number' error
                (qty as number) > 0 && (
                  <li key={symbol} className="flex justify-between items-center text-sm p-2 bg-dark-900/50 rounded">
                    <span className="font-bold text-white">{symbol}</span>
                    <span className="text-primary-400">{qty} un.</span>
                  </li>
                )
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Terminal / Logs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-black/80 rounded-xl border border-dark-700 p-4 font-mono text-sm h-64 overflow-hidden flex flex-col shadow-inner">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2 mb-2">
            <span className="text-emerald-500 flex items-center gap-2">
               <TrendingUp size={14} /> Terminal de Execução
            </span>
            <span className="text-slate-500 text-xs animate-pulse">
              {currentAction}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {logs.length === 0 && <span className="text-slate-600">Aguardando logs...</span>}
            {logs.map((log, i) => (
              <div key={i} className={`truncate ${log.includes('ORDEM') ? 'text-emerald-400' : log.includes('ALERTA') || log.includes('ERRO') ? 'text-amber-400' : 'text-slate-300'}`}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 flex-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <History size={18} className="text-primary-500"/> Histórico de Transações
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-dark-700">
                <tr>
                  <th className="pb-3 pl-2">Horário</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Ativo</th>
                  <th className="pb-3 text-right">Preço</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {portfolio.history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500">Nenhuma transação realizada ainda.</td>
                  </tr>
                ) : (
                  portfolio.history.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="group hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 pl-2 text-slate-400">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {trade.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-white">{trade.symbol}</td>
                      <td className="py-3 text-right text-slate-300">€{trade.price.toFixed(2)}</td>
                      <td className="py-3 text-right font-medium text-slate-200">€{trade.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};