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
      points: 120,
      tier: 'Silver',
      registeredAt: '2025-11-10',
      totalSpent: 6000,
      totalDonated: 300,
      transactions: [
        { txId: 'TX-A001', date: '2026-04-15', amount: 250, donation: 12.5, points: 5, items: 'Lamb Chops, Jagger Bomb' },
        { txId: 'TX-A002', date: '2026-04-28', amount: 370, donation: 18.5, points: 7, items: 'Combo for 2' },
      ]
    },
    {
      id: 'TSP-00002',
      name: 'Mpho Letsie',
      phone: '+266 6273 1332',
      points: 45,
      tier: 'Bronze',
      registeredAt: '2026-01-05',
      totalSpent: 2250,
      totalDonated: 112.5,
      transactions: [
        { txId: 'TX-B001', date: '2026-03-10', amount: 190, donation: 9.5, points: 3, items: 'Combo for 1' },
      ]
    },
    {
      id: 'TSP-00003',
      name: "'Mare Mokoena",
      phone: '+266 5812 3456',
      points: 300,
      tier: 'Gold',
      registeredAt: '2025-09-20',
      totalSpent: 15000,
      totalDonated: 750,
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

// Look up supporter by phone number (used at Cashier checkout)
app.get('/api/supporter/lookup', (req, res) => {
  const { phone } = req.query;
  const supporter = state.supporters.find(s =>
    s.phone.replace(/\s/g, '') === String(phone).replace(/\s/g, '')
  );
  if (supporter) {
    res.json({ found: true, supporter });
  } else {
    res.json({ found: false });
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
        points: 0,
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lecholi Sync Server running on port ${PORT}`);
});
