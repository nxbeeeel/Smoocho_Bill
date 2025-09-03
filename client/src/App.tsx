import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import UpdateManagementPage from './pages/UpdateManagementPage';
import MenuEditorPage from './pages/MenuEditorPage';
import SettingsPage from './pages/SettingsPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  // TEMPORARY: Force authentication for testing - REMOVE THIS LATER
  const testUser = { id: '1', username: 'admin', role: 'admin' };
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/updates" element={<UpdateManagementPage />} />
        <Route path="/menu-editor" element={<MenuEditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
