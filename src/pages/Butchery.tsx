import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { MenuItem } from '../store/useStore';
import { Flame, Scale, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

export const Butchery = () => {
  const { menu, addOrder } = useStore();
  const [weight, setWeight] = useState<number>(1);
  const [selectedMeat, setSelectedMeat] = useState<MenuItem | null>(null);
  const [generatedToken, setToken] = useState<string | null>(null);

  const rawMeats = menu.filter(m => m.category === 'Raw Meat');

  const handleGenerateToken = () => {
    if (!selectedMeat || weight <= 0) return;
    
    const tokenStr = `TKN-${Math.floor(Math.random() * 1000)}`;
    
    addOrder({
      items: [{ ...selectedMeat, quantity: weight }],
      total: selectedMeat.price * weight,
      status: 'Pending',
      token: tokenStr
    });
    
    setToken(tokenStr);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-8rem)]">
      {/* Raw Meat Ordering */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Scale className="text-primary" /> Raw Meat Orders
        </h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Meat Type</label>
            <div className="grid grid-cols-2 gap-3">
              {rawMeats.map(meat => (
                <button
                  key={meat.id}
                  onClick={() => setSelectedMeat(meat)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedMeat?.id === meat.id 
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' 
                      : 'border-slate-200 hover:border-primary/50 text-slate-700'
                  }`}
                >
                  <div className="font-bold">{meat.name}</div>
                  <div className="text-sm">M{meat.price}/kg</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Weight (kg)</label>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                min="0.1" 
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {selectedMeat && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Price per kg</span>
                <span>M{selectedMeat.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2">
                <span>Estimated Total</span>
                <span>M{(selectedMeat.price * weight).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateToken}
            disabled={!selectedMeat || weight <= 0}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
          >
            <Ticket /> Generate Pickup Token
          </button>
        </div>

        {generatedToken && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary p-6 rounded-2xl shadow-lg border border-yellow-400 text-secondary-foreground flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Order Token Generated</h3>
            <div className="text-4xl font-black tracking-widest font-mono bg-white px-6 py-3 rounded-xl shadow-inner mb-2">
              {generatedToken}
            </div>
            <p className="text-sm font-medium mt-2">Customer can pick up at butchery counter</p>
            <button 
              onClick={() => setToken(null)}
              className="mt-4 text-xs underline font-bold opacity-70 hover:opacity-100"
            >
              Clear Token
            </button>
          </motion.div>
        )}
      </div>

      {/* Shisa Nyama Status */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Flame className="text-red-500" /> Shisa Nyama (Braai)
        </h2>
        <div className="flex-1 bg-slate-900 rounded-3xl shadow-xl overflow-hidden text-white flex flex-col border-4 border-slate-800 relative">
          {/* Mock Board */}
          <div className="p-6 border-b border-slate-700 bg-slate-800">
            <h3 className="font-mono text-xl font-bold tracking-widest text-slate-300">LIVE BRAAI STATUS</h3>
          </div>
          
          <div className="flex-1 p-6 flex gap-4">
            <div className="flex-1 flex flex-col gap-3">
              <h4 className="text-red-400 font-bold uppercase text-sm mb-2">On the Grill</h4>
              <div className="bg-slate-800 p-4 rounded-xl font-mono text-xl border border-slate-700 shadow-inner">#TKN-102 <span className="text-xs text-slate-400 block mt-1">Flipping...</span></div>
              <div className="bg-slate-800 p-4 rounded-xl font-mono text-xl border border-slate-700 shadow-inner">#TKN-405 <span className="text-xs text-slate-400 block mt-1">Just put on</span></div>
            </div>
            <div className="w-px bg-slate-700"></div>
            <div className="flex-1 flex flex-col gap-3">
              <h4 className="text-green-400 font-bold uppercase text-sm mb-2">Ready to Collect</h4>
              <div className="bg-green-500/20 text-green-300 p-4 rounded-xl font-mono text-2xl border border-green-500/30 animate-pulse font-black text-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">#TKN-890</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
