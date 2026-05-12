import { useState, useEffect } from 'react';
import useStore from './store/useStore';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Jars from './pages/Jars';
import Coach from './pages/Coach';
import Debts from './pages/Debts';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AddTransaction from './pages/AddTransaction';
import MoedasStore from './pages/MoedasStore';
import Investments from './pages/Investments';
import SurvivalMode from './pages/SurvivalMode';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';

import BottomNav from './components/BottomNav';
import TopBar from './components/TopBar';

function App() {
  const { currentScreen, isAuthenticated, restoreSession } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restoreSession();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient flex items-center justify-center">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A carregar...</p>
        </div>
      </div>
    );
  }

  const publicScreens = ['landing', 'login', 'register'];
  const isPublic = publicScreens.includes(currentScreen);

  if (isPublic) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {currentScreen === 'landing' && <Landing />}
        {currentScreen === 'login' && <Login />}
        {currentScreen === 'register' && <Register />}
      </div>
    );
  }

  if (currentScreen === 'onboarding') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Onboarding />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <TopBar />
      <main className="flex-1 pb-20 overflow-y-auto">
        {currentScreen === 'dashboard' && <Dashboard />}
        {currentScreen === 'jars' && <Jars />}
        {currentScreen === 'coach' && <Coach />}
        {currentScreen === 'debts' && <Debts />}
        {currentScreen === 'goals' && <Goals />}
        {currentScreen === 'profile' && <Profile />}
        {currentScreen === 'settings' && <Settings />}
        {currentScreen === 'add-transaction' && <AddTransaction />}
        {currentScreen === 'moedas' && <MoedasStore />}
        {currentScreen === 'investments' && <Investments />}
        {currentScreen === 'survival' && <SurvivalMode />}
        {currentScreen === 'notifications' && <Notifications />}
        {currentScreen === 'reports' && <Reports />}
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
