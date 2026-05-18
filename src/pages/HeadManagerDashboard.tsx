import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { DollarSign, ShieldAlert, CheckCircle, Heart, Trophy, Truck, Plus, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeadManagerDashboard = () => {
  const { orders, events, totalDonations, supporters, suppliers, addSupplier, menu } = useStore();
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', category: '' });

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCompleted = orders.filter(o => o.status === 'Completed').length;
  const topSupporter = supporters.reduce((prev, current) => (prev.points > current.points) ? prev : current, supporters[0]);
  const activeEvents = events.length;

  const lowStockItems = menu.filter(m => m.stock <= m.minStock);

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.contact) {
      addSupplier(newSupplier);
      setShowSupplierModal(false);
      setNewSupplier({ name: '', contact: '', category: '' });
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-1">Global operations and financial overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20"><DollarSign size={24} /></div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Revenue</p>
          <p className="text-3xl font-black text-foreground mt-1">M{totalSales.toFixed(2)}</p>
        </motion.div>
        
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-secondary/10 text-secondary border border-secondary/20"><CheckCircle size={24} /></div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Orders Completed</p>
          <p className="text-3xl font-black text-foreground mt-1">{totalCompleted}</p>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20"><Heart size={24} /></div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Matlama Donations</p>
          <p className="text-3xl font-black text-foreground mt-1">M{totalDonations.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}} className="bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20"><ShieldAlert size={24} /></div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Active Events</p>
          <p className="text-3xl font-black text-foreground mt-1">{activeEvents}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-background flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="text-secondary" />
              <h2 className="font-bold text-lg uppercase tracking-wider text-foreground">Invoice Alerts (Restock needed)</h2>
            </div>
            {lowStockItems.length > 0 && (
               <span className="bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-secondary/20 animate-pulse">
                 {lowStockItems.length} Urgent
               </span>
            )}
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {lowStockItems.length === 0 ? (
               <div className="text-center text-muted-foreground py-8">No restock invoices needed currently.</div>
            ) : (
               lowStockItems.map(item => (
                 <div key={item.id} className="p-4 border-l-4 border-secondary bg-secondary/5 rounded-r-xl flex justify-between items-center">
                   <div>
                     <p className="text-sm text-foreground font-bold">{item.name}</p>
                     <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Current Stock: <span className="text-secondary font-bold">{item.stock}</span> (Min: {item.minStock})</p>
                   </div>
                   <button className="bg-background border border-border px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-primary transition-colors">
                     Issue Invoice
                   </button>
                 </div>
               ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card rounded-3xl border border-border overflow-hidden flex-1">
             <div className="p-6 border-b border-border bg-background flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <Truck className="text-primary" />
                 <h2 className="font-bold text-lg uppercase tracking-wider text-foreground">Suppliers Directory</h2>
               </div>
               <button 
                 onClick={() => setShowSupplierModal(true)}
                 className="bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
               >
                 <Plus size={14} /> Add Supplier
               </button>
             </div>
             <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
               {suppliers.length === 0 && <div className="text-center text-muted-foreground py-4">No suppliers listed.</div>}
               {suppliers.map(sup => (
                 <div key={sup.id} className="flex justify-between items-center p-4 border border-border bg-background rounded-xl">
                   <div>
                     <p className="font-bold text-foreground text-sm">{sup.name}</p>
                     <p className="text-xs text-muted-foreground mt-1">{sup.contact}</p>
                   </div>
                   <span className="text-[10px] uppercase tracking-widest font-bold bg-muted px-2 py-1 rounded text-muted-foreground">
                     {sup.category}
                   </span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {showSupplierModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border p-8"
          >
            <h2 className="font-black text-xl text-foreground uppercase tracking-wider mb-6">Add Supplier</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Supplier Name</label>
                <input 
                  type="text" 
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Contact Info (Phone/Email)</label>
                <input 
                  type="text" 
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Category (e.g., Meat, Drinks)</label>
                <input 
                  type="text" 
                  value={newSupplier.category}
                  onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={handleAddSupplier}
                disabled={!newSupplier.name || !newSupplier.contact}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={18} /> Add
              </button>
              <button 
                onClick={() => setShowSupplierModal(false)}
                className="flex-1 bg-background border border-border text-foreground font-bold py-3 rounded-xl hover:bg-muted transition-colors uppercase tracking-widest text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
