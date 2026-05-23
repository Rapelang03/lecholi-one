import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Helper: generate unique supporter ID  e.g. TSP-00042
let supporterCounter = 3;
const genSupporterId = () => {
  supporterCounter++;
  return `TSP-${String(supporterCounter).padStart(5, '0')}`;
};

// In-memory database
let state = {
  menu: [
    // Combos
    { id: 'c1', name: 'Combo for 1 (1 rib, 1 leg, 1 beef)', price: 190, category: 'Combos', stock: 50, minStock: 10, image: '/assets/platebreadchipssaladmeat.jpg' },
    { id: 'c2', name: 'Combo for 2 (2 ribs, 1 leg, 2 beef, 2 wors)', price: 370, category: 'Combos', stock: 50, minStock: 10, image: '/assets/meatchipssaladplate.jpg' },
    { id: 'c3', name: 'Combo for 3 (3 ribs, 1/2 chicken, 3 beef, 3 wors)', price: 560, category: 'Combos', stock: 30, minStock: 5, image: '/assets/drinkchipssaladmeatplate.jpg' },
    { id: 'c4', name: 'Combo for 4 (4 ribs, 8 wings, 4 beef, 4 wors)', price: 750, category: 'Combos', stock: 30, minStock: 5, image: '/assets/saladmeatchipspizzaplate.jpg' },
    { id: 'c5', name: 'Combo for 5 (5 ribs, full chicken, 5 beef)', price: 940, category: 'Combos', stock: 20, minStock: 5, image: '/assets/meatsaladchupspizzaplate.jpg' },
    { id: 'c6', name: 'Combo for 1 (2 ribs, 2 wings, 1 pork chop)', price: 150, category: 'Combos', stock: 50, minStock: 10, image: '/assets/platebreadchipssaladmeat.jpg' },
    { id: 'c7', name: 'Combo for 2 (4 ribs, 4 wings, 2 pork chops)', price: 290, category: 'Combos', stock: 40, minStock: 10, image: '/assets/meatchipssaladplate.jpg' },
    { id: 'c8', name: 'Combo for 3 (6 ribs, 6 wings, 3 pork chops)', price: 430, category: 'Combos', stock: 30, minStock: 5, image: '/assets/drinkchipssaladmeatplate.jpg' },
    // Beverages - Mixers
    { id: 'b1', name: 'Schweppes Tonic Water 200ml', price: 15, category: 'Beverages', stock: 100, minStock: 20, image: '/assets/beveragesmenu.jpg' },
    { id: 'b2', name: 'Schweppes Lemonade 200ml', price: 15, category: 'Beverages', stock: 100, minStock: 20, image: '/assets/beveragesmenu.jpg' },
    { id: 'b3', name: 'Schweppes Dry Lemon 200ml', price: 15, category: 'Beverages', stock: 100, minStock: 20, image: '/assets/beveragesmenu.jpg' },
    { id: 'b4', name: 'Schweppes Ginger Ale 200ml', price: 15, category: 'Beverages', stock: 100, minStock: 20, image: '/assets/beveragesmenu.jpg' },
    { id: 'b5', name: 'Still water 500ml', price: 15, category: 'Beverages', stock: 100, minStock: 20, image: '/assets/beveragesmenu.jpg' },
    { id: 'b6', name: 'Still water 1.5 L', price: 20, category: 'Beverages', stock: 100, minStock: 20, image: '/assets/beveragesmenu.jpg' },
    { id: 'b7', name: 'Alkaline water (pH10) 500ml', price: 15, category: 'Beverages', stock: 100, minStock: 20, image: '/assets/beveragesmenu.jpg' },
    // Beverages - Spirits
    { id: 'b8', name: 'Tanqueray Imported Shot', price: 30, category: 'Beverages', stock: 40, minStock: 10, image: '/assets/beveragesmenu.jpg' },
    { id: 'b9', name: "Gordon's Shot", price: 25, category: 'Beverages', stock: 50, minStock: 10, image: '/assets/beveragesmenu.jpg' },
    { id: 'b10', name: "Jack Daniel's", price: 30, category: 'Beverages', stock: 40, minStock: 10, image: '/assets/beveragesmenu.jpg' },
    { id: 'b11', name: 'Jameson', price: 30, category: 'Beverages', stock: 40, minStock: 10, image: '/assets/beveragesmenu.jpg' },
    { id: 'b12', name: 'Glenlivet 12yrs', price: 40, category: 'Beverages', stock: 20, minStock: 5, image: '/assets/beveragesmenu.jpg' },
    { id: 'b13', name: 'Hennessy', price: 45, category: 'Beverages', stock: 20, minStock: 5, image: '/assets/beveragesmenu.jpg' },
    { id: 'b14', name: 'Remy Martin', price: 60, category: 'Beverages', stock: 15, minStock: 5, image: '/assets/beveragesmenu.jpg' },
    // Wines & Cocktails
    { id: 'b15', name: 'Fat Bastard Merlot', price: 260, category: 'Beverages', stock: 15, minStock: 5, image: '/assets/beveragesmenu.jpg' },
    { id: 'b16', name: 'Nederburg Barone', price: 180, category: 'Beverages', stock: 20, minStock: 5, image: '/assets/beveragesmenu.jpg' },
    { id: 'b17', name: 'Jagger Bomb', price: 40, category: 'Beverages', stock: 50, minStock: 10, image: '/assets/beveragesmenu.jpg' },
    { id: 'b18', name: 'Springboks', price: 40, category: 'Beverages', stock: 50, minStock: 10, image: '/assets/beveragesmenu.jpg' },
    { id: 'b19', name: 'Lecholi Liquid Cocaine', price: 30, category: 'Beverages', stock: 50, minStock: 10, image: '/assets/beveragesmenu.jpg' },
    // Grills
    { id: 'g1', name: 'Lamb Chops (220g)', price: 150, category: 'Grills', stock: 40, minStock: 10, image: '/assets/grillmeatmenu.png' },
    { id: 'g2', name: 'Lamb Chops (400g)', price: 230, category: 'Grills', stock: 40, minStock: 10, image: '/assets/grillmeatmenu.png' },
    { id: 'g3', name: 'T-Bone (220g)', price: 150, category: 'Grills', stock: 30, minStock: 5, image: '/assets/grillmeatmenu.png' },
    { id: 'g4', name: 'T-Bone (400g)', price: 230, category: 'Grills', stock: 30, minStock: 5, image: '/assets/grillmeatmenu.png' },
    { id: 'g5', name: 'Trout (200g)', price: 115, category: 'Grills', stock: 20, minStock: 5, image: '/assets/grillmeatmenu.png' },
    { id: 'g6', name: 'Loin Chops (200g)', price: 90, category: 'Grills', stock: 45, minStock: 10, image: '/assets/grillmeatmenu.png' },
    { id: 'g7', name: 'Loin Ribs (400g)', price: 150, category: 'Grills', stock: 45, minStock: 10, image: '/assets/grillmeatmenu.png' },
    { id: 'g8', name: 'Wings (3 wings)', price: 80, category: 'Grills', stock: 60, minStock: 15, image: '/assets/grillmeatmenu.png' },
    { id: 'g9', name: 'Wings (6 wings)', price: 120, category: 'Grills', stock: 60, minStock: 15, image: '/assets/grillmeatmenu.png' },
    { id: 'g10', name: 'Q-Leg with fries & salad', price: 80, category: 'Grills', stock: 50, minStock: 10, image: '/assets/grillmeatmenu.png' },
    // Burgers
    { id: 'bg1', name: 'Classic Burger', price: 65, category: 'Burgers', stock: 50, minStock: 10, image: '/assets/burgermeatchipsplate.jpg' },
    { id: 'bg2', name: 'Chicken Burger', price: 54.90, category: 'Burgers', stock: 50, minStock: 10, image: '/assets/burgermeatchipsplate.jpg' },
    { id: 'bg3', name: "People's Choice", price: 70, category: 'Burgers', stock: 50, minStock: 10, image: '/assets/burgermeatchipsplate.jpg' },
    { id: 'bg4', name: 'Spicy Burger', price: 55, category: 'Burgers', stock: 50, minStock: 10, image: '/assets/bunsmeadchipssaladplate.jpg' },
    { id: 'bg5', name: 'Classic Burger Meal', price: 110, category: 'Burgers', stock: 40, minStock: 10, image: '/assets/burgermeatchipsplate.jpg' },
    { id: 'bg6', name: 'Chicken Burger Meal', price: 100, category: 'Burgers', stock: 40, minStock: 10, image: '/assets/burgermeatchipsplate.jpg' },
    { id: 'bg7', name: 'Rib Burger Meal', price: 125, category: 'Burgers', stock: 30, minStock: 10, image: '/assets/bunsmeadchipssaladplate.jpg' },
    // Pasta & Seafood
    { id: 'p1', name: 'Creamy Chicken Pasta', price: 65, category: 'Pasta & Seafood', stock: 40, minStock: 10, image: '/assets/pastaandseafoodmenu.jpg' },
    { id: 'p2', name: 'Shrimp Pasta', price: 65.90, category: 'Pasta & Seafood', stock: 30, minStock: 5, image: '/assets/pastaandseafoodmenu.jpg' },
    { id: 'p3', name: 'Tuna Pasta', price: 65, category: 'Pasta & Seafood', stock: 30, minStock: 5, image: '/assets/pastaandseafoodmenu.jpg' },
    { id: 'p4', name: 'Prawn Pasta', price: 65, category: 'Pasta & Seafood', stock: 30, minStock: 5, image: '/assets/pastaandseafoodmenu.jpg' },
    { id: 'p5', name: 'Hake & Fries', price: 80, category: 'Pasta & Seafood', stock: 40, minStock: 10, image: '/assets/chipsandsaladstartersplate.jpg' },
    { id: 'p6', name: 'Creamy garlic prawns', price: 75, category: 'Pasta & Seafood', stock: 30, minStock: 10, image: '/assets/pastaandseafoodmenu.jpg' },
    { id: 'p7', name: 'Trout with fries & salad', price: 105, category: 'Pasta & Seafood', stock: 20, minStock: 5, image: '/assets/chipsandsaladstartersplate.jpg' },
    // Pizza
    { id: 'pz1', name: 'Beefy Beltà (Medium)', price: 80, category: 'Pizza', stock: 50, minStock: 10, image: '/assets/pizza.jpg' },
    { id: 'pz2', name: 'Beefy Beltà (Large)', price: 120, category: 'Pizza', stock: 50, minStock: 10, image: '/assets/pizza.jpg' },
    { id: 'pz3', name: 'Texas BBQ (Medium)', price: 80, category: 'Pizza', stock: 50, minStock: 10, image: '/assets/pizzaanddrinkplate.jpg' },
    { id: 'pz4', name: 'Texas BBQ (Large)', price: 120, category: 'Pizza', stock: 50, minStock: 10, image: '/assets/pizzaanddrinkplate.jpg' },
    { id: 'pz5', name: 'Sausage Sam (Medium)', price: 80, category: 'Pizza', stock: 50, minStock: 10, image: '/assets/pizza.jpg' },
    { id: 'pz6', name: 'Garden Giggle (Large)', price: 120, category: 'Pizza', stock: 50, minStock: 10, image: '/assets/pizza.jpg' },
    { id: 'pz7', name: 'Chicken & Mushroom (Large)', price: 120, category: 'Pizza', stock: 50, minStock: 10, image: '/assets/pizza.jpg' },
    { id: 'pz8', name: 'Meaty Smirks (Medium)', price: 90, category: 'Pizza', stock: 40, minStock: 10, image: '/assets/pizza.jpg' },
    { id: 'pz9', name: 'Meaty Smirks (Large)', price: 140, category: 'Pizza', stock: 40, minStock: 10, image: '/assets/pizza.jpg' },
    { id: 'pz10', name: '3 Mini Pizzas', price: 75, category: 'Pizza', stock: 60, minStock: 10, image: '/assets/pizza.jpg' },
    // Salads
    { id: 's1', name: 'Garden Salad', price: 35, category: 'Salads', stock: 50, minStock: 10, image: '/assets/saladmeatplate.jpg' },
    { id: 's2', name: 'Greek Salad', price: 35.90, category: 'Salads', stock: 30, minStock: 10, image: '/assets/saladmeatplate.jpg' },
    { id: 's3', name: 'Green Salad', price: 35, category: 'Salads', stock: 40, minStock: 10, image: '/assets/saladmeatplate.jpg' },
    { id: 's4', name: 'Potato Salad', price: 35, category: 'Salads', stock: 40, minStock: 10, image: '/assets/saladmeatplate.jpg' },
    { id: 's5', name: 'Chicken Salad', price: 55, category: 'Salads', stock: 30, minStock: 10, image: '/assets/saladmeatplate.jpg' },
    { id: 's6', name: 'Juicy Steak Salad', price: 55, category: 'Salads', stock: 25, minStock: 5, image: '/assets/saladmeatplate.jpg' },
    { id: 's7', name: 'Grilled Pork Salad', price: 55, category: 'Salads', stock: 25, minStock: 5, image: '/assets/saladmeatplate.jpg' },
    { id: 's8', name: 'Tuna Salad', price: 65, category: 'Salads', stock: 20, minStock: 5, image: '/assets/saladmeatplate.jpg' },
    { id: 's9', name: 'Shrimp Veggie Salad', price: 65, category: 'Salads', stock: 20, minStock: 5, image: '/assets/saladmeatplate.jpg' },
    // Butchery
    { id: 'rm1', name: 'Beef Short Rib (Raw)', price: 140, category: 'Raw Meat', stock: 100, minStock: 20 },
    { id: 'rm2', name: 'Lamb Chops (Raw)', price: 180, category: 'Raw Meat', stock: 80, minStock: 20 },
  ],
  tables: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    status: 'Free',
  })),
  orders: [],
  totalDonations: 1500,

  // Enhanced supporter model
  supporters: [
    {
      id: 'TSP-00001',
      name: 'Thabo Ntsane',
      phone: '+266 5873 1332',
      email: 'thabo@gmail.com',
      address: 'Maseru West',
      isTsePutsoa: true,
      supporterNumber: '123456',
      points: 120,
      walletBalance: 150,
      tier: 'Silver',
      registeredAt: '2025-11-10',
      totalSpent: 6000,
      totalDonated: 300,
      password: 'password123',
      bankingDetails: {
        type: 'M-Pesa',
        mpesaNumber: '+266 5873 1332',
        mpesaBalance: 1250,
        ecocashNumber: '',
        ecocashBalance: 0,
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardHolderName: '',
        cardBalance: 0
      },
      transactions: [
        { txId: 'TX-A001', date: '2026-04-15', amount: 250, donation: 12.5, points: 5, items: 'Lamb Chops, Jagger Bomb' },
        { txId: 'TX-A002', date: '2026-04-28', amount: 370, donation: 18.5, points: 7, items: 'Combo for 2' },
      ]
    },
    {
      id: 'TSP-00002',
      name: 'Mpho Letsie',
      phone: '+266 6273 1332',
      email: 'mpho@gmail.com',
      address: 'Berea',
      isTsePutsoa: false,
      supporterNumber: '',
      points: 45,
      walletBalance: 50,
      tier: 'Bronze',
      registeredAt: '2026-01-05',
      totalSpent: 2250,
      totalDonated: 112.5,
      password: 'password123',
      bankingDetails: {
        type: 'EcoCash',
        mpesaNumber: '',
        mpesaBalance: 0,
        ecocashNumber: '+266 6273 1332',
        ecocashBalance: 850,
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardHolderName: '',
        cardBalance: 0
      },
      transactions: [
        { txId: 'TX-B001', date: '2026-03-10', amount: 190, donation: 9.5, points: 3, items: 'Combo for 1' },
      ]
    },
    {
      id: 'TSP-00003',
      name: "'Mare Mokoena",
      phone: '+266 5812 3456',
      email: 'mare@gmail.com',
      address: 'Leribe',
      isTsePutsoa: true,
      supporterNumber: '654321',
      points: 300,
      walletBalance: 300,
      tier: 'Gold',
      registeredAt: '2025-09-20',
      totalSpent: 15000,
      totalDonated: 750,
      password: 'password123',
      bankingDetails: {
        type: 'Card',
        mpesaNumber: '',
        mpesaBalance: 0,
        ecocashNumber: '',
        ecocashBalance: 0,
        cardNumber: '4000123456789010',
        cardExpiry: '12/28',
        cardCvv: '123',
        cardHolderName: "'Mare Mokoena",
        cardBalance: 5000
      },
      transactions: [
        { txId: 'TX-C001', date: '2026-04-01', amount: 940, donation: 47, points: 18, items: 'Combo for 5' },
        { txId: 'TX-C002', date: '2026-04-22', amount: 560, donation: 28, points: 11, items: 'Combo for 3, Fat Bastard Merlot' },
      ]
    },
  ],

  events: [],
  suppliers: [
    { id: 'sup1', name: 'Sefalana Lesotho', contact: '+266 2232 4455', category: 'Dry Goods' },
    { id: 'sup2', name: 'Lesotho Meat Packers', contact: '+266 2231 1122', category: 'Meat' },
  ]
};

