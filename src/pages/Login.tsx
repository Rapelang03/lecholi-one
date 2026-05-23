import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { Role, Supporter } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, ChefHat, ShoppingCart, Store, PartyPopper, Trophy,
  Lock, Mail, Phone, MapPin, Eye, EyeOff, CheckCircle, Send, PlusCircle, CreditCard, ChevronRight, Settings
} from 'lucide-react';

const staffRoles: { title: Role; icon: React.FC<any>; description: string; email: string; key: string }[] = [
  { title: 'Head Manager', icon: Shield, description: 'Overall system dashboard & reports', email: 'head.manager@lecholi.co.ls', key: 'admin' },
  { title: 'Restaurant Manager', icon: Store, description: 'Restaurant operations & stock', email: 'rest.manager@lecholi.co.ls', key: 'admin2' },
  { title: 'Butchery Manager', icon: Store, description: 'Meat stock & Butchery operations', email: 'butchery.manager@lecholi.co.ls', key: 'admin3' },
  { title: 'Events Manager', icon: PartyPopper, description: 'Catering & event planning', email: 'events@lecholi.co.ls', key: 'events' },
  { title: 'Cashier', icon: ShoppingCart, description: 'Point of sale & billing', email: 'cashier@lecholi.co.ls', key: 'cashier' },
  { title: 'Waiter', icon: Users, description: 'Table management & ordering', email: 'waiter@lecholi.co.ls', key: 'waiter' },
  { title: 'Kitchen', icon: ChefHat, description: 'Order queue & preparation', email: 'kitchen@lecholi.co.ls', key: 'kitchen' },
];

const districts = [
  'Maseru', 'Leribe', 'Berea', 'Mafeteng', 'Mohale\'s Hoek', 
  'Quthing', 'Qacha\'s Nek', 'Mokhotlong', 'Butha-Buthe', 'Thaba-Tseka'
];

