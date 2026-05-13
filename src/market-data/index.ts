export const fetchMarketData = async (symbol: string, provider: 'alpaca' | 'yahoo' = 'yahoo') => {
  console.log(`Fetching market data for ${symbol} using ${provider}`);
  try {
    // Simulate API call
    return { symbol, price: 100 + Math.random() * 100, timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    throw error;
  }
};
