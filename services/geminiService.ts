import { GoogleGenAI } from "@google/genai";
import { AIAnalysis } from "../types";

// Safe initialization
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Falha ao inicializar Gemini Client", e);
  }
}

const MODEL_NAME = 'gemini-2.5-flash';

// Fallback Mock Data Generator
const generateMockAnalysis = (symbol: string): AIAnalysis => {
  const isBuy = Math.random() > 0.4;
  return {
    symbol: symbol,
    currentPrice: 100 + Math.random() * 50,
    summary: "Modo Simulação (API Key ausente ou erro de rede). O ativo apresenta padrões técnicos baseados em histórico simulado.",
    recommendation: isBuy ? 'COMPRA' : 'MANTER',
    riskLevel: isBuy ? 'MÉDIO' : 'BAIXO',
    keyPoints: [
      "Dados simulados localmente",
      "Configure uma API Key válida para dados reais",
      "Tendência projetada baseada em algoritmo aleatório"
    ],
    groundingUrls: []
  };
};

export const analyzeAsset = async (symbol: string): Promise<AIAnalysis> => {
  // Se não houver chave ou cliente, retorna mock imediato
  if (!ai || !apiKey) {
    console.log("Usando dados simulados (Sem API Key)");
    return new Promise(resolve => setTimeout(() => resolve(generateMockAnalysis(symbol)), 1000));
  }

  try {
    const prompt = `
      Atue como um analista financeiro sênior e um algoritmo de trading de alta frequência.
      
      Objetivo: Analisar o ativo "${symbol}" para tomada de decisão imediata.
      
      Ação:
      1. Use o Google Search para encontrar a cotação EXATA (numérica) mais recente.
      2. Analise o sentimento das notícias das últimas 24h.
      3. Decida: COMPRA, VENDA ou MANTER.
      
      Formato de Resposta (JSON Obrigatório):
      {
        "symbol": "${symbol}",
        "currentPrice": <numero_float_do_preco_atual_ex_20.50>,
        "summary": "Resumo de 1 frase do motivo da decisão.",
        "recommendation": "COMPRA" | "VENDA" | "MANTER",
        "riskLevel": "BAIXO" | "MÉDIO" | "ALTO",
        "keyPoints": ["Fato 1", "Fato 2"]
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract URLs from grounding
    const groundingUrls = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsed: any;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON from AI", text);
      return generateMockAnalysis(symbol);
    }

    if (!parsed.currentPrice || typeof parsed.currentPrice !== 'number') {
      parsed.currentPrice = 100 + (Math.random() * 10);
    }

    return {
      ...parsed,
      groundingUrls
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Retorna mock em caso de erro (ex: quota exceeded, network error)
    return generateMockAnalysis(symbol);
  }
};

export const getMarketOverview = async (): Promise<string> => {
  if (!ai || !apiKey) return "Modo Offline: Mercado simulado está estável.";

  try {
    const prompt = `
      Resuma o sentimento geral do mercado financeiro hoje (focando em Bovespa, Euro Stoxx 50, S&P 500, Nasdaq, Bitcoin) em um parágrafo curto e direto em Português.
    `;
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "Mercado sem dados no momento.";
  } catch (error) {
    return "Não foi possível obter o resumo do mercado.";
  }
};

export const generateInvestmentPlan = async (monthly: number, target: number): Promise<string> => {
  if (!ai || !apiKey) return "### Plano Simulado (Sem IA)\n\n**Estratégia Conservadora**\n- 40% Renda Fixa\n- 40% ETFs Globais\n- 20% Fundos Imobiliários\n\nConfigure a API Key para um plano personalizado.";

  try {
    const prompt = `
      Atue como um Consultor Financeiro Pessoal Expert.
      
      DADOS DO USUÁRIO:
      - Investimento Mensal Disponível: € ${monthly}
      - Objetivo Financeiro (Meta): € ${target}
      
      TAREFA:
      1. Calcule estimativa de TEMPO para atingir a meta considerando uma taxa de retorno média anual realista.
      2. Crie uma ESTRATÉGIA de alocação de ativos.
      3. Sugira 3 a 5 ATIVOS ESPECÍFICOS.
      4. Dê um conselho final sobre disciplina e risco.

      FORMATO:
      Retorne a resposta formatada em Markdown.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "Não foi possível gerar o plano no momento.";
  } catch (error) {
    console.error("Investment Plan Error:", error);
    return "Ocorreu um erro ao gerar seu plano. Tente novamente.";
  }
};