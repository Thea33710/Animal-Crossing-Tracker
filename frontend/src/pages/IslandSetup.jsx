import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function IslandSetup() {
  const [name, setName]           = useState('')
  const [hemisphere, setHemisphere] = useState('north')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const { createIsland }          = useAuth()
  const navigate                  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError("Le nom de l'île est requis"); return }
    setLoading(true)
    try {
      await createIsland(name.trim(), hemisphere)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🏝️</div>
          <h1 style={styles.title}>Configurez votre île</h1>
          <p style={styles.subtitle}>Ces informations permettent d'adapter les disponibilités saisonnières</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div className="form-group">
            <label>Nom de l'île</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Paradise, Kokiri..."
              maxLength={50}
              required
              autoFocus
            />
            <small style={{ color: '#999', fontSize: '0.78rem' }}>{name.length}/50 caractères</small>
          </div>

          <div className="form-group">
            <label>Hémisphère</label>
            <div style={styles.hemisphereRow}>
              {['north', 'south'].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHemisphere(h)}
                  style={{
                    ...styles.hemisphereBtn,
                    ...(hemisphere === h ? styles.hemisphereActive : {})
                  }}
                >
                  {h === 'north' ? '🌏 Hémisphère Nord' : '🌍 Hémisphère Sud'}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#757575', marginTop: '0.4rem' }}>
              {hemisphere === 'north'
                ? 'Saisons : Printemps en mars, été en juin, automne en septembre...'
                : 'Saisons : Printemps en septembre, été en décembre, automne en mars...'}
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer mon île 🌿'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'linear-gradient(135deg, #E8F5E9 0%, #FFF9C4 100%)',
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 460,
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  icon: { fontSize: '3.5rem', marginBottom: '0.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#3A7D44', marginBottom: '0.25rem' },
  subtitle: { color: '#757575', fontSize: '0.9rem' },
  errorBanner: {
    background: '#FFEBEE', color: '#c62828', borderRadius: 10,
    padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600,
  },
  hemisphereRow: { display: 'flex', gap: '0.75rem', marginTop: '0.3rem' },
  hemisphereBtn: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: 12,
    border: '2px solid #EEEEEE',
    background: '#F5F5F5',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  hemisphereActive: {
    border: '2px solid #6BAE3C',
    background: '#E8F5E9',
    color: '#3A7D44',
  },
}
