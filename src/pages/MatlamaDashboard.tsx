import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Supporter } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, DollarSign, TrendingUp, BarChart2, Search,
  ChevronRight, Shield, Star, Award, Activity, X, FileText, Phone, Calendar
} from 'lucide-react';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Bronze:   { bg: 'bg-orange-900/20',  text: 'text-orange-400',  border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-300' },
  Silver:   { bg: 'bg-slate-800/20',   text: 'text-slate-300',   border: 'border-slate-500/30',  badge: 'bg-slate-500/20 text-slate-200' },
  Gold:     { bg: 'bg-yellow-900/20',  text: 'text-yellow-400',  border: 'border-yellow-500/30', badge: 'bg-yellow-500/20 text-yellow-300' },
  Platinum: { bg: 'bg-cyan-900/20',    text: 'text-cyan-300',    border: 'border-cyan-500/30',   badge: 'bg-cyan-500/20 text-cyan-200' },
};

const getApiUrl = () => import.meta.env?.PROD ? '/api' : `http://${window.location.hostname}:3001/api`;

// Normalize supporter so missing fields never crash the UI
const norm = (s: any): Supporter => ({
  id: s.id ?? 'TSP-?????',
  name: s.name ?? 'Unknown',
  phone: s.phone ?? '',
  points: s.points ?? 0,
  tier: s.tier ?? 'Bronze',
  registeredAt: s.registeredAt ?? '—',
  totalSpent: s.totalSpent ?? 0,
  totalDonated: s.totalDonated ?? 0,
  transactions: Array.isArray(s.transactions) ? s.transactions : [],
});

// Safe TIER_COLORS lookup (fallback to Bronze)
const tc = (tier: string) => TIER_COLORS[tier] ?? TIER_COLORS['Bronze'];

