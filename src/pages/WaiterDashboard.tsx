import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Table, MenuItem, Supporter } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Receipt, CheckCircle, Bell, Image as ImageIcon, Printer, Heart, Phone, Search, UserPlus, X, User, Star } from 'lucide-react';

const CATEGORIES = ['Combos', 'Beverages', 'Grills', 'Burgers', 'Pasta & Seafood', 'Pizza', 'Salads'] as const;
type Category = typeof CATEGORIES[number];

const TIER_COLORS: Record<string, string> = {
  Bronze: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Silver: 'text-slate-300 bg-slate-400/10 border-slate-400/30',
  Gold: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Platinum: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30',
};

export const WaiterDashboard = () => {
  const { tables, updateTableStatus, requestBill, addOrder, menu, orders, lookupSupporter, registerSupporter, addDonation } = useStore();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<{item: MenuItem, quantity: number}[]>([]);
  const [activeTab, setActiveTab] = useState<Category>('Combos');
  const [showPrintBill, setShowPrintBill] = useState(false);

  // Supporter flow state
  const [isSupporter, setIsSupporter] = useState(false);
  const [showSupporterPanel, setShowSupporterPanel] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [lookupResult, setLookupResult] = useState<Supporter | null | 'notfound'>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [activeSupporter, setActiveSupporter] = useState<Supporter | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const displayedMenu = menu.filter(item => item.category === activeTab);

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

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0 || !selectedTable) return;
    
    const itemsDesc = cart.map(c => `${c.quantity}x ${c.item.name}`).join(', ');
    const subtotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
    const tax = subtotal * 0.15;
    const donation = isSupporter ? subtotal * 0.05 : 0;
    
    if (isSupporter && activeSupporter) {
      addDonation(donation, subtotal, activeSupporter.id, itemsDesc);
    }

    addOrder({
      items: cart.map(c => ({ ...c.item, quantity: c.quantity })),
      total: subtotal + tax,
      status: 'Pending',
      type: 'Dine-in',
      tableNumber: selectedTable.id,
      isDonationApplied: isSupporter,
      donationAmount: donation,
      supporterId: activeSupporter?.id,
    });
    
    updateTableStatus(selectedTable.id, 'Occupied');
    setCart([]);
    setSelectedTable(null);
    setIsSupporter(false);
    setActiveSupporter(null);
  };

  const readyOrders = orders.filter(o => o.status === 'Ready' && tables.some(t => t.id === o.tableNumber));
  
  // Calculate total for the currently selected table's bill
  const tableOrders = selectedTable ? orders.filter(o => o.tableNumber === selectedTable.id && o.status !== 'Completed') : [];
  const tableTotal = tableOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-8rem)]">
      {/* Tables View */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <h2 className="font-black text-2xl text-foreground flex items-center gap-2 uppercase tracking-wider">
          <Utensils className="text-primary" /> Floor Map
        </h2>
        
        {readyOrders.length > 0 && (
          <div className="bg-green-950 border border-green-800 text-green-400 p-4 rounded-xl flex items-center gap-3 shadow-md">
            <Bell className="animate-bounce" />
            <span className="font-bold">Ready for tables: {readyOrders.map(o => o.tableNumber).join(', ')}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 pb-2">
          {tables.map(table => (
            <motion.button
              key={table.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSelectedTable(table); setCart([]); }}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden ${
                selectedTable?.id === table.id 
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] text-primary' 
                  : table.status === 'Occupied'
                  ? 'border-secondary/50 bg-secondary/10 text-secondary-foreground hover:border-secondary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <div className="text-4xl font-black">T{table.id}</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-2">
                {table.needsBill ? 'Bill Requested' : table.status}
              </div>
              {orders.some(o => o.tableNumber === table.id && o.status === 'Ready') && (
                <div className="absolute top-0 left-0 right-0 bg-green-500 text-black text-[10px] uppercase font-black py-1 tracking-widest">
                  Food Ready
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {selectedTable && selectedTable.status === 'Occupied' && (
          <div className="mt-2 p-5 bg-card rounded-2xl shadow-xl border border-border flex flex-col gap-3">
            <h3 className="font-bold text-lg text-foreground uppercase tracking-widest text-center border-b border-border pb-2">T{selectedTable.id} Actions</h3>
            <button
              onClick={() => { requestBill(selectedTable.id); setShowPrintBill(true); }}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm shadow-lg shadow-secondary/20"
            >
              <Printer size={18} /> Print Table Bill
            </button>
          </div>
        )}
      </div>

      {/* Ordering View */}
      <div className="flex-1 bg-card rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {selectedTable ? (
          <>
            <div className="p-5 bg-background border-b border-border flex justify-between items-center">
              <h2 className="font-black text-xl text-foreground uppercase tracking-wider">
                Ordering: <span className="text-primary">Table {selectedTable.id}</span>
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto p-4 border-b border-border scrollbar-hide shrink-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`whitespace-nowrap px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${
                    activeTab === cat 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {displayedMenu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="p-3 border border-border bg-background rounded-xl text-left hover:border-primary transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                      ) : (
                        <ImageIcon className="w-full h-full p-3 opacity-20" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm line-clamp-1">{item.name}</div>
                      <div className="text-primary font-bold text-xs">M{item.price.toFixed(2)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-background border-t border-border space-y-3">
              <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Current Selection</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                {cart.length === 0 && <p className="text-muted-foreground text-sm font-medium italic">No items selected.</p>}
                {cart.map(c => (
                  <div key={c.item.id} className="flex justify-between text-foreground text-sm font-medium items-center">
                    <span className="flex items-center gap-2">
                      <span className="bg-muted px-2 py-0.5 rounded text-xs">{c.quantity}x</span>
                      {c.item.name}
                    </span>
                  </div>
                ))}
              </div>

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
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold uppercase tracking-wider text-sm transition-all bg-card text-muted-foreground border border-border hover:border-blue-500 hover:text-blue-400">
                  <Heart size={16} />
                  Tse Putsoa Supporter
                </button>
              )}

              <button
                onClick={handleSendToKitchen}
                disabled={cart.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                <CheckCircle size={18} /> Send to Kitchen
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-6">
            <Utensils size={64} className="opacity-10" />
            <p className="text-xl font-medium uppercase tracking-widest text-border">Select a table to begin</p>
          </div>
        )}
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

      {/* Waiter Print Bill Modal Overlay */}
      {showPrintBill && selectedTable && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            id="printable-receipt"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border p-8 flex flex-col relative max-h-[90vh]"
          >
            <div className="text-center mb-6 border-b border-border pb-6 border-dashed shrink-0">
              <img src="/assets/lecholi.jpg" alt="Lecholi" className="h-12 mx-auto mb-2 opacity-90 grayscale print:grayscale-0" />
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Lecholi Family Restaurant</p>
              <div className="bg-background inline-block px-3 py-1 rounded-full mt-4 border border-border">
                <p className="font-mono text-sm text-foreground font-bold">Pro-forma Bill: Table {selectedTable.id}</p>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mt-2">{new Date().toLocaleString()}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-6 space-y-3 font-mono text-sm text-muted-foreground">
              {tableOrders.map(order => 
                order.items.map(item => (
                  <div key={item.id + order.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="text-foreground">M{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border border-dashed pt-4 space-y-2 font-mono text-sm shrink-0">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>M{tableTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-foreground pt-3 mt-3 border-t border-border">
                <span>Total Due</span>
                <span className="text-primary">M{(tableTotal * 1.15).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 text-center text-[10px] text-muted-foreground border-t border-border border-dashed pt-4 uppercase tracking-widest font-bold shrink-0">
              Please pay at the Cashier
            </div>

            <div className="mt-8 flex gap-3 no-print shrink-0">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Print Bill
              </button>
              <button 
                onClick={() => setShowPrintBill(false)}
                className="flex-1 bg-background border border-border text-foreground font-bold py-3 rounded-xl hover:bg-muted transition-colors uppercase tracking-widest text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
