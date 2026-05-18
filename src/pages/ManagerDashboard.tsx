import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { MenuItem } from '../store/useStore';
import { Package, AlertTriangle, TrendingUp, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const ManagerDashboard = () => {
  const { menu, orders, updateStock } = useStore();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [stockToAdd, setStockToAdd] = useState(0);

  const lowStockItems = menu.filter(m => m.stock <= m.minStock);
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const completedOrders = orders.filter(o => o.status === 'Completed').length;

  const handleAddStock = () => {
    if (selectedItem && stockToAdd > 0) {
      updateStock(selectedItem.id, stockToAdd); // Add stock (positive number)
      setSelectedItem(null);
      setStockToAdd(0);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Restaurant Operations</h1>
          <p className="text-muted-foreground mt-1">Manage day-to-day inventory and active operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-3xl border border-border flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Daily Orders</p>
            <p className="text-3xl font-black text-foreground">{completedOrders}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-3xl border border-border flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Menu Items Monitored</p>
            <p className="text-3xl font-black text-foreground">{menu.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-background flex items-center gap-3">
          <AlertTriangle className="text-secondary" />
          <h2 className="font-bold text-lg uppercase tracking-wider text-foreground">Inventory Alerts & Restock</h2>
        </div>
        <div className="p-6">
          {lowStockItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 font-medium">All stock levels are healthy!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex flex-col justify-between p-4 border border-secondary/30 bg-secondary/5 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Category: {item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-secondary font-black text-lg">{item.stock}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Min: {item.minStock}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="w-full bg-background border border-secondary/50 text-secondary font-bold text-xs uppercase tracking-widest py-2 rounded-lg hover:bg-secondary/10 transition-colors"
                  >
                    Add Stock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Inventory List */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-background">
           <h2 className="font-bold text-lg uppercase tracking-wider text-foreground">Full Inventory List</h2>
        </div>
        <div className="p-0 max-h-96 overflow-y-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-background text-foreground border-b border-border sticky top-0">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">Item Name</th>
                <th className="px-6 py-4 font-bold tracking-widest">Category</th>
                <th className="px-6 py-4 font-bold tracking-widest">Current Stock</th>
                <th className="px-6 py-4 font-bold tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {menu.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{item.name}</td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4 font-mono font-bold text-primary">{item.stock}</td>
                  <td className="px-6 py-4">
                     <button onClick={() => setSelectedItem(item)} className="text-xs font-bold uppercase text-blue-400 hover:text-blue-300 tracking-wider flex items-center gap-1">
                       <Plus size={14} /> Receive Stock
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border p-8"
          >
            <h2 className="font-black text-xl text-foreground uppercase tracking-wider mb-2">Receive Stock</h2>
            <p className="text-sm text-muted-foreground mb-6">Update inventory for <span className="font-bold text-primary">{selectedItem.name}</span></p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Quantity Received</label>
              <input 
                type="number" 
                value={stockToAdd}
                onChange={(e) => setStockToAdd(parseInt(e.target.value) || 0)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors text-xl font-bold font-mono"
              />
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={handleAddStock}
                disabled={stockToAdd <= 0}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check size={18} /> Confirm
              </button>
              <button 
                onClick={() => {setSelectedItem(null); setStockToAdd(0);}}
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
