import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { MenuItem, OrderItem, Supporter } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Gift, History, Award, Utensils, Phone, Search, User, 
  ArrowRightLeft, LogOut, MapPin, ShoppingCart, Plus, Minus, Check, 
  Trash2, X, Star, Sparkles, UserPlus, Info, CheckCircle2, Ticket
} from 'lucide-react';

const CATEGORIES = ['Combos', 'Beverages', 'Grills', 'Burgers', 'Pasta & Seafood', 'Pizza', 'Salads'] as const;
type Category = typeof CATEGORIES[number];

const TIER_DETAILS = {
  Bronze: { color: 'text-orange-400 border-orange-400/20 bg-orange-950/20', nextPoints: 80, badge: '🥉' },
  Silver: { color: 'text-slate-300 border-slate-300/20 bg-slate-900/20', nextPoints: 200, badge: '🥈' },
  Gold: { color: 'text-yellow-400 border-yellow-400/20 bg-yellow-950/20', nextPoints: 500, badge: '🥇' },
  Platinum: { color: 'text-cyan-300 border-cyan-300/20 bg-cyan-950/20', nextPoints: 1000, badge: '💎' },
};

export const CustomerDashboard = () => {
  const { 
    supporters, menu, orders, activeCustomerId, setActiveCustomerId, setCurrentRole,
    lookupSupporter, registerSupporter, convertPointsToCash, placeCustomerOrder, updateCustomerProfile
  } = useStore();

  // Auth State
  const [phoneInput, setPhoneInput] = useState('');
  const [isLooking, setIsLooking] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Dashboard Navigation
  const [activeTab, setActiveTab] = useState<'wallet' | 'order' | 'history' | 'profile'>('wallet');

  // Point Conversion State
  const [pointsToConvert, setPointsToConvert] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);

  // Cart State
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [menuTab, setMenuTab] = useState<Category>('Combos');
  const [orderType, setOrderType] = useState<'Takeaway' | 'Dine-in'>('Dine-in');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Wallet'>('Wallet');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ id: string } | null>(null);

  // Edit Profile State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Find active customer object
  const customer = activeCustomerId ? supporters.find(s => s.id === activeCustomerId) : null;

  // Sync profile details if customer loads
  useEffect(() => {
    if (customer) {
      setEditName(customer.name);
      setEditPhone(customer.phone);
    }
  }, [customer]);

  // Sync role to Customer when this dashboard is mounted & logged in
  useEffect(() => {
    if (customer) {
      setCurrentRole('Customer');
    }
  }, [customer, setCurrentRole]);

  // Auth Actions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    setIsLooking(true);
    setAuthError('');
    const found = await lookupSupporter(phoneInput.trim());
    if (found) {
      setActiveCustomerId(found.id);
      setCurrentRole('Customer');
    } else {
      setAuthError('No member registered with this phone number. Would you like to sign up?');
      setRegPhone(phoneInput);
    }
    setIsLooking(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) return;
    setIsLooking(true);
    setAuthError('');
    const created = await registerSupporter(regName.trim(), regPhone.trim());
    if (created) {
      setActiveCustomerId(created.id);
      setCurrentRole('Customer');
      setShowRegForm(false);
    } else {
      setAuthError('Failed to register. Please try another phone number.');
    }
    setIsLooking(false);
  };

  const handleLogout = () => {
    setActiveCustomerId(null);
    setCurrentRole(null);
    setPhoneInput('');
    setCart([]);
  };

  // Convert Actions
  const handleConversion = async () => {
    if (!customer || pointsToConvert <= 0 || pointsToConvert > customer.points) return;
    setIsConverting(true);
    await convertPointsToCash(customer.id, pointsToConvert);
    setIsConverting(false);
    setPointsToConvert(0);
    setConversionSuccess(true);
    setTimeout(() => setConversionSuccess(false), 3000);
  };

  // Cart Actions
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.item.id === id) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean) as { item: MenuItem; quantity: number }[];
    });
  };

  // Checkout Actions
  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !customer) return;
    
    const subtotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
    const vat = subtotal * 0.15;
    const donation = subtotal * 0.05; // 5% support fund
    const grandTotal = subtotal + vat;

    if (paymentMethod === 'Wallet' && (customer.walletBalance || 0) < grandTotal) {
      alert(`Insufficient wallet balance. You need M${grandTotal.toFixed(2)} but only have M${(customer.walletBalance || 0).toFixed(2)}.`);
      return;
    }

    setIsPlacingOrder(true);
    const orderItems: OrderItem[] = cart.map(c => ({
      ...c.item,
      quantity: c.quantity
    }));

    await placeCustomerOrder({
      supporterId: customer.id,
      items: orderItems,
      total: grandTotal,
      type: orderType,
      tableNumber: orderType === 'Dine-in' ? tableNumber : undefined,
      paymentMethod,
      donationAmount: donation
    });

    setCart([]);
    setIsPlacingOrder(false);
    setOrderSuccess({ id: Math.random().toString(36).substr(2, 6).toUpperCase() });
  };

  // Profile Updates
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !editName.trim() || !editPhone.trim()) return;
    await updateCustomerProfile(customer.id, editName.trim(), editPhone.trim());
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // Auth Screen if not logged in
  if (!customer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-3xl p-8 shadow-2xl border border-border w-full max-w-md relative overflow-hidden"
        >
          {/* Neon accent background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="text-center mb-8 relative z-10">
            <div className="mx-auto w-16 h-16 bg-[#1e3a8a]/20 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-[#3b82f6]">
              <Award size={36} className="text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Matlama FC</h1>
            <p className="text-primary font-bold tracking-widest text-xs uppercase mt-1">Tse Putsoa Loyalty System</p>
          </div>

          {!showRegForm ? (
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Enter phone number</label>
                <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 focus-within:border-primary/50 transition-all">
                  <Phone size={18} className="text-muted-foreground" />
                  <input
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="+266 5000 0000"
                    required
                    className="bg-transparent flex-1 py-4 text-foreground placeholder-muted-foreground outline-none font-mono"
                  />
                </div>
              </div>

              {authError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold p-3.5 rounded-xl text-center">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLooking || !phoneInput}
                className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-black py-4 rounded-xl transition-all uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
              >
                {isLooking ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => { setShowRegForm(true); setAuthError(''); }}
                  className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  Create Loyalty Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 relative z-10">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-primary/80 mb-4 flex gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>Welcome! Creating a loyalty card gives you automatic points cashback (M50 spent = 1 Point) and a 5% donation support towards Tse Putsoa fund on every order.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Full Name</label>
                <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 focus-within:border-primary/50 transition-all">
                  <User size={18} className="text-muted-foreground" />
                  <input
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Thabo Ntsane"
                    required
                    className="bg-transparent flex-1 py-3 text-foreground placeholder-muted-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Phone Number</label>
                <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 focus-within:border-primary/50 transition-all">
                  <Phone size={18} className="text-muted-foreground" />
                  <input
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+266 5873 1332"
                    required
                    className="bg-transparent flex-1 py-3 text-foreground placeholder-muted-foreground outline-none font-mono"
                  />
                </div>
              </div>

              {authError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold p-3 rounded-xl text-center">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLooking || !regName || !regPhone}
                className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-black py-4 rounded-xl transition-all uppercase tracking-wider disabled:opacity-50 shadow-lg shadow-blue-900/30"
              >
                {isLooking ? 'Registering...' : 'Register Supporter Card'}
              </button>

              <button
                type="button"
                onClick={() => { setShowRegForm(false); setAuthError(''); }}
                className="w-full text-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground mt-4 block py-2"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  // Calculate Progress to next tier
  const tierInfo = TIER_DETAILS[customer.tier] || TIER_DETAILS.Bronze;
  const progressPercentage = Math.min((customer.points / tierInfo.nextPoints) * 100, 100);
  const pointsRemaining = Math.max(tierInfo.nextPoints - customer.points, 0);

  // Filter menu
  const displayedMenu = menu.filter(item => item.category === menuTab);

  // Filter user orders
  const customerOrders = orders.filter(o => o.supporterId === customer.id);

  return (
    <div className="min-h-screen py-4 md:py-8 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Banner with Profile Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-3xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-md">
              <User size={28} className="text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-foreground uppercase tracking-wide">{customer.name}</h1>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${tierInfo.color}`}>
                  {tierInfo.badge} {customer.tier}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{customer.id} · {customer.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Tse Putsoa loyalty fund</span>
              <span className="text-xs text-emerald-400 font-bold">5% Support Contribution Applied</span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto sm:ml-0 flex items-center gap-2 bg-[#1f1f1f] hover:bg-red-500/10 hover:text-red-400 border border-border px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-border mb-8 overflow-x-auto gap-2 scrollbar-hide pb-1">
          {[
            { id: 'wallet', label: 'Wallet & Points', icon: CreditCard },
            { id: 'order', label: 'Buy & Order Food', icon: Utensils },
            { id: 'history', label: 'Order History', icon: History },
            { id: 'profile', label: 'Edit Profile', icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setOrderSuccess(null); }}
              className={`flex items-center gap-2.5 px-6 py-4 border-b-2 font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Tabs Container */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: WALLET & POINTS */}
          {activeTab === 'wallet' && (
            <motion.div
              key="wallet-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Digital Card & Tier progress */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* VIP Digital Loyalty Card */}
                <div 
                  className="relative rounded-3xl overflow-hidden aspect-[1.586/1] shadow-[0_20px_50px_-20px_rgba(30,58,138,0.5)] border border-blue-500/20 group"
                  style={{
                    background: 'linear-gradient(135deg, #020617 0%, #1e3a8a 100%)'
                  }}
                >
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:12px_12px]" />
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-all duration-700" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-black text-2xl tracking-tighter text-white uppercase drop-shadow-md">Tse Putsoa</h2>
                        <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mt-1">Official Member Card</p>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 backdrop-blur-sm shadow-inner shrink-0">
                        <img 
                          src="/assets/MATLAMA-logo.jpeg" 
                          alt="Matlama" 
                          className="w-10 h-10 object-contain rounded"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                        />
                        <Award className="text-white w-6 h-6 opacity-75" />
                      </div>
                    </div>

                    <div>
                      <p className="font-mono text-xs tracking-widest text-blue-200 mb-1 opacity-80">{customer.phone}</p>
                      <div className="flex justify-between items-end">
                        <h3 className="font-black text-lg uppercase tracking-wider truncate max-w-[150px]">{customer.name}</h3>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] uppercase tracking-widest text-blue-300 font-bold">Loyalty Tier</p>
                          <p className="font-black text-white text-sm uppercase">{customer.tier}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar to next tier */}
                <div className="bg-card border border-border rounded-3xl p-6">
                  <div className="flex justify-between items-center text-xs font-bold mb-3 uppercase tracking-wider">
                    <span className="text-primary">{customer.points} Points Earned</span>
                    <span className="text-muted-foreground">Next Tier: {tierInfo.nextPoints} pts</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-primary to-yellow-300 h-full rounded-full"
                    />
                  </div>

                  {pointsRemaining > 0 ? (
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Earn <span className="text-primary font-bold">{pointsRemaining} more points</span> to level up your tier!
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-400 font-bold mt-4 text-center flex items-center justify-center gap-1">
                      <Sparkles size={14} /> You've reached the highest tier!
                    </p>
                  )}
                </div>

              </div>

              {/* Right Columns: Wallet balance & Conversion */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Stats Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Points Balance */}
                  <div className="bg-gradient-to-br from-card to-card border border-border p-6 rounded-3xl flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl transform translate-y-1/3 translate-x-1/3" />
                    <div>
                      <div className="text-primary bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-primary/20 shrink-0">
                        <Gift size={24} />
                      </div>
                      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Loyalty Points</div>
                      <div className="text-4xl font-black text-foreground mt-1">{customer.points}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground self-end font-semibold">
                      Earned from buying food
                    </div>
                  </div>

                  {/* Cash Wallet Balance */}
                  <div className="bg-gradient-to-br from-[#111827] to-card border border-blue-900/30 p-6 rounded-3xl flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl transform translate-y-1/3 translate-x-1/3" />
                    <div>
                      <div className="text-blue-400 bg-blue-950/40 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20 shrink-0">
                        <CreditCard size={24} />
                      </div>
                      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Wallet Balance</div>
                      <div className="text-4xl font-black text-blue-400 mt-1">M{(customer.walletBalance || 0).toFixed(2)}</div>
                    </div>
                    <div className="text-right text-xs text-blue-300/70 self-end font-semibold">
                      Available for buying food
                    </div>
                  </div>

                </div>

                {/* Points to Cash Conversion Section */}
                <div className="bg-card border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <ArrowRightLeft className="text-primary" size={24} />
                    <h3 className="font-black text-lg text-foreground uppercase tracking-wide">Convert Loyalty Points to Cash</h3>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-2xl p-4 text-xs text-muted-foreground mb-6 flex gap-3">
                    <Info size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">Rule of conversion:</p>
                      <p className="mt-1">Loyalty points can be converted directly into your Loti (M) cash wallet balance. The rate is exactly <span className="text-primary font-bold">1 Point = M1.00 Cash</span>. Converted cash can be used immediately to place orders!</p>
                    </div>
                  </div>

                  {conversionSuccess && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold p-4 rounded-xl text-center mb-6"
                    >
                      🎉 Points converted successfully! Your wallet has been credited.
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground mb-2 tracking-wider">
                        <span>Select Points to convert</span>
                        <span>Max Available: {customer.points} PTS</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max={customer.points}
                          step="1"
                          value={pointsToConvert}
                          onChange={e => setPointsToConvert(parseInt(e.target.value) || 0)}
                          className="flex-1 accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-24 shrink-0 bg-background border border-border rounded-xl px-3 py-2 flex items-center justify-center font-bold text-lg font-mono">
                          {pointsToConvert}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-6">
                      <div className="text-sm font-bold text-muted-foreground">
                        You will receive: <span className="text-emerald-400 font-mono text-lg font-black">M{pointsToConvert.toFixed(2)} Cash</span>
                      </div>
                      <button
                        onClick={handleConversion}
                        disabled={pointsToConvert <= 0 || isConverting}
                        className="bg-primary text-primary-foreground font-black px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/10"
                      >
                        {isConverting ? 'Converting...' : <><ArrowRightLeft size={16} /> Convert to Cash</>}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: BUY & ORDER FOOD */}
          {activeTab === 'order' && (
            <motion.div
              key="order-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              
              {/* Left Column: Category selector and Menu Grid */}
              <div className="flex-1 space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Utensils className="text-primary" /> Browse Menu
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">Select categories below</span>
                </div>

                {/* Categories Tab Selector */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0 border-b border-border">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMenuTab(cat)}
                      className={`whitespace-nowrap px-4 py-2 border rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                        menuTab === cat
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Menu items listing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayedMenu.map(item => (
                    <div 
                      key={item.id}
                      className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-primary transition-all group"
                    >
                      <div>
                        {/* Mock Image Holder */}
                        <div className="w-full aspect-[4/3] rounded-xl bg-muted overflow-hidden relative mb-4">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-350 opacity-80"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-25">
                              Lecholi Dish
                            </div>
                          )}
                          {item.stock <= item.minStock && (
                            <span className="absolute top-2 left-2 bg-secondary text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0">
                              Low Stock ({item.stock})
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-foreground text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 uppercase tracking-wide">
                          Lecholi Family Premium Quality
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-6 border-t border-border/50 pt-3">
                        <span className="font-mono font-black text-primary text-base">M{item.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={item.stock <= 0}
                          className="bg-[#1f1f1f] hover:bg-primary hover:text-primary-foreground border border-border group-hover:border-primary text-foreground text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all disabled:opacity-50 shrink-0"
                        >
                          {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {displayedMenu.length === 0 && (
                    <div className="col-span-full py-16 text-center text-muted-foreground">
                      <p className="font-bold text-lg">No items available in this category.</p>
                      <p className="text-xs mt-1">Please try another selector.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Checkout Drawer / Shopping Cart */}
              <div className="w-full lg:w-96 shrink-0 space-y-6">
                
                {/* Success Screen */}
                {orderSuccess && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-card border-2 border-emerald-500 rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="font-black text-lg text-foreground uppercase tracking-wide">Order Placed!</h3>
                    <p className="text-xs text-muted-foreground mt-2">Your order is pending in the kitchen. Enjoy your meal!</p>
                    
                    <div className="bg-muted border border-border rounded-xl p-3 my-4 font-mono text-sm font-bold flex justify-between items-center">
                      <span className="text-muted-foreground uppercase text-xs">Order Code</span>
                      <span className="text-primary">{orderSuccess.id}</span>
                    </div>

                    <button
                      onClick={() => setOrderSuccess(null)}
                      className="w-full bg-[#1e3a8a] text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
                    >
                      Order Something Else
                    </button>
                  </motion.div>
                )}

                {/* Main Cart Box */}
                {!orderSuccess && (
                  <div className="bg-card border border-border rounded-3xl p-6 flex flex-col h-full max-h-[85vh] sticky top-24">
                    <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                      <h3 className="font-black text-sm text-foreground uppercase tracking-widest flex items-center gap-2">
                        <ShoppingCart size={18} className="text-primary" /> My Cart
                      </h3>
                      <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0">
                        {cart.reduce((sum, c) => sum + c.quantity, 0)} Items
                      </span>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 min-h-[150px] max-h-[250px]">
                      {cart.length === 0 && (
                        <div className="h-32 flex flex-col items-center justify-center text-muted-foreground text-center">
                          <ShoppingCart size={36} className="opacity-20 mb-2" />
                          <p className="text-xs font-bold uppercase tracking-wider italic text-border">Your cart is empty</p>
                        </div>
                      )}
                      
                      {cart.map(c => (
                        <div key={c.item.id} className="flex items-center justify-between border-b border-border/30 pb-3 gap-3">
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-foreground text-xs truncate">{c.item.name}</h5>
                            <span className="font-mono text-[10px] text-primary font-bold">M{c.item.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => updateCartQty(c.item.id, -1)}
                              className="w-7 h-7 bg-background border border-border rounded-lg flex items-center justify-center hover:border-primary text-muted-foreground hover:text-foreground transition-all"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-mono font-bold text-xs w-6 text-center">{c.quantity}</span>
                            <button
                              onClick={() => updateCartQty(c.item.id, 1)}
                              className="w-7 h-7 bg-background border border-border rounded-lg flex items-center justify-center hover:border-primary text-muted-foreground hover:text-foreground transition-all"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Details & Checkout Selection */}
                    {cart.length > 0 && (
                      <div className="border-t border-border pt-4 space-y-4 text-xs font-bold">
                        
                        {/* Order Type */}
                        <div>
                          <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-2">Order Method</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setOrderType('Dine-in')}
                              className={`py-2 px-3 border rounded-xl transition-all uppercase tracking-wider text-[10px] ${
                                orderType === 'Dine-in'
                                  ? 'bg-[#1e3a8a]/20 border-blue-500/50 text-blue-300'
                                  : 'bg-background border-border text-muted-foreground'
                              }`}
                            >
                              Dine-in
                            </button>
                            <button
                              onClick={() => setOrderType('Takeaway')}
                              className={`py-2 px-3 border rounded-xl transition-all uppercase tracking-wider text-[10px] ${
                                orderType === 'Takeaway'
                                  ? 'bg-[#1e3a8a]/20 border-blue-500/50 text-blue-300'
                                  : 'bg-background border-border text-muted-foreground'
                              }`}
                            >
                              Takeaway
                            </button>
                          </div>
                        </div>

                        {/* Dine-in Table selection */}
                        {orderType === 'Dine-in' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-2">Select Restaurant Table</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                                <button
                                  key={num}
                                  onClick={() => setTableNumber(num)}
                                  className={`py-1.5 border rounded-lg text-xs font-mono transition-all font-bold ${
                                    tableNumber === num
                                      ? 'bg-primary border-primary text-primary-foreground'
                                      : 'bg-background border-border text-muted-foreground'
                                  }`}
                                >
                                  T{num}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Payment Selection */}
                        <div>
                          <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-2 font-black">Payment Method</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setPaymentMethod('Wallet')}
                              className={`py-2.5 border rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                                paymentMethod === 'Wallet'
                                  ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                                  : 'bg-background border-border text-muted-foreground'
                              }`}
                            >
                              <span className="uppercase tracking-wider text-[9px]">Loyalty Wallet</span>
                              <span className="text-[10px] font-mono opacity-80">(M{(customer.walletBalance || 0).toFixed(2)})</span>
                            </button>
                            <button
                              onClick={() => setPaymentMethod('Cash')}
                              className={`py-2.5 border rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                                paymentMethod === 'Cash'
                                  ? 'bg-[#1f1f1f] border-border text-foreground'
                                  : 'bg-background border-border text-muted-foreground'
                              }`}
                            >
                              <span className="uppercase tracking-wider text-[9px]">Cash / Card</span>
                              <span className="text-[10px] opacity-80">(Pay at Cashier)</span>
                            </button>
                          </div>
                        </div>

                        {/* Totals Breakdown */}
                        <div className="bg-background border border-border/80 rounded-2xl p-4 space-y-2.5 font-mono text-[11px] font-medium text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>M{cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAT (15%)</span>
                            <span>M{(cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0) * 0.15).toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between text-emerald-400 font-bold border-t border-border/50 pt-2 text-[10px]">
                            <span className="flex items-center gap-1">🛡️ Tse Putsoa Fund</span>
                            <span>M{(cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0) * 0.05).toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between text-primary font-black text-sm border-t border-border pt-2.5 mt-2.5">
                            <span className="uppercase text-xs font-black font-sans">Total Due</span>
                            <span>M{(cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0) * 1.15).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Order button */}
                        <button
                          onClick={handlePlaceOrder}
                          disabled={isPlacingOrder}
                          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                        >
                          {isPlacingOrder ? 'Submitting Order...' : 'Place Order'}
                        </button>

                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 3: ORDER HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <h3 className="font-black text-lg text-foreground uppercase tracking-wide flex items-center gap-2">
                <History className="text-primary" /> Loyalty Ledger & History
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Order history */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-black text-sm text-muted-foreground uppercase tracking-widest">Active & Past Orders</h4>
                  
                  {customerOrders.length === 0 ? (
                    <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground">
                      <Ticket size={48} className="opacity-10 mx-auto mb-4" />
                      <p className="font-bold text-sm uppercase tracking-wider italic text-border">No orders found.</p>
                      <p className="text-xs mt-1">Place an order in the menu to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerOrders.map(order => (
                        <div key={order.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-black text-primary">Order #{order.id}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                                order.status === 'Pending' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                order.status === 'Preparing' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                                order.status === 'Ready' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                'bg-card border-border text-muted-foreground'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                              {new Date(order.timestamp).toLocaleString()} · {order.type} {order.tableNumber ? `(Table ${order.tableNumber})` : ''}
                            </p>
                          </div>
                          
                          <div className="text-right self-end md:self-center shrink-0">
                            <span className="block font-mono font-black text-foreground text-sm">M{order.total.toFixed(2)}</span>
                            <span className="block text-[9px] text-muted-foreground mt-0.5">Paid via {order.paymentMethod || 'Cash/Card'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Ledger Transactions */}
                <div className="lg:col-span-1 space-y-4">
                  <h4 className="font-black text-sm text-muted-foreground uppercase tracking-widest">Points & Wallet Ledger</h4>

                  <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
                    {customer.transactions && customer.transactions.length > 0 ? (
                      <div className="relative border-l-2 border-border pl-4 space-y-6">
                        {customer.transactions.map((tx, idx) => (
                          <div key={tx.txId + idx} className="relative">
                            {/* Dot overlay */}
                            <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-border border-2 border-card" />
                            
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="font-mono text-[10px] text-muted-foreground">{tx.txId} · {tx.date}</span>
                                <h5 className="font-bold text-foreground text-xs mt-0.5 line-clamp-2">{tx.items}</h5>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`block text-xs font-black ${tx.points >= 0 ? 'text-primary' : 'text-red-400'}`}>
                                  {tx.points >= 0 ? `+${tx.points}` : tx.points} PTS
                                </span>
                                {tx.amount > 0 && (
                                  <span className="block font-mono text-[9px] text-muted-foreground mt-0.5">M{tx.amount.toFixed(0)} spent</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-6">No ledger transactions yet.</p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Account details side statistics */}
              <div className="md:col-span-1 bg-card border border-border rounded-3xl p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-sm text-foreground uppercase tracking-wide mb-4">Membership Stats</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-background border border-border/80 rounded-2xl p-4 text-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block">Total Spent</span>
                      <span className="text-2xl font-black font-mono mt-1 block">M{(customer.totalSpent || 0).toFixed(2)}</span>
                    </div>

                    <div className="bg-background border border-border/80 rounded-2xl p-4 text-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block text-emerald-400">Total Donated</span>
                      <span className="text-2xl font-black font-mono mt-1 block text-emerald-400">M{(customer.totalDonated || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-muted-foreground uppercase text-center mt-6 border-t border-border pt-4">
                  Member since {customer.registeredAt}
                </div>
              </div>

              {/* Form editing */}
              <div className="md:col-span-2 bg-card border border-border rounded-3xl p-6 md:p-8">
                <h3 className="font-black text-lg text-foreground uppercase tracking-wide mb-6">Edit Profile Details</h3>

                {profileSuccess && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold p-4 rounded-xl text-center mb-6"
                  >
                    ✨ Profile updated successfully!
                  </motion.div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Display Name</label>
                    <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 focus-within:border-primary/50 transition-all">
                      <User size={18} className="text-muted-foreground" />
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Thabo Ntsane"
                        required
                        className="bg-transparent flex-1 py-3.5 text-foreground placeholder-muted-foreground outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Phone Number</label>
                    <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 focus-within:border-primary/50 transition-all">
                      <Phone size={18} className="text-muted-foreground" />
                      <input
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        placeholder="+266 5873 1332"
                        required
                        className="bg-transparent flex-1 py-3.5 text-foreground placeholder-muted-foreground outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!editName.trim() || !editPhone.trim()}
                    className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
                  >
                    Save Changes
                  </button>
                </form>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};
