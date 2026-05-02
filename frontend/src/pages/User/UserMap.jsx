import React, { useState, useEffect } from 'react';
import { IMap, ILocation, IAlertTriangle, IWallet } from '../../utils/icons.jsx';
import { Stat, LegendDot, ParkingLot, Modal } from '../../components/Shared.jsx';

export default function UserMap({ user, spots, activeReservation, onReserve, onEndReservation, now, showToast, LOT_NAME, HOURLY_RATE, CURRENCY, API_URL }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState(1);
  const [step, setStep] = useState(0);

  const freeSpots = spots.filter(s => s.status === 'free').length;
  const totalSpots = spots.length;
  const occupancyRate = Math.round(((totalSpots - freeSpots) / totalSpots) * 100);
  const isFull = freeSpots === 0;
  const selectedSpot = spots.find(s => s.id === selectedId);
  const suggestedSpot = [...spots].filter(s => s.status === 'free').sort((a,b) => b.label.localeCompare(a.label))[0];

  useEffect(() => {
    if (isFull) {
      showToast('⚠️ Parking complet ! Toutes les places sont occupées', 'warn');
    }
  }, [isFull]);

  const handleSelect = (id) => {
    if (!activeReservation) {
      setSelectedId(id);
      setStep(0);
      setShowModal(true);
    }
  };

  const handleReserve = () => {
    if (selectedSpot) {
      onReserve(selectedSpot.id, duration);
      setShowModal(false);
      setSelectedId(null);
      showToast(`✅ Place ${selectedSpot.label} réservée avec succès !`, 'ok');
    }
  };

  const totalPrice = (duration * HOURLY_RATE).toFixed(2);

  const displaySpots = spots.map(s => ({
    ...s,
    isMine: activeReservation && activeReservation.spotId === s.id
  }));

  return (
    <>
      {isFull && (
        <div className="alert-banner-top" style={{ 
          position: 'sticky', top: 0, zIndex: 100,
          background: 'var(--red-600)', color: 'white', 
          padding: '12px 24px', textAlign: 'center', fontWeight: 700,
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
          margin: '-24px -24px 24px -24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
        }}>
          <IAlertTriangle size={18} />
          DÉSOLÉ : LE PARKING EST ACTUELLEMENT COMPLET
          <button className="btn btn-white" style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 12, borderRadius: 8 }} onClick={async () => {
            try {
              const response = await fetch(`${API_URL.replace('/api', '/api')}/join_queue/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ utilisateur_id: user?.id || 1 })
              });
              const data = await response.json();
              if (response.ok) showToast(data.message, 'ok');
              else showToast(data.error || 'Erreur', 'err');
            } catch (e) {
              showToast('Erreur serveur', 'err');
            }
          }}>Rejoindre la file d'attente</button>
        </div>
      )}

      {!activeReservation && suggestedSpot && !isFull && (
        <div className="suggestion-pill" onClick={() => handleSelect(suggestedSpot.id)} style={{ 
          display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', 
          background: 'white', border: '1px solid var(--blue-100)', 
          borderRadius: 16, cursor: 'pointer', marginBottom: 24,
          boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.08)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ILocation size={24} stroke="var(--blue-600)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggestion Intelligente</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>Réserver la place {suggestedSpot.label}</div>
          </div>
          <div style={{ background: 'var(--blue-600)', color: 'white', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700 }}>
            Vite ! →
          </div>
        </div>
      )}

      {activeReservation && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--blue-700), var(--blue-900))', color: 'white', marginBottom: 24 }}>
          <div className="card-body">
            <div className="row-between">
              <div className="row">
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Réservation active</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>Place {activeReservation.label}</div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{LOT_NAME} · {user.plate || 'XX-0000'}</div>
                </div>
              </div>
              <button className="btn btn-red" onClick={onEndReservation}>
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
        <Stat label="Places libres" value={freeSpots} color="green" />
        <Stat label="Tarif horaire" value={`${HOURLY_RATE} ${CURRENCY}`} color="amber" />
        <Stat label="Arduino" value={spots.filter(s => s.online).length > 0 ? 'Connecté' : 'Hors-ligne'} color={spots.filter(s => s.online).length > 0 ? 'green' : 'red'} />
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title" style={{ fontSize: 15, fontWeight: 700 }}>{LOT_NAME}</div>
            <div className="row" style={{ marginTop: 4 }}>
              <span className="live-dot" />
              <span style={{ fontSize: 11, color: 'var(--ink-500)', marginLeft: 6 }}>Mise à jour temps réel</span>
            </div>
          </div>
          <div className="row" style={{ gap: 12 }}>
            <LegendDot color="#22C55E" bg="rgba(34,197,94,.12)" label="Libre" />
            <LegendDot color="#64748B" bg="rgba(100,116,139,.15)" label="Occupée" />
            <LegendDot color="#F59E0B" bg="rgba(245,158,11,.12)" label="Réservée" />
          </div>
        </div>
        <div className="card-body">
          <ParkingLot spots={displaySpots} selectedId={selectedId} onSelect={handleSelect} />
        </div>
      </div>

      {showModal && selectedSpot && (
        <Modal title={`Réservation - Place ${selectedSpot.label}`} onClose={() => { setShowModal(false); setSelectedId(null); }}>
          {step === 0 ? (
            <>
              <div className="field">
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-700)' }}>Durée de stationnement</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 8 }}>
                  {[0.5, 1, 2, 3].map(h => (
                    <button key={h} onClick={() => setDuration(h)} style={{
                      padding: '12px', borderRadius: 10, border: 'none',
                      background: duration === h ? 'var(--blue-600)' : 'var(--ink-100)',
                      color: duration === h ? 'white' : 'var(--ink-700)',
                      fontWeight: 700, cursor: 'pointer'
                    }}>
                      {h < 1 ? '30 min' : `${h}h`}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--ink-50)', borderRadius: 12, padding: 16, marginTop: 16 }}>
                <div className="row-between"><span>Tarif horaire</span><span>{HOURLY_RATE} {CURRENCY}/h</span></div>
                <div className="row-between" style={{ marginTop: 8 }}><span>Durée</span><span>{duration < 1 ? '30 min' : `${duration} heure(s)`}</span></div>
                <div className="row-between" style={{ marginTop: 12, paddingTop: 8, borderTop: '1px dashed var(--ink-200)', fontWeight: 800, fontSize: 16 }}>
                  <span>Total</span><span>{totalPrice} {CURRENCY}</span>
                </div>
              </div>
              <button className="btn btn-blue btn-block" style={{ marginTop: 20, width: '100%' }} onClick={() => setStep(1)}>
                Continuer
              </button>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', paddingBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <IWallet size={28} stroke="var(--green-600)" />
                </div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{totalPrice} {CURRENCY}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Place {selectedSpot.label} · {duration < 1 ? '30 min' : `${duration}h`}</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1, height: 44, borderRadius: 'var(--r-md)' }} onClick={() => setStep(0)}>Retour</button>
                <button className="btn btn-blue" style={{ flex: 1, height: 44, borderRadius: 'var(--r-md)' }} onClick={handleReserve}>Confirmer</button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