export const Login = () => {
  const { setCurrentRole, setActiveCustomerId, registerSupporter } = useStore();
  const navigate = useNavigate();

  // Tab State: 'signin' or 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successSupporter, setSuccessSupporter] = useState<Supporter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Unified Sign In Form
  const [customerQuery, setCustomerQuery] = useState(''); // phone/email/id
  const [customerPassword, setCustomerPassword] = useState('');

  // Customer Sign Up Form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('Maseru');
  const [regIsTsePutsoa, setRegIsTsePutsoa] = useState(true);
  const [regHasSupporterNo, setRegHasSupporterNo] = useState(false);
  const [regSupporterNo, setRegSupporterNo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regWalletType, setRegWalletType] = useState<'None' | 'M-Pesa' | 'EcoCash' | 'Card'>('None');
  
  // Wallet fields
  const [regMpesaNumber, setRegMpesaNumber] = useState('');
  const [regEcocashNumber, setRegEcocashNumber] = useState('');
  const [regCardNumber, setRegCardNumber] = useState('');
  const [regCardHolder, setRegCardHolder] = useState('');
  const [regCardExpiry, setRegCardExpiry] = useState('');
  const [regCardCvv, setRegCardCvv] = useState('');

  // Get API URL helper
  const getApiUrl = () => {
    if (import.meta.env?.PROD) return '/api';
    const host = window.location.hostname;
    return `http://${host}:3001/api`;
  };

  const handleQuickFillStaff = (role: Role, email: string) => {
    setCustomerQuery(email);
    setCustomerPassword('password123');
  };

  const handleQuickFillCustomer = (phone: string) => {
    setCustomerQuery(phone);
    setCustomerPassword('password123');
  };

  // Unified Sign In Handler
  const handleUnifiedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cred = customerQuery.trim();
    const pwd = customerPassword;

    if (!cred || !pwd) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    // 1. Check for staff bypass keywords/emails
    const staffMatch = [
      { key: 'cashier', role: 'Cashier', path: '/cashier', email: 'cashier@lecholi.co.ls' },
      { key: 'waiter', role: 'Waiter', path: '/waiter', email: 'waiter@lecholi.co.ls' },
      { key: 'kitchen', role: 'Kitchen', path: '/kitchen', email: 'kitchen@lecholi.co.ls' },
      { key: 'admin', role: 'Head Manager', path: '/head-manager', email: 'head.manager@lecholi.co.ls' },
      { key: 'admin1', role: 'Head Manager', path: '/head-manager', email: 'head.manager@lecholi.co.ls' },
      { key: 'head.manager@lecholi.co.ls', role: 'Head Manager', path: '/head-manager', email: 'head.manager@lecholi.co.ls' },
      { key: 'admin2', role: 'Restaurant Manager', path: '/manager', email: 'rest.manager@lecholi.co.ls' },
      { key: 'rest.manager@lecholi.co.ls', role: 'Restaurant Manager', path: '/manager', email: 'rest.manager@lecholi.co.ls' },
      { key: 'admin3', role: 'Butchery Manager', path: '/butchery-manager', email: 'butchery.manager@lecholi.co.ls' },
      { key: 'butchery.manager@lecholi.co.ls', role: 'Butchery Manager', path: '/butchery-manager', email: 'butchery.manager@lecholi.co.ls' },
      { key: 'events', role: 'Events Manager', path: '/events', email: 'events@lecholi.co.ls' },
      { key: 'events@lecholi.co.ls', role: 'Events Manager', path: '/events', email: 'events@lecholi.co.ls' },
      { key: 'matlama', role: 'Matlama Admin', path: '/matlama', email: 'admin.matlama@tseputsoa.co.ls' },
      { key: 'admin.matlama@tseputsoa.co.ls', role: 'Matlama Admin', path: '/matlama', email: 'admin.matlama@tseputsoa.co.ls' },
    ].find(x => x.key.toLowerCase() === cred.toLowerCase() || x.email.toLowerCase() === cred.toLowerCase());

    if (staffMatch) {
      if (pwd === 'password123') {
        setCurrentRole(staffMatch.role as Role);
        setIsSubmitting(false);
        navigate(staffMatch.path);
        return;
      } else {
        setError('Invalid email or password.');
        setIsSubmitting(false);
        return;
      }
    }

    // 2. Otherwise, treat as Customer/Supporter
    try {
      const res = await fetch(`${getApiUrl()}/supporter/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cred, password: pwd })
      });
      const data = await res.json();
      if (data.success) {
        setActiveCustomerId(data.supporter.id);
        setCurrentRole('Customer');
        setIsSubmitting(false);
        navigate('/customer');
      } else {
        setError(data.message || 'Invalid email, phone or password.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer Sign Up Handler
  const handleCustomerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setError('Name, phone number, and password are required.');
      return;
    }

    if (regIsTsePutsoa && regHasSupporterNo) {
      if (!/^\d{6}$/.test(regSupporterNo)) {
        setError('Matlama FC Supporter Number must be exactly 6 digits.');
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      address: regAddress,
      isTsePutsoa: regIsTsePutsoa,
      supporterNumber: regIsTsePutsoa && regHasSupporterNo ? regSupporterNo : '',
      bankingDetails: {
        type: regWalletType,
        mpesaNumber: regWalletType === 'M-Pesa' ? regMpesaNumber : '',
        mpesaBalance: regWalletType === 'M-Pesa' ? 1500 : 0,
        ecocashNumber: regWalletType === 'EcoCash' ? regEcocashNumber : '',
        ecocashBalance: regWalletType === 'EcoCash' ? 850 : 0,
        cardNumber: regWalletType === 'Card' ? regCardNumber : '',
        cardExpiry: regWalletType === 'Card' ? regCardExpiry : '',
        cardCvv: regWalletType === 'Card' ? regCardCvv : '',
        cardHolderName: regWalletType === 'Card' ? regCardHolder : '',
        cardBalance: regWalletType === 'Card' ? 4500 : 0
      },
      password: regPassword
    };

    try {
      const created = await registerSupporter(payload);
      if (created) {
        setSuccessSupporter(created);
      } else {
        setError('Failed to register. Phone number or supporter number might already be in use.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterDashboard = () => {
    if (successSupporter) {
      setActiveCustomerId(successSupporter.id);
      setCurrentRole('Customer');
      navigate('/customer');
    }
  };

  return (
    <div className="min-h-[85vh] flex bg-card rounded-3xl overflow-hidden shadow-2xl border border-border">
      {/* Left Column: Access Panels */}
      <div className="w-full lg:w-[60%] p-6 sm:p-10 md:p-12 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-primary w-8 h-8" />
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-wider">Lecholi</h2>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Tse Putsoa Loyalty System</p>
            </div>
          </div>

          {/* Tab Selector (Sign In vs Sign Up - Obscured security) */}
          {!successSupporter && (
            <div className="flex border-b border-border mb-6">
              <button
                onClick={() => { setActiveTab('signin'); setError(''); }}
                className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'signin' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setError(''); }}
                className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'signup' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-bold mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {successSupporter ? (
              /* REGISTRATION SUCCESS VIEW + EMAIL MOCKUP */
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-wider">Registration Completed!</h3>
                      <p className="text-xs text-emerald-500/80 mt-0.5">Welcome to Lecholi. Your VIP account is active.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 border-t border-emerald-500/10 pt-3 text-xs font-medium">
                    <div>
                      <span className="text-[10px] text-emerald-500/60 uppercase block">Loyalty ID</span>
                      <span className="font-mono font-bold text-foreground text-sm">{successSupporter.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500/60 uppercase block">Supporter No</span>
                      <span className="font-mono font-bold text-foreground text-sm">
                        {successSupporter.supporterNumber || 'Generated automatically'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500/60 uppercase block">Linked Wallet</span>
                      <span className="font-bold text-foreground">
                        {successSupporter.bankingDetails?.type || 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500/60 uppercase block">Loyalty Points</span>
                      <span className="font-bold text-foreground">0 PTS (Bronze)</span>
                    </div>
                  </div>
                </div>

                {/* Email Mockup */}
                <div className="bg-background border border-border rounded-2xl p-4 font-mono text-[10px] space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-sans flex items-center gap-1 font-bold">
                    <Send size={8} /> Email Logged
                  </div>
                  
                  <div className="border-b border-border/60 pb-2 text-muted-foreground">
                    <p><span className="text-primary font-bold">From:</span> system-notify@lecholi.co.ls</p>
                    <p><span className="text-primary font-bold">To:</span> admin.matlama@tseputsoa.co.ls</p>
                    <p><span className="text-primary font-bold">Subject:</span> New Tse Putsoa Supporter Registration - {successSupporter.id}</p>
                  </div>
                  
                  <div className="pt-2 text-foreground space-y-1">
                    <p>Dear Matlama FC Admin,</p>
                    <p>A new supporter has registered on the Lecholi Loyalty System. Supporter details below:</p>
                    <p className="bg-muted px-2 py-1.5 rounded text-muted-foreground mt-2 space-y-0.5">
                      <span>• Member ID: {successSupporter.id}</span><br />
                      <span>• Name: {successSupporter.name}</span><br />
                      <span>• Phone: {successSupporter.phone}</span><br />
                      <span>• Email: {successSupporter.email || 'N/A'}</span><br />
                      <span>• District: {successSupporter.address}</span><br />
                      <span>• Tse Putsoa Status: {successSupporter.isTsePutsoa ? 'YES' : 'NO'}</span><br />
                      <span>• Supporter Number: {successSupporter.supporterNumber || 'Generated: ' + successSupporter.id}</span>
                    </p>
                    <p className="mt-2 text-muted-foreground">This user is now qualified for Tse Putsoa supporter discounts and contributions.</p>
                  </div>
                </div>

                <button
                  onClick={handleEnterDashboard}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  Enter Loyalty Dashboard <ChevronRight size={16} />
                </button>
              </motion.div>
            ) : activeTab === 'signin' ? (
              /* SECURE UNIFIED LOG IN FORM */
              <motion.div
                key="signin-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <form onSubmit={handleUnifiedLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-1.5 font-black">Email, Phone or Member ID</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={customerQuery}
                        onChange={e => setCustomerQuery(e.target.value)}
                        placeholder="Enter email, phone number, or Member ID"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-1.5 font-black">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={customerPassword}
                        onChange={e => setCustomerPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-10 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/10"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* SECURE CUSTOMER SIGN UP (REGISTRATION) FORM */
              <motion.div
                key="signup-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <form onSubmit={handleCustomerSignUp} className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-1 font-black">Full Name</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="Thabo Ntsane"
                        className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-1 font-black">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+266 5873 1332"
                        className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-1 font-black">Email Address</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="thabo@gmail.com"
                        className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-1 font-black">Lesotho District</label>
                      <select
                        value={regAddress}
                        onChange={e => setRegAddress(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs text-foreground focus:border-primary outline-none"
                      >
                        {districts.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tse Putsoa Support Checkbox & Supporter Number */}
                  <div className="bg-background border border-border rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="tse-putsoa-chk"
                        checked={regIsTsePutsoa}
                        onChange={e => setRegIsTsePutsoa(e.target.checked)}
                        className="accent-primary w-4 h-4"
                      />
                      <label htmlFor="tse-putsoa-chk" className="text-[10px] font-black uppercase text-foreground tracking-wider cursor-pointer">
                        Matlama FC Supporter (Tse Putsoa)
                      </label>
                    </div>

                    {regIsTsePutsoa && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 border-t border-border pt-3 pl-1"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="has-no-chk"
                            checked={regHasSupporterNo}
                            onChange={e => setRegHasSupporterNo(e.target.checked)}
                            className="accent-primary w-3.5 h-3.5"
                          />
                          <label htmlFor="has-no-chk" className="text-[9px] font-bold text-muted-foreground tracking-wider cursor-pointer">
                            I have a 6-digit Supporter Number
                          </label>
                        </div>

                        {regHasSupporterNo ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <label className="block text-[9px] uppercase text-muted-foreground tracking-widest mb-1">Enter 6-Digit Supporter Number</label>
                            <input
                              type="text"
                              required
                              value={regSupporterNo}
                              onChange={e => setRegSupporterNo(e.target.value.replace(/\D/g, '').substring(0, 6))}
                              placeholder="e.g. 518392"
                              className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs text-foreground font-mono"
                            />
                          </motion.div>
                        ) : (
                          <div className="text-[9px] text-muted-foreground leading-relaxed italic bg-card/60 p-2.5 rounded-xl border border-border/40">
                            💡 No worries! A unique 6-digit supporter ID will be generated automatically and shared with the Matlama FC team via email on registration.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Multi-Wallet Banking details */}
                  <div className="bg-background border border-border rounded-2xl p-4 space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-2 font-black">Link Payment Wallet</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['None', 'M-Pesa', 'EcoCash', 'Card'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setRegWalletType(type as any)}
                            className={`py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                              regWalletType === type 
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-card border-border text-muted-foreground hover:border-primary/45'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {regWalletType === 'M-Pesa' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fadeIn">
                        <label className="block text-[9px] uppercase text-muted-foreground tracking-widest mb-1">M-Pesa Phone Number</label>
                        <input
                          type="text"
                          required
                          value={regMpesaNumber}
                          onChange={e => setRegMpesaNumber(e.target.value)}
                          placeholder="+266 5873 1332"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs text-foreground"
                        />
                      </motion.div>
                    )}

                    {regWalletType === 'EcoCash' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fadeIn">
                        <label className="block text-[9px] uppercase text-muted-foreground tracking-widest mb-1">EcoCash Phone Number</label>
                        <input
                          type="text"
                          required
                          value={regEcocashNumber}
                          onChange={e => setRegEcocashNumber(e.target.value)}
                          placeholder="+266 6273 1332"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs text-foreground"
                        />
                      </motion.div>
                    )}

                    {regWalletType === 'Card' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase text-muted-foreground tracking-widest mb-1">Cardholder Name</label>
                            <input
                              type="text"
                              required
                              value={regCardHolder}
                              onChange={e => setRegCardHolder(e.target.value)}
                              placeholder="Thabo Ntsane"
                              className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs text-foreground"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-muted-foreground tracking-widest mb-1">Credit Card Number</label>
                            <input
                              type="text"
                              required
                              value={regCardNumber}
                              onChange={e => setRegCardNumber(e.target.value.replace(/\D/g, '').substring(0,16))}
                              placeholder="4000 1234 5678 9010"
                              className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs text-foreground font-mono"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase text-muted-foreground tracking-widest mb-1">Expiry Date</label>
                            <input
                              type="text"
                              required
                              value={regCardExpiry}
                              onChange={e => setRegCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs text-foreground"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-muted-foreground tracking-widest mb-1">CVV</label>
                            <input
                              type="password"
                              required
                              value={regCardCvv}
                              onChange={e => setRegCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                              placeholder="123"
                              className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs text-foreground"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-muted-foreground tracking-widest mb-1.5 font-black">Account Password</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Create password for future logins"
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs text-foreground focus:border-primary outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg"
                  >
                    {isSubmitting ? 'Creating Supporter Account...' : 'Register VIP Supporter Card'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer shortcuts & Hidden Collapsible Diagnostic Portal */}
        <div className="mt-8 pt-4 border-t border-border flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex gap-4">
              <button onClick={() => navigate('/wifi')} className="hover:text-primary transition-colors">
                → Free WiFi Portal
              </button>
              <button onClick={() => navigate('/supporter')} className="hover:text-primary transition-colors">
                → Supporter Card
              </button>
            </div>
            
            {/* Tiny hidden button designed to look like a version number tag */}
            <button 
              onClick={() => setShowDiagnostics(!showDiagnostics)} 
              className="text-[9px] font-mono text-muted-foreground/60 hover:text-primary transition-all flex items-center gap-1 uppercase tracking-widest"
            >
              <Settings size={10} className="animate-spin-slow" />
              <span>Lecholi v2.6.0-prod</span>
            </button>
          </div>

          {/* Diagnostic Drawer Panel */}
          <AnimatePresence>
            {showDiagnostics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-background/80 border border-border rounded-2xl p-4 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                  <span className="text-[10px] uppercase tracking-wider font-black text-primary">System Access Diagnostics</span>
                  <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary font-mono px-2 py-0.5 rounded uppercase">Authorized Mode Only</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black block mb-2">Staff & Partner Access</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {staffRoles.map(role => (
                        <button
                          key={role.title || ''}
                          type="button"
                          onClick={() => {
                            handleQuickFillStaff(role.title, role.email);
                            setShowDiagnostics(false);
                          }}
                          className="bg-card hover:border-primary/50 text-[9px] font-black py-2 px-1 rounded-lg border border-border transition-all uppercase tracking-wider text-center text-foreground"
                        >
                          {role.title?.replace(' Manager', '') || ''}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          handleQuickFillStaff('Matlama Admin', 'admin.matlama@tseputsoa.co.ls');
                          setShowDiagnostics(false);
                        }}
                        className="bg-[#1e3a8a]/20 border border-blue-500/30 text-blue-300 hover:border-blue-400 hover:text-white text-[9px] font-black py-2 px-1 rounded-lg transition-all uppercase tracking-wider text-center"
                      >
                        Matlama Club
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black block mb-2">Supporter Access</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleQuickFillCustomer('+266 5873 1332');
                          setShowDiagnostics(false);
                        }}
                        className="bg-card hover:border-primary/50 text-[9px] font-bold px-3 py-1.5 rounded-lg border border-border transition-all uppercase tracking-wide text-foreground"
                      >
                        Thabo (M-Pesa)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleQuickFillCustomer('+266 6273 1332');
                          setShowDiagnostics(false);
                        }}
                        className="bg-card hover:border-primary/50 text-[9px] font-bold px-3 py-1.5 rounded-lg border border-border transition-all uppercase tracking-wide text-foreground"
                      >
                        Mpho (EcoCash)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleQuickFillCustomer('+266 5812 3456');
                          setShowDiagnostics(false);
                        }}
                        className="bg-card hover:border-primary/50 text-[9px] font-bold px-3 py-1.5 rounded-lg border border-border transition-all uppercase tracking-wide text-foreground"
                      >
                        'Mare (Card)
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Column: Hero Graphic */}
      <div className="hidden lg:block lg:w-[40%] relative bg-background border-l border-border">
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent z-10" />
        <img 
          src="/assets/pizzaanddrinkplate.jpg" 
          alt="Featured Dish" 
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className="absolute bottom-10 left-10 right-10 z-20 space-y-3">
          <div className="inline-block bg-[#1e3a8a]/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            ⚽ official matlama fc partner
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
            TASTE PREMIUM FLAVORS & EARN REWARDS
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Register your Tse Putsoa supporter card to automatically contribute 5% of all food purchases to the football club, earn loyalty points, and pay seamlessly using M-Pesa, EcoCash, or Credit Card.
          </p>
        </div>
      </div>
    </div>
  );
};