// ── API Endpoints ───────────────────────────────────────────────────────────

// Full state snapshot (polled every second by all clients)
app.get('/api/state', (req, res) => res.json(state));

// Look up supporter by phone, email, TSP-ID, or Matlama supporter number (used at Cashier checkout and login)
app.get('/api/supporter/lookup', (req, res) => {
  const queryVal = String(req.query.query || req.query.phone || '').trim().replace(/\s/g, '').toLowerCase();
  
  const supporter = state.supporters.find(s =>
    s.phone.replace(/\s/g, '').toLowerCase() === queryVal ||
    s.id.replace(/\s/g, '').toLowerCase() === queryVal ||
    (s.supporterNumber && s.supporterNumber.replace(/\s/g, '').toLowerCase() === queryVal) ||
    (s.email && s.email.toLowerCase() === queryVal)
  );
  if (supporter) {
    res.json({ found: true, supporter });
  } else {
    res.json({ found: false });
  }
});

// Supporter secure login verification
app.post('/api/supporter/login', (req, res) => {
  const { query, password } = req.body;
  const searchStr = String(query || '').trim().replace(/\s/g, '').toLowerCase();
  
  const supporter = state.supporters.find(s =>
    s.phone.replace(/\s/g, '').toLowerCase() === searchStr ||
    s.id.replace(/\s/g, '').toLowerCase() === searchStr ||
    (s.supporterNumber && s.supporterNumber.replace(/\s/g, '').toLowerCase() === searchStr) ||
    (s.email && s.email.toLowerCase() === searchStr)
  );
  
  if (supporter) {
    const expectedPassword = supporter.password || 'password123';
    if (password === expectedPassword) {
      res.json({ success: true, supporter });
    } else {
      res.json({ success: false, message: 'Invalid password. Please try again.' });
    }
  } else {
    res.json({ success: false, message: 'No customer account found with this credential.' });
  }
});

