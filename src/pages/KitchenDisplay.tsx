import React from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Check, Clock, Play } from 'lucide-react';

export const KitchenDisplay = () => {
  const { orders, updateOrderStatus } = useStore();

  // Kitchen only cares about Pending and Preparing orders
  const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing');

  return (
    <div className="h-auto lg:h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-6 text-slate-800">
        <ChefHat size={32} className="text-primary" />
        <h1 className="text-3xl font-black tracking-tight">Kitchen Display</h1>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          <AnimatePresence>
            {activeOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`w-80 rounded-2xl flex flex-col border-2 shadow-sm overflow-hidden ${
                  order.status === 'Pending' ? 'border-red-200 bg-white' : 'border-yellow-400 bg-yellow-50'
                }`}
              >
                {/* Header */}
                <div className={`p-4 flex justify-between items-center text-white ${
                  order.status === 'Pending' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  <div className="font-bold text-lg">
                    {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-mono opacity-90">
                    <Clock size={14} />
                    {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <ul className="space-y-3">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-800 text-lg">{item.quantity}x</span>
                        <span className="flex-1 font-medium text-slate-600">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="p-4 bg-white/50 border-t border-slate-100">
                  {order.status === 'Pending' ? (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Preparing')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play size={18} fill="currentColor" /> Start Prep
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Ready')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-500/20 transition-all"
                    >
                      <Check size={20} strokeWidth={3} /> Ready for Waiter
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {activeOrders.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center text-slate-400">
              <ChefHat size={64} className="opacity-20 mb-4" />
              <p className="text-xl font-medium text-slate-500">No active orders</p>
              <p className="text-sm">Kitchen is clear!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
