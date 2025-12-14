import CryptoJS from "crypto-js";

const BASE_URL = 'https://api.binance.com';

// Interface for API responses
interface BinanceTicker {
  symbol: string;
  price: string;
}

export const BinanceService = {
  /**
   * Obtém o preço atual de um par (Rota Pública - Sem Auth)
   */
  getTicker: async (symbol: string): Promise<number | null> => {
    try {
      // Normaliza para o padrão Binance (ex: BTC -> BTCUSDT)
      const pair = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
      
      const response = await fetch(`${BASE_URL}/api/v3/ticker/price?symbol=${pair}`);
      if (!response.ok) throw new Error('Falha ao buscar cotação');
      
      const data: BinanceTicker = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.warn("Binance API Error (provavelmente CORS ou Rede):", error);
      // Fallback para simulação para não quebrar o app
      return null;
    }
  },

  /**
   * Verifica conectividade e permissões da chave (Rota Privada - Com Auth)
   */
  checkConnection: async (apiKey: string, apiSecret: string): Promise<boolean> => {
    try {
      const endpoint = '/api/v3/account';
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString(CryptoJS.enc.Hex);

      const url = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': apiKey
        }
      });

      return response.ok;
    } catch (error) {
      console.warn("Binance Auth Error (CORS/Rede):", error);
      // Retorna false para indicar que a conexão real falhou
      return false;
    }
  },

  /**
   * Executa uma ordem de mercado (Rota Privada - Com Auth)
   */
  placeOrder: async (
    apiKey: string, 
    apiSecret: string, 
    symbol: string, 
    side: 'BUY' | 'SELL', 
    quantity: number
  ) => {
    try {
      const endpoint = '/api/v3/order';
      const pair = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
      const timestamp = Date.now();
      
      // Parâmetros obrigatórios para ordem a mercado
      const params = `symbol=${pair}&side=${side}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
      const signature = CryptoJS.HmacSHA256(params, apiSecret).toString(CryptoJS.enc.Hex);

      const url = `${BASE_URL}${endpoint}?${params}&signature=${signature}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': apiKey
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Erro ao executar ordem na Binance');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};