// Matlama reporting summary (used by Matlama Admin dashboard)
app.get('/api/matlama/report', (req, res) => {
  const totalMembers = state.supporters.length;
  const totalDonations = state.totalDonations;
  const allTransactions = state.supporters.flatMap(s =>
    s.transactions.map(tx => ({
      ...tx,
      supporterId: s.id,
      supporterName: s.name,
    }))
  );
  const totalTransactions = allTransactions.length;
  const topSupporter = [...state.supporters].sort((a, b) => b.totalDonated - a.totalDonated)[0];
  res.json({ totalMembers, totalDonations, totalTransactions, allTransactions, topSupporter, supporters: state.supporters });
});

// Actions endpoint
app.post('/api/action', (req, res) => {
  const { type, payload } = req.body;

  switch (type) {
    case 'ADD_ORDER': {
      const newOrder = { ...payload, id: Math.random().toString(36).substr(2, 9), timestamp: new Date() };
      state.orders.push(newOrder);

      // If a supporter is linked and payment method is selected
      if (newOrder.supporterId && newOrder.paymentMethod) {
        const supporter = state.supporters.find(s => s.id === newOrder.supporterId);
        if (supporter) {
          const totalAmt = newOrder.total;
          if (newOrder.paymentMethod === 'Wallet') {
            supporter.walletBalance = Math.max(0, (supporter.walletBalance || 0) - totalAmt);
          } else if (newOrder.paymentMethod === 'M-Pesa') {
            if (supporter.bankingDetails) {
              supporter.bankingDetails.mpesaBalance = Math.max(0, (supporter.bankingDetails.mpesaBalance || 0) - totalAmt);
            }
          } else if (newOrder.paymentMethod === 'EcoCash') {
            if (supporter.bankingDetails) {
              supporter.bankingDetails.ecocashBalance = Math.max(0, (supporter.bankingDetails.ecocashBalance || 0) - totalAmt);
            }
          } else if (newOrder.paymentMethod === 'Card') {
            if (supporter.bankingDetails) {
              supporter.bankingDetails.cardBalance = Math.max(0, (supporter.bankingDetails.cardBalance || 0) - totalAmt);
            }
          }
        }
      }

      newOrder.items.forEach(item => {
        const menuItem = state.menu.find(m => m.id === item.id);
        if (menuItem) menuItem.stock -= item.quantity;
      });
      break;
    }
    case 'UPDATE_ORDER_STATUS': {
      const order = state.orders.find(o => o.id === payload.orderId);
      if (order) order.status = payload.status;
      break;
    }
    case 'UPDATE_TABLE_STATUS': {
      const table = state.tables.find(t => t.id === payload.id);
      if (table) table.status = payload.status;
      break;
    }
    case 'REQUEST_BILL': {
      const t = state.tables.find(t => t.id === payload.tableId);
      if (t) t.needsBill = true;
      break;
    }
    case 'CLEAR_TABLE': {
      const clearT = state.tables.find(t => t.id === payload.tableId);
      if (clearT) { clearT.status = 'Free'; clearT.needsBill = false; clearT.currentOrderId = undefined; }
      break;
    }
    case 'ADD_DONATION': {
      state.totalDonations += payload.amount;
      if (payload.supporterId) {
        const supporter = state.supporters.find(s => s.id === payload.supporterId);
        if (supporter) {
          // M50 = 1 Point
          supporter.points += Math.floor(payload.purchaseAmount / 50);
          supporter.totalSpent = (supporter.totalSpent || 0) + payload.purchaseAmount;
          supporter.totalDonated = (supporter.totalDonated || 0) + payload.amount;
          // Update tier
          if (supporter.points >= 500) supporter.tier = 'Platinum';
          else if (supporter.points >= 200) supporter.tier = 'Gold';
          else if (supporter.points >= 80) supporter.tier = 'Silver';
          else supporter.tier = 'Bronze';
          // Log transaction
          supporter.transactions.push({
            txId: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            date: new Date().toISOString().split('T')[0],
            amount: payload.purchaseAmount,
            donation: payload.amount,
            points: Math.floor(payload.purchaseAmount / 50),
            items: payload.items || 'Lecholi Purchase',
          });
        }
      }
      break;
    }
    case 'REGISTER_SUPPORTER': {
      const newId = genSupporterId();
      const newSupporter = {
        id: newId,
        name: payload.name,
        phone: payload.phone,
        email: payload.email || '',
        address: payload.address || '',
        isTsePutsoa: !!payload.isTsePutsoa,
        supporterNumber: payload.supporterNumber || '',
        bankingDetails: payload.bankingDetails || { type: 'None' },
        password: payload.password || 'password123',
        points: 0,
        walletBalance: 0,
        tier: 'Bronze',
        registeredAt: new Date().toISOString().split('T')[0],
        totalSpent: 0,
        totalDonated: 0,
        transactions: [],
      };
      state.supporters.push(newSupporter);
      // Return the new supporter directly in the response
      res.json({ newSupporter, ...state });
      return;
    }
    case 'ADD_EVENT':
      state.events.push({ ...payload, id: Math.random().toString(36).substr(2, 9) });
      break;
    case 'UPDATE_STOCK': {
      const stockItem = state.menu.find(m => m.id === payload.id);
      if (stockItem) stockItem.stock += payload.quantity;
      break;
    }
    case 'ADD_SUPPLIER':
      state.suppliers.push({ ...payload, id: Math.random().toString(36).substr(2, 9) });
      break;
    case 'CONVERT_POINTS_TO_CASH': {
      const { supporterId, pointsToConvert } = payload;
      const supporter = state.supporters.find(s => s.id === supporterId);
      if (supporter && supporter.points >= pointsToConvert) {
        supporter.points -= pointsToConvert;
        const cashAmount = pointsToConvert * 2.0; // 1 point = M2.00 (2 loti)
        supporter.walletBalance = (supporter.walletBalance || 0) + cashAmount;
        supporter.transactions.push({
          txId: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          donation: 0,
          points: -pointsToConvert,
          items: `Converted ${pointsToConvert} Points to M${cashAmount.toFixed(2)} Wallet Cash`,
        });
      }
      break;
    }
    case 'PLACE_CUSTOMER_ORDER': {
      const { supporterId, items, total, type, tableNumber, paymentMethod, donationAmount } = payload;
      const supporter = state.supporters.find(s => s.id === supporterId);

      if (paymentMethod === 'Wallet') {
        if (!supporter || (supporter.walletBalance || 0) < total) {
          break; // Insufficient funds
        }
        supporter.walletBalance -= total;
      } else if (paymentMethod === 'M-Pesa') {
        if (!supporter || !supporter.bankingDetails || (supporter.bankingDetails.mpesaBalance || 0) < total) {
          break; // Insufficient funds
        }
        supporter.bankingDetails.mpesaBalance -= total;
      } else if (paymentMethod === 'EcoCash') {
        if (!supporter || !supporter.bankingDetails || (supporter.bankingDetails.ecocashBalance || 0) < total) {
          break; // Insufficient funds
        }
        supporter.bankingDetails.ecocashBalance -= total;
      } else if (paymentMethod === 'Card') {
        if (!supporter || !supporter.bankingDetails || (supporter.bankingDetails.cardBalance || 0) < total) {
          break; // Insufficient funds
        }
        supporter.bankingDetails.cardBalance -= total;
      }

      const newOrder = {
        id: Math.random().toString(36).substr(2, 9),
        items,
        total,
        status: 'Pending',
        type,
        tableNumber: type === 'Dine-in' ? tableNumber : undefined,
        timestamp: new Date(),
        supporterId,
        paymentMethod,
        isDonationApplied: true,
        donationAmount: donationAmount || 0,
      };

      state.orders.push(newOrder);

      // Update stock
      items.forEach(item => {
        const menuItem = state.menu.find(m => m.id === item.id);
        if (menuItem) menuItem.stock -= item.quantity;
      });

      // Reward points
      if (supporter) {
        const earnedPoints = Math.floor(total / 50);
        supporter.points += earnedPoints;
        supporter.totalSpent = (supporter.totalSpent || 0) + total;
        supporter.totalDonated = (supporter.totalDonated || 0) + (donationAmount || 0);
        state.totalDonations += (donationAmount || 0);

        // Update tier
        if (supporter.points >= 500) supporter.tier = 'Platinum';
        else if (supporter.points >= 200) supporter.tier = 'Gold';
        else if (supporter.points >= 80) supporter.tier = 'Silver';
        else supporter.tier = 'Bronze';

        // Log transaction
        const itemsDesc = items.map(c => `${c.quantity}x ${c.name}`).join(', ');
        supporter.transactions.push({
          txId: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          date: new Date().toISOString().split('T')[0],
          amount: total,
          donation: donationAmount || 0,
          points: earnedPoints,
          items: `${itemsDesc} (Paid via ${paymentMethod})`,
        });
      }
      break;
    }
    case 'UPDATE_CUSTOMER_PROFILE': {
      const { supporterId, name, phone, email, address, bankingDetails } = payload;
      const supporter = state.supporters.find(s => s.id === supporterId);
      if (supporter) {
        supporter.name = name;
        supporter.phone = phone;
        if (email !== undefined) supporter.email = email;
        if (address !== undefined) supporter.address = address;
        if (bankingDetails) {
          supporter.bankingDetails = {
            ...supporter.bankingDetails,
            type: bankingDetails.type,
            mpesaNumber: bankingDetails.mpesaNumber || '',
            mpesaBalance: supporter.bankingDetails?.mpesaNumber === bankingDetails.mpesaNumber 
              ? (supporter.bankingDetails?.mpesaBalance ?? 1500) 
              : (bankingDetails.mpesaNumber ? 1500 : 0),
            ecocashNumber: bankingDetails.ecocashNumber || '',
            ecocashBalance: supporter.bankingDetails?.ecocashNumber === bankingDetails.ecocashNumber
              ? (supporter.bankingDetails?.ecocashBalance ?? 800)
              : (bankingDetails.ecocashNumber ? 800 : 0),
            cardNumber: bankingDetails.cardNumber || '',
            cardExpiry: bankingDetails.cardExpiry || '',
            cardCvv: bankingDetails.cardCvv || '',
            cardHolderName: bankingDetails.cardHolderName || '',
            cardBalance: supporter.bankingDetails?.cardNumber === bankingDetails.cardNumber
              ? (supporter.bankingDetails?.cardBalance ?? 4500)
              : (bankingDetails.cardNumber ? 4500 : 0)
          };
        }
      }
      break;
    }
  }

  res.json(state);
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files from 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all other routes to React's index.html
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lecholi Sync Server running on port ${PORT}`);
});
