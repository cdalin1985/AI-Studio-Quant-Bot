
import { useState } from 'react';
import { Disclaimer } from '../legal/Disclaimer';

interface Props {
  onLogin: () => void;
}

export const LandingPage = ({ onLogin }: Props) => {
  return (
    <div className="flex-1 flex flex-col items-center bg-neutral-950 text-emerald-400">
      <div className="max-w-5xl w-full p-16 text-center mt-16 bg-neutral-900/60 backdrop-blur-3xl border border-neutral-800 rounded-3xl">
        <h1 className="text-6xl font-display font-bold mb-8 tracking-tight text-white">
          Professional Trading <span className="text-emerald-500">Intelligence</span>
        </h1>
        <p className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Deploy advanced algorithmic strategies, monitor real-time risk, and optimize performance with professional-grade analysis.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { title: 'Advanced Backtesting', desc: 'Precision simulation with multi-variable metrics.' },
            { title: 'Real-Time Analytics', desc: 'Instant insights into your trading performance.' },
            { title: 'Automated Risk Control', desc: 'Sophisticated tools to protect your capital.' }
          ].map(feature => (
            <div key={feature.title} className="relative overflow-hidden border border-neutral-800 bg-neutral-900/60 p-8 rounded-3xl backdrop-blur-xl hover:border-emerald-500/30 transition-all">
              <h3 className="font-display font-semibold text-xl mb-3 text-white">{feature.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-sans">{feature.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-12">
          <button 
            onClick={onLogin} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-10 rounded-full text-lg shadow-xl shadow-emerald-900/20 hover:shadow-2xl transition-all mb-4"
          >
            Access QuantMaster
          </button>
          <p className="text-sm text-neutral-500">One-time license purchase. Secure authentication.</p>
        </div>
      </div>
      <div className="w-full">
         <Disclaimer />
      </div>
    </div>
  );
};
