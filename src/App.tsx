import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { CashierPOS } from './pages/CashierPOS';
import { WaiterDashboard } from './pages/WaiterDashboard';
import { KitchenDisplay } from './pages/KitchenDisplay';
import { Butchery } from './pages/Butchery';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { HeadManagerDashboard } from './pages/HeadManagerDashboard';
import { EventsManager } from './pages/EventsManager';
import { SupporterCard } from './pages/SupporterCard';
import { WiFiLanding } from './pages/WiFiLanding';
import { MatlamaDashboard } from './pages/MatlamaDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="cashier" element={<CashierPOS />} />
          <Route path="waiter" element={<WaiterDashboard />} />
          <Route path="kitchen" element={<KitchenDisplay />} />
          <Route path="butchery" element={<Butchery />} />
          <Route path="butchery-manager" element={<div className="p-8">Butchery Manager Dashboard (Mock)</div>} />
          <Route path="manager" element={<ManagerDashboard />} />
          <Route path="head-manager" element={<HeadManagerDashboard />} />
          <Route path="events" element={<EventsManager />} />
          <Route path="supporter" element={<SupporterCard />} />
          <Route path="matlama" element={<MatlamaDashboard />} />
        </Route>
        <Route path="/wifi" element={<WiFiLanding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
