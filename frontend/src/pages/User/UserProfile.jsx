import React, { useState } from 'react';
import { IUser, IMail, ICar, ICheck, ILock, ICog } from '../../utils/icons.jsx';

export default function UserProfile({ user, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [plate, setPlate] = useState(user?.plate || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="profile-container" style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
      <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
        {/* Banner */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(135deg, var(--blue-600), var(--blue-800))' }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
          <div className="avatar" style={{ width: 96, height: 96, fontSize: 32, border: '4px solid white', boxShadow: 'var(--shadow-md)', background: 'var(--ink-900)' }}>
            {name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'U'}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 4px' }}>{name}</h2>
          <p style={{ color: 'var(--ink-500)', fontSize: 14, fontWeight: 500, margin: 0 }}>
            {user?.role === 'admin' ? 'Administrateur' : 'Client ParkSense'}
          </p>
        </div>

        {saved && (
          <div className="alert-banner" style={{ background: 'var(--green-50)', color: 'var(--green-700)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, fontWeight: 600 }}>
            <ICheck size={18} /> Profil mis à jour avec succès
          </div>
        )}

        <form onSubmit={handleSave} style={{ marginTop: 32 }}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="input-label" style={{ fontWeight: 700, fontSize: 13 }}>Nom complet</label>
            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 16, color: 'var(--ink-400)', pointerEvents: 'none' }}><IUser size={18} /></div>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                readOnly={!isEditing}
                style={{ paddingLeft: 44, background: isEditing ? 'white' : 'var(--ink-50)', border: isEditing ? '1.5px solid var(--blue-300)' : '1px solid var(--ink-200)', color: 'var(--ink-900)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="input-label" style={{ fontWeight: 700, fontSize: 13 }}>Adresse Email</label>
            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 16, color: 'var(--ink-400)', pointerEvents: 'none' }}><IMail size={18} /></div>
              <input
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                readOnly={!isEditing}
                style={{ paddingLeft: 44, background: isEditing ? 'white' : 'var(--ink-50)', border: isEditing ? '1.5px solid var(--blue-300)' : '1px solid var(--ink-200)', color: 'var(--ink-900)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 32 }}>
            <label className="input-label" style={{ fontWeight: 700, fontSize: 13 }}>Plaque d'immatriculation</label>
            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 16, color: 'var(--ink-400)', pointerEvents: 'none' }}><ICar size={18} /></div>
              <input
                className="input"
                value={plate}
                onChange={e => setPlate(e.target.value)}
                readOnly={!isEditing}
                style={{ paddingLeft: 44, background: isEditing ? 'white' : 'var(--ink-50)', border: isEditing ? '1.5px solid var(--blue-300)' : '1px solid var(--ink-200)', color: 'var(--ink-900)', textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="row" style={{ gap: 12 }}>
            {isEditing ? (
              <>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Annuler</button>
                <button type="submit" className="btn btn-blue" style={{ flex: 2 }}>Enregistrer</button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setIsEditing(true)}>Modifier mes informations</button>
              </>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 20, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: 'var(--red-600)' }}>Zone dangereuse</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 20 }}>Vous pouvez vous déconnecter de votre session sur cet appareil.</p>
        <button className="btn" style={{ background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid var(--red-200)', width: '100%', fontWeight: 700 }} onClick={onLogout}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
