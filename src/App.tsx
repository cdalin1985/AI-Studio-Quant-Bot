/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, googleProvider } from './lib/firebase';
import { fetchMarketData } from './market-data/index';
import { LandingPage } from './components/LandingPage';
import { Disclaimer } from './legal/Disclaimer';

interface Strategy {
  id: string;
  name: string;
  enabled: boolean;
  sharpe: number;
  winRate: number;
  maxDrawdown: number;
  trades: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activePage, setActivePage] = useState<'strategies' | 'dashboard' | 'risk'>('dashboard');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [tradingPair, setTradingPair] = useState('BTC/USD');
  const [slippage, setSlippage] = useState(0.1);
  const [commission, setCommission] = useState(0.05);
  const [fillSimulation, setFillSimulation] = useState('Immediate');
  
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);
  
  useEffect(() => {
    if (!user) {
      setStrategies([]);
      return;
    }
    const q = collection(db, `users/${user.uid}/strategies`);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newStrategies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Strategy[];
      setStrategies(newStrategies);
    });
    return () => unsubscribe();
  }, [user]);
  
  const [marketData, setMarketData] = useState({ symbol: 'BTC/USD', price: 98450.50, timestamp: Date.now() });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time market data feed
  useEffect(() => {
    const updateMarketData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchMarketData(tradingPair);
            setMarketData({ ...data, price: data.price});
        } catch (e) {
            setError('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    }
    
    updateMarketData();
    const interval = setInterval(updateMarketData, 5000);
    return () => clearInterval(interval);
  }, [tradingPair]);

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };
    
  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  const navButtonClass = (page: typeof activePage) => 
    `px-4 py-1 text-[11px] uppercase tracking-widest ${activePage === page ? 'text-emerald-500 border-b border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`;

  return (
    <div className="bg-neutral-950 text-emerald-400 min-h-screen flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-8 bg-neutral-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">QM</span>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">QuantMaster</span>
          </div>
          {user && (
            <nav className="flex gap-6">
                <button className={navButtonClass('strategies')} onClick={() => setActivePage('strategies')}>Strategies</button>
                <button className={navButtonClass('dashboard')} onClick={() => setActivePage('dashboard')}>Dashboard</button>
                <button className={navButtonClass('risk')} onClick={() => setActivePage('risk')}>Risk</button>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-6">
            {user ? (
                <div className="flex items-center gap-4">
                    <span className="text-sm text-neutral-400">{user.email}</span>
                    <button onClick={logout} className="text-sm text-emerald-600 hover:text-emerald-400">Sign Out</button>
                </div>
            ) : (
                <button onClick={login} className="text-sm bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition">Sign In</button>
            )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-y-auto">
        {!user ? (
            <LandingPage onLogin={login} />
        ) : (
            <div className="flex-1">
                {/* Pages content here ... */}
                {activePage === 'strategies' && (
                    <section className="w-full bg-neutral-950 p-8">
                      <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-wide mb-6">Strategy Management</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strategies.map(strategy => (
                          <div key={strategy.id} className="relative overflow-hidden border border-neutral-800 bg-neutral-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-sm hover:border-emerald-500/30 transition-all">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-md font-bold text-white font-display">{strategy.name}</span>
                              <button 
                                onClick={() => toggleStrategy(strategy.id)}
                                className={`px-4 py-1 text-[11px] font-bold rounded-full ${strategy.enabled ? 'bg-emerald-900/50 text-emerald-200' : 'bg-neutral-800 text-neutral-400'}`}
                              >
                                {strategy.enabled ? 'ACTIVE' : 'INACTIVE'}
                              </button>
                            </div>
                            <div className="text-xs text-neutral-400 mb-4 space-y-2 font-mono">
                              <div className="flex justify-between"><span>SHARPE</span><span className="text-emerald-300">{strategy.sharpe.toFixed(2)}</span></div>
                              <div className="flex justify-between"><span>WIN RATE</span><span className="text-emerald-300">{(strategy.winRate * 100).toFixed(0)}%</span></div>
                              <div className="flex justify-between"><span>MAX DRAWDOWN</span><span className="text-emerald-300">{(strategy.maxDrawdown * 100).toFixed(1)}%</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                )}
            </div>
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="h-10 border-t border-neutral-800 flex items-center justify-between px-8 bg-neutral-950/80 backdrop-blur-xl text-[11px] font-mono text-emerald-600">
        <div className="flex gap-6">
          <span>SYSTEM: {isRunning ? 'ENGINE_ACTIVE' : 'READY'}</span>
          <span>UPTIME: 14:22:04</span>
        </div>
      </footer>
      {user && <Disclaimer />}
    </div>
  );
}
