import React, { useState, useEffect } from 'react';
import AuthPage from './pages/Auth/AuthPage.jsx';
import UserMap from './pages/User/UserMap.jsx';
import UserProfile from './pages/User/UserProfile.jsx';
import UserHistory from './pages/User/UserHistory.jsx';
import AdminOverview from './pages/Admin/AdminOverview.jsx';
import AdminLiveMap from './pages/Admin/AdminLiveMap.jsx';
import AdminUsers from './pages/Admin/AdminUsers.jsx';
import AdminHistory from './pages/Admin/AdminHistory.jsx';
import AdminSensors from './pages/Admin/AdminSensors.jsx';
import { ICar, IMap, IClock, IHistory, IUser, IHome, IUsers, ICog, ICheck } from './utils/icons.jsx';

const HOURLY_RATE = 5;
const CURRENCY = 'MAD';
const LOT_NAME = 'Parking Central Tanger';

// API backend URL mapping
const API_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [activeReservation, setActiveReservation] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [currentTab, setCurrentTab] = useState('map');
  const [isPaying, setIsPaying] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let isMounted = true;
    const fetchSpots = async () => {
      try {
        const response = await fetch(`${API_URL}/spots/`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        
        if (isMounted) {
          const mappedSpots = data.map(dbPlace => ({
            id: dbPlace.id,
            label: `A${String(dbPlace.numero % 100).padStart(2, '0')}`,
            status: dbPlace.statut === 'libre' ? 'free' : (dbPlace.statut === 'reservee' ? 'reserved' : 'occupied'),
            online: dbPlace.sensor && dbPlace.sensor.statut === 'actif',
            userId: null, plate: null, userName: null, startedAt: null, until: null
          }));
          setSpots(mappedSpots);
        }
      } catch (error) {
        console.error("Error fetching spots:", error);
      }
    };
    
    fetchSpots();
    const intervalId = setInterval(fetchSpots, 2000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
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

  const handleReserve = async (spotId, duration) => {
    try {
      const response = await fetch(`${API_URL}/reserve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          place_id: spotId, 
          utilisateur_id: user?.id || 1, 
          hours: duration 
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        showToast(data.error || 'Erreur réservation', 'err');
        return;
      }
      
      const spotIndex = spots.findIndex(s => s.id === spotId);
      const spot = spots[spotIndex];
      const startedAt = Date.parse(data.debut) || Date.now();
      const until = Date.parse(data.fin) || (startedAt + duration * 3600000);
      const amount = data.montant || (duration * HOURLY_RATE);

      setActiveReservation({
        spotId, spotIndex, label: spot?.label || spotId,
        plate: user?.plate || 'AL-4821',
        startedAt, until, amount
      });
    } catch (error) {
      showToast('Erreur serveur de réservation', 'err');
    }
  };

  const handlePaymentSimulation = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      handleEndReservation();
    }, 2500);
  };

  const handleCancelReservation = async () => {
    if (activeReservation) {
      try {
        const response = await fetch(`${API_URL}/cancel/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utilisateur_id: user?.id || 1 })
        });
        
        const data = await response.json();
        if (!response.ok) {
          showToast(data.error || 'Erreur lors de l\'annulation', 'err');
          return;
        }

        setActiveReservation(null);
        showToast(`Réservation annulée.`, 'ok');
      } catch(e) {
        showToast('Erreur serveur (Annulation)', 'err');
      }
    }
  };

  const handleEndReservation = async () => {
    if (activeReservation) {
      try {
        const response = await fetch(`${API_URL}/exit/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utilisateur_id: user?.id || 1 })
        });
        
        const data = await response.json();
        if (!response.ok) {
          showToast(data.error || 'Erreur lors de la sortie', 'err');
          return;
        }

        setActiveReservation(null);
        showToast(`Réservation terminée. Facture: ${data.fee_amount || data.fee} ${CURRENCY}`, 'ok');
      } catch(e) {
        showToast('Erreur serveur (Sortie)', 'err');
      }
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
    { id: 'history', label: 'Historique', icon: IHistory },
    { id: 'sensors', label: 'Capteurs', icon: ICog }
  ];

  const navItems = isAdmin ? adminNav : userNav;
  const pageTitles = {
    map: 'Carte en direct', active: 'Réservation active',
    history: 'Historique des réservations', profile: 'Mon profil',
    overview: 'Aperçu administration', livemap: 'Carte en direct',
    users: 'Gestion des utilisateurs', sensors: 'État des Capteurs'
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
              API_URL={API_URL}
            />
          )}
          {!isAdmin && currentTab === 'active' && (
            <div className="card">
              {activeReservation ? (
                <div style={{ padding: 28, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 8 }}>Réservation en cours</div>
                  <div style={{ fontSize: 48, fontWeight: 800 }}>Place {activeReservation.label}</div>
                  <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-blue" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)', padding: '10px 20px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--blue-100)', fontWeight: 700 }} onClick={async () => {
                      const response = await fetch(`${API_URL}/entry/`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utilisateur_id: user?.id || 1 })
                      });
                      if(response.ok) showToast('Barrière d\'entrée ouverte !', 'ok');
                      else showToast('Erreur de la barrière', 'err');
                    }}>Entrer (Simuler Barrière)</button>
                    <button className="btn btn-red" style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '10px 20px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--red-100)', fontWeight: 700 }} onClick={handlePaymentSimulation}>Sortir et Payer</button>
                    <button className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', fontWeight: 700 }} onClick={handleCancelReservation}>Annuler</button>
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
          {!isAdmin && currentTab === 'history' && <UserHistory user={user} CURRENCY={CURRENCY} />}
          {isAdmin && currentTab === 'overview' && <AdminOverview spots={spots} CURRENCY={CURRENCY} />}
          {isAdmin && currentTab === 'livemap' && <AdminLiveMap spots={spots} setSpots={setSpots} />}
          {isAdmin && currentTab === 'users' && <AdminUsers spots={spots} />}
          {isAdmin && currentTab === 'history' && <AdminHistory CURRENCY={CURRENCY} />}
          {isAdmin && currentTab === 'sensors' && <AdminSensors />}
        </div>
      </main>

      {toast && (
        <div className={`toast ${toast.type === 'err' ? 'err' : ''}`} style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'err' ? 'var(--red-600)' : 'var(--ink-900)', color: 'white', padding: '12px 22px', borderRadius: 999, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, zIndex: 999 }}>
          <ICheck size={16} />
          {toast.msg}
        </div>
      )}

      {isPaying && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: 40, borderRadius: 24, textAlign: 'center', width: 320, boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
             <div className="spinner" style={{ width: 48, height: 48, border: '4px solid var(--blue-100)', borderTopColor: 'var(--blue-600)', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
             <div style={{ fontSize: 18, fontWeight: 800 }}>Traitement sécurisé...</div>
             <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 8 }}>Veuillez patienter pendant le paiement bancaire.</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
