import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { MenuItem, OrderItem, Supporter } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Minus, Trash2, Receipt, CheckCircle, Bell, ShoppingCart, Image as ImageIcon, Search, UserPlus, X, User, Phone, Star } from 'lucide-react';

const CATEGORIES = ['Combos', 'Beverages', 'Grills', 'Burgers', 'Pasta & Seafood', 'Pizza', 'Salads'] as const;
type Category = typeof CATEGORIES[number];

const TIER_COLORS: Record<string, string> = {
  Bronze: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Silver: 'text-slate-300 bg-slate-400/10 border-slate-400/30',
  Gold: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Platinum: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30',
};

export const CashierPOS = () => {
  const { menu, addOrder, addDonation, tables, clearTable, lookupSupporter, registerSupporter } = useStore();
  const [activeTab, setActiveTab] = useState<Category>('Combos');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isSupporter, setIsSupporter] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState<any>(null);

  // Supporter flow state
  const [showSupporterPanel, setShowSupporterPanel] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [lookupResult, setLookupResult] = useState<Supporter | null | 'notfound'>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [activeSupporter, setActiveSupporter] = useState<Supporter | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const pendingBills = tables.filter(t => t.needsBill);
  const displayedMenu = menu.filter(item => item.category === activeTab);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) { const newQ = i.quantity + delta; return newQ > 0 ? { ...i, quantity: newQ } : i; }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15;
  const donation = isSupporter ? subtotal * 0.05 : 0;
  const total = subtotal + tax;
  const pointsEarned = isSupporter ? Math.floor(subtotal / 50) : 0;

  const handleLookup = async () => {
    if (!phoneInput.trim()) return;
    setIsLooking(true);
    setLookupResult(null);
    const result = await lookupSupporter(phoneInput.trim());
    setLookupResult(result ?? 'notfound');
    setIsLooking(false);
  };

  const handleSelectSupporter = (supporter: Supporter) => {
    setActiveSupporter(supporter);
    setIsSupporter(true);
    setShowSupporterPanel(false);
    setPhoneInput('');
    setLookupResult(null);
  };

  const handleRegister = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setIsRegistering(true);
    const created = await registerSupporter(newName.trim(), newPhone.trim());
    setIsRegistering(false);
    if (created) {
      handleSelectSupporter(created);
      setShowRegisterForm(false);
      setNewName(''); setNewPhone('');
    }
  };

  const handleRemoveSupporter = () => {
    setActiveSupporter(null);
    setIsSupporter(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const itemsDesc = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');

    if (isSupporter && activeSupporter) {
      addDonation(donation, subtotal, activeSupporter.id, itemsDesc);
    }

    addOrder({
      items: cart, total, status: 'Completed', type: 'Takeaway',
      isDonationApplied: isSupporter, donationAmount: donation,
      supporterId: activeSupporter?.id,
    });

    setLastOrderInfo({
      items: [...cart], subtotal, tax, total, donation, pointsEarned,
      supporter: activeSupporter,
      orderNumber: Math.floor(Math.random() * 9000) + 1000,
    });

    setShowReceipt(true);
    setCart([]);
    setIsSupporter(false);
    setActiveSupporter(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-8rem)]">
      {/* Left: Menu */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {pendingBills.length > 0 && (
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3 text-secondary">
              <Bell className="animate-pulse" />
              <span className="font-bold">Bills requested: Tables {pendingBills.map(t => t.id).join(', ')}</span>
            </div>
            <div className="flex gap-2">
              {pendingBills.map(t => (
                <button key={t.id} onClick={() => clearTable(t.id)}
                  className="px-4 py-1.5 bg-secondary text-secondary-foreground rounded uppercase text-xs font-bold hover:bg-secondary/90 transition-colors">
                  Clear T{t.id}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all border ${
                activeTab === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-2">
          {displayedMenu.map(item => (
            <motion.button key={item.id} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(item)}
              className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col text-left hover:border-primary transition-colors group shadow-sm hover:shadow-xl">
              <div className="h-32 w-full bg-muted relative overflow-hidden">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                  : <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon size={32} /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                  <span className="text-primary font-black text-lg">M{item.price.toFixed(2)}</span>
                </div>
              </div>
              <div className="p-4 pt-2 flex-1 flex flex-col justify-between">
                <span className="font-bold text-foreground text-sm line-clamp-2 leading-tight">{item.name}</span>
                <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">Stock: {item.stock}</span>
              </div>
            </motion.button>
          ))}
          {displayedMenu.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
              No items in this category.
            </div>
          )}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="w-full lg:w-96 bg-card rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden">
        <div className="p-5 bg-background border-b border-border">
          <h2 className="font-black text-xl text-foreground uppercase tracking-wider">Current Order</h2>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Takeaway</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <AnimatePresence>
            {cart.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between bg-background p-3 rounded-xl border border-border">
                <div className="flex-1 pr-3">
                  <h4 className="font-bold text-foreground text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-primary font-bold">M{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-card rounded-lg border border-border">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-l-lg transition-colors"><Minus size={14} /></button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-r-lg transition-colors"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive/70 hover:text-destructive p-1.5 transition-colors"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="text-center text-muted-foreground mt-10 flex flex-col items-center opacity-50">
              <ShoppingCart size={48} className="mb-4" />
              <p className="uppercase tracking-widest text-xs font-bold">Cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-5 bg-background border-t border-border space-y-3">
          {/* Active Supporter Badge */}
          {activeSupporter ? (
            <div className={`flex items-center justify-between p-3 rounded-xl border ${TIER_COLORS[activeSupporter.tier] || 'border-border'}`}>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                <div>
                  <p className="font-black text-foreground text-sm">{activeSupporter.name}</p>
                  <p className="text-xs text-muted-foreground">{activeSupporter.id} · {activeSupporter.tier}</p>
                </div>
              </div>
              <button onClick={handleRemoveSupporter} className="text-muted-foreground hover:text-destructive transition-colors"><X size={16} /></button>
            </div>
          ) : (
            <button onClick={() => setShowSupporterPanel(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all bg-card text-muted-foreground border border-border hover:border-blue-500 hover:text-blue-400">
              <Heart size={18} />
              Tse Putsoa Supporter
            </button>
          )}

          {/* Totals */}
          <div className="space-y-2 text-sm text-muted-foreground font-medium">
            <div className="flex justify-between"><span>Subtotal</span><span>M{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax (15%)</span><span>M{tax.toFixed(2)}</span></div>
            {isSupporter && (
              <div className="flex justify-between text-blue-400 font-bold bg-blue-950/20 p-2 rounded-lg border border-blue-900/30">
                <span>⚽ Club Donation (5%)</span>
                <span>M{donation.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-2xl font-black text-foreground pt-3 border-t border-border">
              <span>Total</span>
              <span className="text-primary">M{total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={handleCheckout} disabled={cart.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest">
            <Receipt size={20} /> Checkout
          </button>
        </div>
      </div>

      {/* ── Supporter Lookup Panel ───────────────────────── */}
      <AnimatePresence>
        {showSupporterPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-xl text-foreground">Tse Putsoa Supporter</h3>
                  <p className="text-muted-foreground text-sm mt-1">Look up by phone number</p>
                </div>
                <button onClick={() => { setShowSupporterPanel(false); setLookupResult(null); setShowRegisterForm(false); }}
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={24} />
                </button>
              </div>

              {!showRegisterForm ? (
                <>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 flex items-center gap-3 bg-background border border-border rounded-xl px-4">
                      <Phone size={18} className="text-muted-foreground" />
                      <input
                        value={phoneInput}
                        onChange={e => { setPhoneInput(e.target.value); setLookupResult(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleLookup()}
                        placeholder="+266 5000 0000"
                        className="bg-transparent flex-1 py-3 text-foreground placeholder-muted-foreground outline-none font-mono"
                      />
                    </div>
                    <button onClick={handleLookup} disabled={isLooking}
                      className="bg-primary text-primary-foreground px-5 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {isLooking ? '...' : <Search size={20} />}
                    </button>
                  </div>

                  {/* Lookup Result */}
                  {lookupResult === 'notfound' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-background border border-border rounded-2xl p-5 text-center">
                      <p className="text-muted-foreground mb-4">No supporter found for this number.</p>
                      <button onClick={() => { setShowRegisterForm(true); setNewPhone(phoneInput); }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm">
                        <UserPlus size={18} /> Register New Supporter
                      </button>
                    </motion.div>
                  )}

                  {lookupResult && lookupResult !== 'notfound' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-2xl p-5 ${TIER_COLORS[lookupResult.tier] || 'border-border'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-blue-900/50 rounded-2xl flex items-center justify-center border border-blue-700">
                          <User size={28} className="text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-black text-xl text-foreground">{lookupResult.name}</h4>
                          <p className="text-sm text-muted-foreground font-mono">{lookupResult.id}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        <div className="bg-background/50 rounded-xl p-3 border border-white/10">
                          <p className="font-black text-lg text-foreground">{lookupResult.points}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">Points</p>
                        </div>
                        <div className="bg-background/50 rounded-xl p-3 border border-white/10">
                          <p className="font-black text-lg text-foreground">{lookupResult.tier}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">Tier</p>
                        </div>
                        <div className="bg-background/50 rounded-xl p-3 border border-white/10">
                          <p className="font-black text-lg text-foreground">M{(lookupResult.totalDonated || 0).toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">Donated</p>
                        </div>
                      </div>
                      <button onClick={() => handleSelectSupporter(lookupResult as Supporter)}
                        className="w-full bg-primary text-primary-foreground font-black py-3 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-wider">
                        Apply Supporter Discount
                      </button>
                    </motion.div>
                  )}

                  <button onClick={() => setShowRegisterForm(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm py-2">
                    <UserPlus size={16} /> Register a new supporter
                  </button>
                </>
              ) : (
                /* Register Form */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 text-sm text-blue-300">
                    <p className="font-bold mb-1">New Tse Putsoa Member</p>
                    <p className="text-blue-400 text-xs">A unique Supporter ID will be generated automatically.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4">
                    <User size={18} className="text-muted-foreground" />
                    <input value={newName} onChange={e => setNewName(e.target.value)}
                      placeholder="Full Name" className="bg-transparent flex-1 py-3 text-foreground placeholder-muted-foreground outline-none" />
                  </div>
                  <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4">
                    <Phone size={18} className="text-muted-foreground" />
                    <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
                      placeholder="+266 5000 0000" className="bg-transparent flex-1 py-3 text-foreground placeholder-muted-foreground outline-none font-mono" />
                  </div>
                  <button onClick={handleRegister} disabled={isRegistering || !newName || !newPhone}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-colors uppercase tracking-wider disabled:opacity-50">
                    {isRegistering ? 'Registering...' : 'Register & Apply'}
                  </button>
                  <button onClick={() => setShowRegisterForm(false)}
                    className="w-full text-muted-foreground hover:text-foreground transition-colors text-sm py-2">
                    ← Back to Lookup
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Receipt Modal ───────────────────────────────── */}
      {showReceipt && lastOrderInfo && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div id="printable-receipt" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border p-8 flex flex-col relative max-h-[90vh]">
            <div className="text-center mb-6 border-b border-border pb-6 border-dashed shrink-0">
              <CheckCircle className="text-primary w-16 h-16 mx-auto mb-4 no-print" />
              <img src="/assets/lecholi.jpg" alt="Lecholi" className="h-12 mx-auto mb-2 opacity-90" />
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Lecholi Family Restaurant</p>
              <p className="text-muted-foreground text-[10px] mt-1">+266 6328 4393 · Maseru, Lesotho</p>
              <div className="bg-background inline-block px-3 py-1 rounded-full mt-4 border border-border">
                <p className="font-mono text-sm text-foreground font-bold">Order #{lastOrderInfo.orderNumber}</p>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mt-2">{new Date().toLocaleString()}</p>
            </div>

            {lastOrderInfo.supporter && (
              <div className="mb-4 bg-blue-950/30 border border-blue-900/40 rounded-xl p-3 flex items-center gap-3 shrink-0">
                <span className="text-2xl">⚽</span>
                <div>
                  <p className="font-bold text-foreground text-sm">{lastOrderInfo.supporter.name}</p>
                  <p className="text-xs text-blue-400 font-mono">{lastOrderInfo.supporter.id}</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto mb-6 space-y-3 font-mono text-sm text-muted-foreground">
              {lastOrderInfo.items.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="text-foreground">M{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border border-dashed pt-4 space-y-2 font-mono text-sm shrink-0">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>M{lastOrderInfo.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Tax (15%)</span><span>M{lastOrderInfo.tax.toFixed(2)}</span></div>
              {lastOrderInfo.donation > 0 && (
                <div className="flex justify-between text-blue-400 font-bold bg-blue-950/30 p-2 rounded">
                  <span>⚽ Matlama Donation (5%)</span>
                  <span>M{lastOrderInfo.donation.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black text-foreground pt-3 mt-3 border-t border-border">
                <span>TOTAL</span><span className="text-primary">M{lastOrderInfo.total.toFixed(2)}</span>
              </div>
            </div>

            {lastOrderInfo.pointsEarned > 0 && (
              <div className="mt-4 bg-secondary/10 border border-secondary/20 p-3 rounded-xl text-center text-sm font-bold text-secondary uppercase tracking-wider shrink-0">
                ⭐ +{lastOrderInfo.pointsEarned} Points Earned for {lastOrderInfo.supporter?.name}!
              </div>
            )}

            <div className="mt-4 text-center text-[10px] text-muted-foreground border-t border-border border-dashed pt-4 uppercase tracking-widest font-bold shrink-0">
              Thank you for supporting Lecholi & Matlama FC!
            </div>

            <div className="mt-6 flex gap-3 no-print shrink-0">
              <button onClick={() => window.print()}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                <Receipt size={18} /> Print Slip
              </button>
              <button onClick={() => setShowReceipt(false)}
                className="flex-1 bg-background border border-border text-foreground font-bold py-3 rounded-xl hover:bg-muted transition-colors uppercase tracking-widest text-sm">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