export const MatlamaDashboard = () => {
  const { supporters, totalDonations } = useStore();
  const [search, setSearch] = useState('');
  const [selectedSupporter, setSelectedSupporter] = useState<Supporter | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [activeView, setActiveView] = useState<'overview' | 'members' | 'transactions'>('overview');

  useEffect(() => {
    fetch(`${getApiUrl()}/matlama/report`)
      .then(r => r.json())
      .then(setReportData)
      .catch(() => {});
  }, [supporters, totalDonations]);

  // Normalize all supporters coming from server
  const normalizedSupporters = supporters.map(norm);

  const filtered = normalizedSupporters.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const tierCounts = normalizedSupporters.reduce((acc, s) => {
    acc[s.tier] = (acc[s.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allTransactions = normalizedSupporters.flatMap(s =>
    s.transactions.map(tx => ({ ...tx, supporterName: s.name, supporterId: s.id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpentAllTime = normalizedSupporters.reduce((sum, s) => sum + (s.totalSpent || 0), 0);

  const statCards = [
    {
      label: 'Total Club Funds',
      value: `M${totalDonations.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign size={22} />,
      color: 'from-green-900/60 to-green-800/40',
      accent: 'text-green-400',
      border: 'border-green-700/40',
    },
    {
      label: 'Registered Members',
      value: normalizedSupporters.length,
      icon: <Users size={22} />,
      color: 'from-blue-900/60 to-blue-800/40',
      accent: 'text-blue-400',
      border: 'border-blue-700/40',
    },
    {
      label: 'Total Transactions',
      value: allTransactions.length,
      icon: <Activity size={22} />,
      color: 'from-purple-900/60 to-purple-800/40',
      accent: 'text-purple-400',
      border: 'border-purple-700/40',
    },
    {
      label: 'Total Supporter Spend',
      value: `M${totalSpentAllTime.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`,
      icon: <TrendingUp size={22} />,
      color: 'from-yellow-900/60 to-yellow-800/40',
      accent: 'text-yellow-400',
      border: 'border-yellow-700/40',
    },
  ];

  return (
    <div className="min-h-full bg-[#050a12] text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/10 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0f2348] to-[#0a1628]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,58,138,0.3)_0%,_transparent_70%)]" />
        <div className="relative z-10 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src="/assets/MATLAMA-logo.jpeg"
                alt="Matlama FC"
                className="w-20 h-20 object-contain rounded-2xl border border-white/20 bg-white/5 p-1"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#050a12] flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-black text-3xl tracking-tighter">MATLAMA FC</h1>
                <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Tse Putsoa
                </span>
              </div>
              <p className="text-blue-300 text-sm font-medium">Supporter Loyalty Portal · Powered by Lecholi</p>
            </div>
          </div>
          {/* Live ticker */}
          <div className="hidden md:flex items-center gap-3 bg-green-900/20 border border-green-700/30 rounded-2xl px-6 py-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div>
              <p className="text-green-400 font-black text-2xl">M{totalDonations.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
              <p className="text-green-600 text-xs uppercase tracking-widest font-bold">Live Club Fund</p>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="relative z-10 flex gap-1 px-8 pb-0">
          {(['overview', 'members', 'transactions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveView(tab)}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-widest rounded-t-xl transition-all border-t border-x ${
                activeView === tab
                  ? 'bg-[#050a12] text-white border-white/10'
                  : 'bg-transparent text-white/40 border-transparent hover:text-white/70'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-12">
        {/* ── OVERVIEW ──────────────────────────────────── */}
        {activeView === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, i) => (
                <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 border ${card.border} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl transform translate-x-4 -translate-y-4" />
                  <div className={`${card.accent} mb-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <p className={`font-black text-2xl ${card.accent}`}>{card.value}</p>
                  <p className="text-white/50 text-xs uppercase tracking-widest mt-1 font-bold">{card.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Tier Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Award size={20} className="text-yellow-400" /> Member Tiers</h3>
                <div className="space-y-4">
                  {(['Platinum', 'Gold', 'Silver', 'Bronze'] as const).map(tier => {
                    const count = tierCounts[tier] || 0;
                    const pct = supporters.length > 0 ? (count / supporters.length) * 100 : 0;
                    const colors = TIER_COLORS[tier];
                    return (
                      <div key={tier}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`font-bold ${colors.text}`}>{tier}</span>
                          <span className="text-white/50">{count} member{count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }}
                            className={`h-full rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top 3 Supporters */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Star size={20} className="text-yellow-400" /> Top Supporters</h3>
                <div className="space-y-3">
                  {[...normalizedSupporters].sort((a, b) => (b.totalDonated || 0) - (a.totalDonated || 0)).slice(0, 5).map((s, i) => {
                    const colors = tc(s.tier);
                    return (
                      <div key={s.id} className={`flex items-center gap-4 p-3 rounded-xl border ${colors.border} ${colors.bg}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${colors.badge}`}>
                          #{i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">{s.name}</p>
                          <p className={`text-xs font-mono ${colors.text}`}>{s.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white">M{(s.totalDonated || 0).toFixed(0)}</p>
                          <p className="text-xs text-white/40">donated</p>
                        </div>
                      </div>
                    );
                  })}
                  {normalizedSupporters.length === 0 && <p className="text-white/30 text-sm text-center py-4">No supporters yet</p>}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-lg flex items-center gap-2"><BarChart2 size={20} className="text-blue-400" /> Recent Activity</h3>
                <button onClick={() => setActiveView('transactions')} className="text-blue-400 text-sm font-bold hover:text-blue-300 flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {allTransactions.slice(0, 6).map(tx => (
                  <div key={tx.txId} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-white/40 text-xs">{tx.txId}</span>
                      <div>
                        <span className="text-white font-medium">{tx.supporterName}</span>
                        <span className="text-white/40 ml-2 text-xs">· {tx.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/60">M{tx.amount.toFixed(2)}</span>
                      <span className="text-green-400 font-bold">+M{tx.donation.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {allTransactions.length === 0 && <p className="text-white/30 text-sm text-center py-8">No transactions yet. Start selling to Tse Putsoa supporters!</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MEMBERS ──────────────────────────────────── */}
        {activeView === 'members' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4">
                <Search size={18} className="text-white/40" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, phone or ID..."
                  className="bg-transparent flex-1 py-3 text-white placeholder-white/30 outline-none" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 text-sm font-bold">
                {filtered.length} / {supporters.length} Members
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((s, i) => {
                const colors = tc(s.tier);
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedSupporter(s)}
                    className={`cursor-pointer border rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-xl ${colors.bg} ${colors.border}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${colors.badge}`}>
                          {s.name[0]}
                        </div>
                        <div>
                          <h4 className="font-black text-white">{s.name}</h4>
                          <p className={`text-xs font-mono ${colors.text}`}>{s.id}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}>{s.tier}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="font-black text-white">{s.points}</p>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Points</p>
                      </div>
                      <div>
                        <p className="font-black text-white">M{(s.totalDonated || 0).toFixed(0)}</p>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Donated</p>
                      </div>
                      <div>
                        <p className="font-black text-white">{s.transactions.length}</p>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Visits</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-white/40 text-xs">
                      <Calendar size={12} />
                      <span>Joined {s.registeredAt}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-white/30">
                <Users size={48} className="mx-auto mb-4 opacity-30" />
                <p className="uppercase tracking-widest text-sm">No members found</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TRANSACTIONS ─────────────────────────────── */}
        {activeView === 'transactions' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-lg flex items-center gap-2"><FileText size={20} className="text-blue-400" /> All Transactions ({allTransactions.length})</h3>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-xs">
                    <th className="text-left p-4 font-bold">Tx ID</th>
                    <th className="text-left p-4 font-bold">Supporter</th>
                    <th className="text-left p-4 font-bold hidden md:table-cell">Items</th>
                    <th className="text-left p-4 font-bold">Date</th>
                    <th className="text-right p-4 font-bold">Purchase</th>
                    <th className="text-right p-4 font-bold">Donation</th>
                    <th className="text-right p-4 font-bold">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((tx, i) => (
                    <tr key={tx.txId} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                      <td className="p-4 font-mono text-white/50 text-xs">{tx.txId}</td>
                      <td className="p-4">
                        <p className="font-bold text-white">{tx.supporterName}</p>
                        <p className="text-xs text-white/40 font-mono">{tx.supporterId}</p>
                      </td>
                      <td className="p-4 text-white/50 text-xs hidden md:table-cell max-w-[200px]">
                        <span className="line-clamp-1">{tx.items}</span>
                      </td>
                      <td className="p-4 text-white/60">{tx.date}</td>
                      <td className="p-4 text-right font-bold text-white">M{tx.amount.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-green-400">M{tx.donation.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-yellow-400">+{tx.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allTransactions.length === 0 && (
                <div className="text-center py-20 text-white/30">
                  <Activity size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="uppercase tracking-widest text-sm">No transactions recorded yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Member Detail Drawer ──────────────────────── */}
      <AnimatePresence>
        {selectedSupporter && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => setSelectedSupporter(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0f1e] border-l border-white/10 z-50 overflow-y-auto">
              {(() => {
                const s = norm(selectedSupporter);
                const colors = tc(s.tier);
                const nextTierPoints = s.tier === 'Bronze' ? 80 : s.tier === 'Silver' ? 200 : s.tier === 'Gold' ? 500 : 999;
                const progress = Math.min((s.points / nextTierPoints) * 100, 100);
                return (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-xl">Member Profile</h3>
                      <button onClick={() => setSelectedSupporter(null)} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
                    </div>

                    {/* Digital Card */}
                    <div className={`rounded-2xl p-6 mb-6 border ${colors.border} bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:12px_12px]" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Tse Putsoa Member</p>
                            <h2 className="font-black text-2xl text-white">{s.name}</h2>
                          </div>
                          <img src="/assets/MATLAMA-logo.jpeg" alt="Matlama" className="w-12 h-12 object-contain opacity-90"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Phone size={14} className="text-blue-400" />
                          <span className="font-mono text-blue-200 text-sm">{s.phone}</span>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="font-mono text-xs text-blue-400">{s.id}</p>
                            <p className="font-mono text-xs text-blue-500">Since {s.registeredAt}</p>
                          </div>
                          <span className={`font-black text-lg ${colors.text}`}>{s.tier}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { label: 'Points', value: s.points, color: 'text-yellow-400' },
                        { label: 'Donated', value: `M${(s.totalDonated||0).toFixed(0)}`, color: 'text-green-400' },
                        { label: 'Total Spend', value: `M${(s.totalSpent||0).toFixed(0)}`, color: 'text-blue-400' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                          <p className={`font-black text-xl ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className={`font-bold ${colors.text}`}>{s.points} pts</span>
                        <span className="text-white/40">Next tier: {nextTierPoints} pts</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }}
                          className={`h-full rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                      </div>
                    </div>

                    {/* Transactions */}
                    <h4 className="font-black text-sm uppercase tracking-widest text-white/60 mb-3">Transaction History</h4>
                    <div className="space-y-2">
                      {s.transactions.length === 0 && (
                        <p className="text-white/30 text-sm text-center py-6">No transactions yet</p>
                      )}
                      {s.transactions.map(tx => (
                        <div key={tx.txId} className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs text-white/40">{tx.txId}</span>
                            <span className="text-xs text-white/50">{tx.date}</span>
                          </div>
                          <p className="text-white/60 text-xs mb-3 line-clamp-1">{tx.items}</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">M{tx.amount.toFixed(2)}</span>
                            <span className="text-green-400 font-bold">+M{tx.donation.toFixed(2)} donated</span>
                            <span className="text-yellow-400 font-bold">+{tx.points} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
