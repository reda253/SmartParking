import React, { useState, useEffect } from 'react';
import AuthPage from './pages/Auth/AuthPage.jsx';
import UserMap from './pages/User/UserMap.jsx';
import UserProfile from './pages/User/UserProfile.jsx';
import AdminOverview from './pages/Admin/AdminOverview.jsx';
import AdminLiveMap from './pages/Admin/AdminLiveMap.jsx';
import AdminUsers from './pages/Admin/AdminUsers.jsx';
import AdminHistory from './pages/Admin/AdminHistory.jsx';
import { ICar, IMap, IClock, IHistory, IUser, IHome, IUsers, ICog, ICheck } from './utils/icons.jsx';

const HOURLY_RATE = 5;
const CURRENCY = 'MAD';
const LOT_NAME = 'Parking Central Tanger';

function generateSpots(n) {
  const spots = [];
  for (let i = 0; i < n; i++) {
    spots.push({
      id: `spot-${i}`,
      label: `A${String(i + 1).padStart(2, '0')}`,
      status: 'free',
      online: false,
      userId: null,
      plate: null,
      userName: null,
      startedAt: null,
      until: null
    });
  }
  return spots;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState(() => generateSpots(4));
  const [activeReservation, setActiveReservation] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [currentTab, setCurrentTab] = useState('map');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Arduino listener placeholder
    // In the future, this is where you will connect to your Arduino API or WebSocket
    // to update the 'spots' state in real-time.
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
  };

  const handleReserve = (spotId, duration) => {
    const spotIndex = spots.findIndex(s => s.id === spotId);
    const spot = spots[spotIndex];
    const startedAt = Date.now();
    const until = startedAt + duration * 3600000;
    const amount = duration * HOURLY_RATE;

    setActiveReservation({
      spotId, spotIndex, label: spot.label,
      plate: user?.plate || 'AL-4821',
      startedAt, until, amount
    });

    setSpots(prev => prev.map((s, i) =>
      i === spotIndex ? { ...s, status: 'reserved', userName: user?.name, plate: user?.plate, startedAt, until } : s
    ));
  };

  const handleEndReservation = () => {
    if (activeReservation) {
      setSpots(prev => prev.map((s, i) =>
        i === activeReservation.spotIndex ? { ...s, status: 'free', userName: null, plate: null, startedAt: null, until: null } : s
      ));
      setActiveReservation(null);
      showToast('Réservation terminée', 'ok');
    }
  };

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  const userNav = [
    { id: 'map', label: 'Carte en direct', icon: IMap },
    { id: 'active', label: 'Réservation active', icon: IClock, badge: activeReservation ? 1 : null },
    { id: 'history', label: 'Historique', icon: IHistory },
    { id: 'profile', label: 'Mon profil', icon: IUser }
  ];

  const adminNav = [
    { id: 'overview', label: 'Aperçu', icon: IHome },
    { id: 'livemap', label: 'Carte en direct', icon: IMap },
    { id: 'users', label: 'Utilisateurs', icon: IUsers },
    { id: 'history', label: 'Historique', icon: IHistory }
  ];

  const navItems = isAdmin ? adminNav : userNav;
  const pageTitles = {
    map: 'Carte en direct', active: 'Réservation active',
    history: 'Historique', profile: 'Mon profil',
    overview: 'Aperçu administration', livemap: 'Carte en direct',
    users: 'Gestion des utilisateurs', history: 'Historique des réservations'
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><ICar size={18} /></div>
          <div>
            <div>ParkSense</div>
            <div style={{ fontSize: 10, color: 'var(--ink-500)', fontWeight: 600 }}>{isAdmin ? 'Admin' : 'Utilisateur'}</div>
          </div>
        </div>
        <div className="nav-section">{isAdmin ? 'Gestion' : 'Menu'}</div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} className="nav-item" data-active={currentTab === item.id ? '1' : '0'} onClick={() => setCurrentTab(item.id)}>
              <Icon size={16} />
              {item.label}
              {item.badge && <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{item.badge}</span>}
            </button>
          );
        })}

        <div className="sidebar-user">
          <div className="row">
            <div className="avatar" style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
              {user.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{isAdmin ? 'Administrateur' : 'Client'}</div>
            </div>
            <button onClick={() => setUser(null)}><ICog size={15} /></button>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{pageTitles[currentTab]}</div>
            <div className="topbar-sub">{LOT_NAME} · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          <div className="row" style={{ gap: 8, fontSize: 12, fontWeight: 700, background: spots.filter(s => s.online).length > 0 ? 'var(--green-50)' : 'var(--red-50)', padding: '8px 16px', borderRadius: 999, display: 'flex', alignItems: 'center', color: spots.filter(s => s.online).length > 0 ? 'var(--green-700)' : 'var(--red-700)' }}>
            <span className={`live-dot ${spots.filter(s => s.online).length === 0 ? 'red' : ''}`} />
            {spots.filter(s => s.online).length > 0 ? `Arduino live · ${spots.filter(s => s.online).length} capteurs actifs` : 'Arduino hors-ligne'}
          </div>
        </div>

        <div className="content">
          {!isAdmin && currentTab === 'map' && (
            <UserMap
              user={user} spots={spots} activeReservation={activeReservation}
              onReserve={handleReserve} onEndReservation={handleEndReservation}
              now={currentTime} showToast={showToast} LOT_NAME={LOT_NAME} HOURLY_RATE={HOURLY_RATE} CURRENCY={CURRENCY}
            />
          )}
          {!isAdmin && currentTab === 'active' && (
            <div className="card">
              {activeReservation ? (
                <div style={{ padding: 28, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 8 }}>Réservation en cours</div>
                  <div style={{ fontSize: 48, fontWeight: 800 }}>Place {activeReservation.label}</div>
                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-red" style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '10px 20px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--red-100)', fontWeight: 700 }} onClick={handleEndReservation}>Terminer la réservation</button>
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🅿️</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Aucune réservation active</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Allez sur la carte pour réserver une place</div>
                </div>
              )}
            </div>
          )}

          {!isAdmin && currentTab === 'profile' && <UserProfile user={user} onLogout={() => setUser(null)} />}
          {isAdmin && currentTab === 'overview' && <AdminOverview spots={spots} CURRENCY={CURRENCY} />}
          {isAdmin && currentTab === 'livemap' && <AdminLiveMap spots={spots} setSpots={setSpots} />}
          {isAdmin && currentTab === 'users' && <AdminUsers spots={spots} />}
          {isAdmin && currentTab === 'history' && <AdminHistory CURRENCY={CURRENCY} />}
        </div>
      </main>

      {toast && (
        <div className={`toast ${toast.type === 'err' ? 'err' : ''}`} style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'err' ? 'var(--red-600)' : 'var(--ink-900)', color: 'white', padding: '12px 22px', borderRadius: 999, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, zIndex: 999 }}>
          <ICheck size={16} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
