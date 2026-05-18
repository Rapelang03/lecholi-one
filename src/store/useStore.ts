import { create } from 'zustand';

export type Role = 'Head Manager' | 'Restaurant Manager' | 'Butchery Manager' | 'Cashier' | 'Waiter' | 'Kitchen' | 'Events Manager' | 'Matlama Admin' | null;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'Combos' | 'Beverages' | 'Grills' | 'Burgers' | 'Pasta & Seafood' | 'Pizza' | 'Salads' | 'Raw Meat' | 'Shisa Nyama';
  stock: number;
  minStock: number;
  image?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed';
  tableNumber?: number;
  type?: 'Takeaway' | 'Dine-in';
  token?: string;
  timestamp: Date;
  isDonationApplied?: boolean;
  donationAmount?: number;
  supporterId?: string;
}

export interface Table {
  id: number;
  status: 'Free' | 'Occupied';
  currentOrderId?: string;
  needsBill?: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  headcount: number;
  budget: number;
  actualSpent: number;
}

export interface SupporterTransaction {
  txId: string;
  date: string;
  amount: number;
  donation: number;
  points: number;
  items: string;
}

export interface Supporter {
  id: string;       // e.g. TSP-00001
  name: string;
  phone: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  registeredAt: string;
  totalSpent: number;
  totalDonated: number;
  transactions: SupporterTransaction[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  category: string;
}

interface StoreState {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  menu: MenuItem[];
  tables: Table[];
  orders: Order[];
  totalDonations: number;
  supporters: Supporter[];
  events: Event[];
  suppliers: Supplier[];

  // Actions
  fetchState: () => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  updateTableStatus: (id: number, status: 'Free' | 'Occupied') => Promise<void>;
  requestBill: (tableId: number) => Promise<void>;
  clearTable: (tableId: number) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  addDonation: (amount: number, purchaseAmount: number, supporterId?: string, items?: string) => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  registerSupporter: (name: string, phone: string) => Promise<Supporter | null>;
  lookupSupporter: (phone: string) => Promise<Supporter | null>;
}

const getApiUrl = () => {
  if (import.meta.env?.PROD) return '/api';
  const host = window.location.hostname;
  return `http://${host}:3001/api`;
};

const sendAction = async (type: string, payload: any) => {
  try {
    const res = await fetch(`${getApiUrl()}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to send action to sync server', e);
    return null;
  }
};

export const useStore = create<StoreState>((set) => {
  setInterval(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/state`);
      const state = await res.json();
      set(state);
    } catch (e) { /* Server offline */ }
  }, 1500);

  return {
    currentRole: (localStorage.getItem('lecholi-role') as Role) || null,
    setCurrentRole: (role) => {
      localStorage.setItem('lecholi-role', role || '');
      set({ currentRole: role });
    },
    menu: [],
    tables: [],
    orders: [],
    totalDonations: 0,
    supporters: [],
    events: [],
    suppliers: [],

    fetchState: async () => {
      try {
        const res = await fetch(`${getApiUrl()}/state`);
        const state = await res.json();
        set(state);
      } catch (e) { console.error('Failed to fetch initial state'); }
    },

    updateStock: async (id, quantity) => {
      const newState = await sendAction('UPDATE_STOCK', { id, quantity });
      if (newState) set(newState);
    },
    updateTableStatus: async (id, status) => {
      const newState = await sendAction('UPDATE_TABLE_STATUS', { id, status });
      if (newState) set(newState);
    },
    requestBill: async (tableId) => {
      const newState = await sendAction('REQUEST_BILL', { tableId });
      if (newState) set(newState);
    },
    clearTable: async (tableId) => {
      const newState = await sendAction('CLEAR_TABLE', { tableId });
      if (newState) set(newState);
    },
    addOrder: async (order) => {
      const newState = await sendAction('ADD_ORDER', order);
      if (newState) set(newState);
    },
    updateOrderStatus: async (orderId, status) => {
      const newState = await sendAction('UPDATE_ORDER_STATUS', { orderId, status });
      if (newState) set(newState);
    },
    addDonation: async (amount, purchaseAmount, supporterId, items) => {
      const newState = await sendAction('ADD_DONATION', { amount, purchaseAmount, supporterId, items });
      if (newState) set(newState);
    },
    addEvent: async (event) => {
      const newState = await sendAction('ADD_EVENT', event);
      if (newState) set(newState);
    },
    addSupplier: async (supplier) => {
      const newState = await sendAction('ADD_SUPPLIER', supplier);
      if (newState) set(newState);
    },

    registerSupporter: async (name, phone) => {
      try {
        const res = await fetch(`${getApiUrl()}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'REGISTER_SUPPORTER', payload: { name, phone } })
        });
        const data = await res.json();
        if (data) {
          set(data);
          return data.newSupporter || null;
        }
        return null;
      } catch (e) { return null; }
    },

    lookupSupporter: async (phone) => {
      try {
        const res = await fetch(`${getApiUrl()}/supporter/lookup?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        return data.found ? data.supporter : null;
      } catch (e) { return null; }
    },
  };
});
