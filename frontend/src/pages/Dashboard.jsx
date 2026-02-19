import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { creaturesApi } from '../api/client'
import ProgressStats from '../components/ProgressStats'

export default function Dashboard() {
  const { user, island } = useAuth()
  const navigate         = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!island) { navigate('/setup-island'); return }

    creaturesApi.stats(island.id)
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [island])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 6)  return 'Bonne nuit'
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  // Current month for availability hint
  const currentMonth = new Date().getMonth() + 1
  const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  return (
    <div className="page-container">
      {/* Welcome banner */}
      <div style={styles.banner}>
        <div>
          <h1 style={styles.welcomeTitle}>
            {greeting()}, <span style={{ color: '#3A7D44' }}>{user?.email?.split('@')[0]}</span> !
          </h1>
          {island && (
            <p style={styles.islandLine}>
              🏝️ Île <strong>{island.name}</strong> · Hémisphère {island.hemisphere === 'north' ? 'Nord 🌏' : 'Sud 🌍'}
              · {monthNames[currentMonth - 1]}
            </p>
          )}
        </div>
        <div style={styles.bannerEmoji}>🐾</div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="spinner" />
      ) : stats ? (
        <ProgressStats stats={stats} />
      ) : null}

      {/* Module cards */}
      <h2 style={styles.sectionTitle}>Modules</h2>
      <div style={styles.moduleGrid}>

        {/* Bébétopédie */}
        <div style={styles.moduleCard}>
          <div style={styles.moduleIcon}>🦋</div>
          <div style={styles.moduleContent}>
            <h3 style={styles.moduleTitle}>Bébétopédie</h3>
            <p style={styles.moduleDesc}>
              Suivez votre progression : poissons, insectes et créatures marines.
              Filtrez par mois, heure ou lieu.
            </p>
            {stats && (
              <div style={styles.moduleStats}>
                <span style={styles.statPill}>{stats.collected} / {stats.total} collectés</span>
                <span style={styles.statPill}>{stats.percentage}% complété</span>
              </div>
            )}
          </div>
          <Link to="/creopedia" className="btn btn-primary" style={styles.moduleBtn}>
            Ouvrir →
          </Link>
        </div>

        {/* Navets — coming soon */}
        <div style={{ ...styles.moduleCard, opacity: 0.65 }}>
          <div style={styles.moduleIcon}>🥔</div>
          <div style={styles.moduleContent}>
            <h3 style={styles.moduleTitle}>Marché aux navets</h3>
            <p style={styles.moduleDesc}>
              Saisissez vos prix hebdomadaires et laissez l'IA prédire le meilleur moment pour vendre.
            </p>
          </div>
          <span style={{ ...styles.moduleBtn, background: '#EEE', color: '#999', pointerEvents: 'none', display: 'inline-block', padding: '0.6rem 1.4rem', borderRadius: 50 }}>
            Bientôt
          </span>
        </div>
      </div>

      {/* Tips */}
      <div style={styles.tipBox}>
        <strong>💡 Astuce du jour :</strong> En <em>{monthNames[currentMonth - 1]}</em>,
        certaines créatures saisonnières sont disponibles. Pensez à vérifier la Bébétopédie
        pour ne rien manquer !
      </div>
    </div>
  )
}

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #3A7D44, #6BAE3C)',
    borderRadius: 20,
    padding: '2rem',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.75rem',
    boxShadow: '0 4px 20px rgba(58,125,68,0.3)',
  },
  welcomeTitle: { fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' },
  islandLine: { fontSize: '0.95rem', opacity: 0.9 },
  bannerEmoji: { fontSize: '4rem', opacity: 0.7 },
  sectionTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#3A7D44', margin: '1.5rem 0 0.75rem' },
  moduleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' },
  moduleCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  moduleIcon: { fontSize: '2.5rem' },
  moduleContent: { flex: 1 },
  moduleTitle: { fontSize: '1.1rem', fontWeight: 800, color: '#2D2D2D', marginBottom: '0.3rem' },
  moduleDesc: { fontSize: '0.88rem', color: '#757575', lineHeight: 1.5 },
  moduleStats: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' },
  statPill: { background: '#E8F5E9', color: '#3A7D44', borderRadius: 50, padding: '0.25rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 },
  moduleBtn: { alignSelf: 'flex-start', textDecoration: 'none' },
  tipBox: {
    background: '#FFF9C4',
    border: '2px solid #F9A825',
    borderRadius: 14,
    padding: '1rem 1.25rem',
    fontSize: '0.88rem',
    color: '#5D4037',
  },
}
