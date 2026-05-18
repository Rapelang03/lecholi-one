import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CreditCard, Gift, History, Award, Shirt, Trophy, Flame, Phone, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export const SupporterCard = () => {
  const { supporters, totalDonations, lookupSupporter } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [isLooking, setIsLooking] = useState(false);
  const [error, setError] = useState('');

  const supporter = activeId ? supporters.find(s => s.id === activeId) : null;

  const handleLogin = async () => {
    if (!phoneInput) return;
    setIsLooking(true);
    setError('');
    const found = await lookupSupporter(phoneInput);
    if (found) {
      setActiveId(found.id);
    } else {
      setError('No supporter found with this number.');
    }
    setIsLooking(false);
  };

  if (!supporter) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-[#f8fafc] p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter">Supporter Hub</h1>
            <p className="text-[#64748b] font-medium mt-1">Access your Digital Card</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <Phone size={18} className="text-slate-400" />
              <input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="+266 5000 0000" className="bg-transparent flex-1 py-4 text-slate-800 placeholder-slate-400 outline-none font-mono" />
            </div>
            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
            <button onClick={handleLogin} disabled={isLooking || !phoneInput} className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-black py-4 rounded-xl transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2">
              {isLooking ? '...' : <><Search size={20} /> Access Card</>}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate progress to next tier
  const nextTierPoints = supporter.tier === 'Bronze' ? 80 : supporter.tier === 'Silver' ? 200 : supporter.tier === 'Gold' ? 500 : 1000;
  const progressPercentage = Math.min((supporter.points / nextTierPoints) * 100, 100);

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: The Card & Profile */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter">Supporter Hub</h1>
            <p className="text-[#64748b] font-medium mt-1">Matlama FC "Tse Putsoa"</p>
          </div>

          {/* Digital Card */}
          <motion.div 
            initial={{ rotateY: -10, scale: 0.95, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden aspect-[1.586/1] shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] mb-2 group"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' // Deep Blue
            }}
          >
            {/* Card Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:12px_12px]" />
            
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-black text-3xl tracking-tighter text-white drop-shadow-md">TSE PUTSOA</h2>
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1">Official Member</p>
                </div>
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <img src="/assets/MATLAMA-logo.jpeg" alt="Matlama Logo" className="w-12 h-12 object-contain" onError={(e) => { e.currentTarget.style.display='none' }} />
                  <Award className="text-white w-8 h-8 opacity-80" />
                </div>
              </div>

              <div>
                <p className="font-mono text-sm tracking-widest text-blue-200 mb-1 opacity-80">{supporter.phone}</p>
                <div className="flex justify-between items-end">
                  <h3 className="font-black text-2xl uppercase tracking-wider">{supporter.name}</h3>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-blue-200">Tier</p>
                    <p className="font-bold text-white">Gold</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-[#0f172a] uppercase tracking-widest text-sm mb-4">Loyalty Progress</h3>
            <div className="flex justify-between text-sm mb-2 font-bold">
              <span className="text-[#1e3a8a]">{supporter.points} PTS</span>
              <span className="text-slate-400">Platinum: {nextTierPoints} PTS</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] h-full rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Earn {nextTierPoints - supporter.points} more points to reach Platinum tier!
            </p>
          </div>
        </div>

        {/* Right Column: Dashboard Data */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#1e3a8a] to-[#172554] p-6 rounded-3xl shadow-md border border-blue-900 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <div className="text-blue-200 bg-blue-900/50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
                  <Gift size={24} />
                </div>
                <div className="text-4xl font-black text-white">{supporter.points}</div>
                <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mt-1">Available Points</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-emerald-500 bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
                  <History size={24} />
                </div>
                <div className="text-4xl font-black text-slate-800">M{totalDonations.toFixed(2)}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Global Club Donations</div>
              </div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-[#0f172a] text-lg uppercase tracking-wider flex items-center gap-2">
                <Shirt className="text-[#1e3a8a]" /> Redeem Gear
              </h3>
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest">
                <Flame size={14} /> Hot Drops
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:border-[#3b82f6] transition-colors group cursor-pointer bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#1e3a8a] transition-colors">Official Home Jersey</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">The authentic 2026/27 Tse Putsoa home kit.</p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="font-black text-[#1e3a8a] text-xl">1200 PTS</span>
                  <button className="bg-[#1e3a8a] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl opacity-50 cursor-not-allowed">
                    Locked
                  </button>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:border-[#3b82f6] transition-colors group cursor-pointer bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#1e3a8a] transition-colors">Matlama FC Cap</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">Premium snapback with embroidered logo.</p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="font-black text-[#1e3a8a] text-xl">350 PTS</span>
                  <button className="bg-[#1e3a8a] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-colors shadow-md">
                    Redeem
                  </button>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:border-[#3b82f6] transition-colors group cursor-pointer bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#1e3a8a] transition-colors">VIP Match Ticket</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">Exclusive seating for the next derby.</p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="font-black text-[#1e3a8a] text-xl">800 PTS</span>
                  <button className="bg-[#1e3a8a] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl opacity-50 cursor-not-allowed">
                    Locked
                  </button>
                </div>
              </div>
              
              <div className="border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:border-[#3b82f6] transition-colors group cursor-pointer bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#1e3a8a] transition-colors">Training Scarf</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">Show your colors with the classic woven scarf.</p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="font-black text-[#1e3a8a] text-xl">250 PTS</span>
                  <button className="bg-[#1e3a8a] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-colors shadow-md">
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
