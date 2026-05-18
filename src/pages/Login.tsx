import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { Role } from '../store/useStore';
import { motion } from 'framer-motion';
import { Users, Shield, ChefHat, ShoppingCart, Store, PartyPopper, Trophy } from 'lucide-react';

const roles: { title: Role; icon: React.FC<any>; description: string }[] = [
  { title: 'Head Manager', icon: Shield, description: 'Overall system dashboard and reports' },
  { title: 'Restaurant Manager', icon: Store, description: 'Restaurant operations and stock' },
  { title: 'Butchery Manager', icon: Store, description: 'Meat stock and Shisa Nyama operations' },
  { title: 'Events Manager', icon: PartyPopper, description: 'Catering and event planning' },
  { title: 'Cashier', icon: ShoppingCart, description: 'Point of sale and billing' },
  { title: 'Waiter', icon: Users, description: 'Table management and ordering' },
  { title: 'Kitchen', icon: ChefHat, description: 'Order queue and preparation' },
];

export const Login = () => {
  const { setCurrentRole } = useStore();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    setCurrentRole(role);
    switch (role) {
      case 'Head Manager': navigate('/head-manager'); break;
      case 'Restaurant Manager': navigate('/manager'); break;
      case 'Butchery Manager': navigate('/butchery-manager'); break;
      case 'Events Manager': navigate('/events'); break;
      case 'Cashier': navigate('/cashier'); break;
      case 'Waiter': navigate('/waiter'); break;
      case 'Kitchen': navigate('/kitchen'); break;
      case 'Matlama Admin': navigate('/matlama'); break;
      default: navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex bg-card rounded-3xl overflow-hidden shadow-2xl border border-border">
      {/* Left Side: Roles */}
      <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">
            System <span className="text-primary">Access</span>
          </h1>
          <p className="text-muted-foreground text-lg">Select your portal to continue.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role, idx) => (
            <motion.button
              key={role.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleLogin(role.title)}
              className="group flex items-center p-4 bg-background rounded-xl border border-border hover:border-primary transition-all text-left"
              style={{
                /* Applying the professional 'counter' styling vibe requested by user */
                outline: 'none'
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center mr-4 group-hover:bg-primary/10 group-hover:border-primary transition-colors">
                <role.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-wider">{role.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{role.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Matlama Admin – separate section */}
        <div className="mt-10 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">External Partner Portal</p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => handleLogin('Matlama Admin')}
            className="group w-full flex items-center p-4 rounded-xl border border-blue-800/50 bg-gradient-to-r from-blue-950/60 to-blue-900/30 hover:border-blue-500 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 overflow-hidden border border-blue-700/50 bg-blue-900/40">
              <img src="/assets/MATLAMA-logo.jpeg" alt="Matlama" className="w-full h-full object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
              />
              <Trophy className="w-6 h-6 text-blue-400 hidden" />
            </div>
            <div>
              <h3 className="text-sm font-black text-blue-300 uppercase tracking-wider">Matlama FC · Tse Putsoa</h3>
              <p className="text-xs text-blue-500 mt-1">Supporter loyalty portal & fund tracker</p>
            </div>
          </motion.button>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
          <button onClick={() => navigate('/wifi')} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
            → Free WiFi Portal
          </button>
          <span className="hidden sm:inline text-border">|</span>
          <button onClick={() => navigate('/supporter')} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
            → Digital Supporter Card
          </button>
        </div>
      </div>

      {/* Right Side: Featured Image Hero */}
      <div className="hidden lg:block lg:w-1/2 relative bg-background border-l border-border">
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />
        <img 
          src="/assets/pizzaanddrinkplate.jpg" 
          alt="Featured Dish" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Deliciously at your doorstep</h2>
          <p className="text-primary font-bold tracking-widest text-sm uppercase">Lecholi Family Restaurant</p>
        </div>
      </div>
    </div>
  );
};
