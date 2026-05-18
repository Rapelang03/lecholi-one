import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Calendar, Users, DollarSign, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const EventsManager = () => {
  const { events, addEvent } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', headcount: 0, budget: 0 });

  const handleAddEvent = () => {
    if (newEvent.name && newEvent.date) {
      addEvent({ ...newEvent, actualSpent: 0 });
      setShowModal(false);
      setNewEvent({ name: '', date: '', headcount: 0, budget: 0 });
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Events & Catering</h1>
          <p className="text-muted-foreground mt-1">Manage bookings and catering budgets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          <Plus size={18} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-card rounded-3xl border border-dashed border-border">
            <Calendar className="mx-auto mb-4 opacity-50 w-16 h-16" />
            <p className="font-medium text-lg">No events scheduled.</p>
          </div>
        )}
        {events.map((event, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={event.id}
            className="bg-card rounded-3xl border border-border p-6 shadow-sm hover:border-primary/50 transition-colors group"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-xl text-foreground line-clamp-1">{event.name}</h3>
              <span className="bg-primary/10 text-primary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                Active
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar size={18} className="text-foreground" />
                <span className="font-medium text-sm">{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users size={18} className="text-foreground" />
                <span className="font-medium text-sm">{event.headcount} Guests</span>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Budget</p>
                    <p className="text-lg font-black text-primary">M{event.budget.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Spent</p>
                    <p className="text-lg font-black text-foreground">M{event.actualSpent.toFixed(2)}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-background rounded-full mt-4 overflow-hidden border border-border">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${Math.min(100, (event.actualSpent / event.budget) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border p-8">
            <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-tight">Create Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Event Name</label>
                <input 
                  type="text" 
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Date</label>
                <input 
                  type="date" 
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Headcount</label>
                  <input 
                    type="number" 
                    value={newEvent.headcount}
                    onChange={(e) => setNewEvent({...newEvent, headcount: parseInt(e.target.value) || 0})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Budget (M)</label>
                  <input 
                    type="number" 
                    value={newEvent.budget}
                    onChange={(e) => setNewEvent({...newEvent, budget: parseFloat(e.target.value) || 0})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-background border border-border text-foreground font-bold py-3 rounded-xl hover:bg-muted transition-colors text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddEvent}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm uppercase tracking-widest"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
