import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { creaturesApi } from '../api/client'
import CreatureCard from '../components/CreatureCard'
import FilterBar from '../components/FilterBar'
import ProgressStats from '../components/ProgressStats'

export default function Creopedia() {
  const { island }              = useAuth()
  const navigate                = useNavigate()

  const [creatures, setCreatures] = useState([])
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [toastMsg, setToastMsg]   = useState('')
  const [filters, setFilters]     = useState({
    search: '', category: '', month: '', collected: ''
  })

  const loadCreatures = useCallback(async (f = filters) => {
    if (!island) return
    setLoading(true)
    try {
      const params = { island_id: island.id }
      if (f.category)  params.category  = f.category
      if (f.month)     params.month     = f.month
      if (f.collected) params.collected = f.collected
      if (f.search)    params.search    = f.search

      const res = await creaturesApi.list(params)
      setCreatures(res.data.creatures)
      setStats(res.data.stats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [island, filters])

  useEffect(() => {
    if (!island) { navigate('/setup-island'); return }
    loadCreatures(filters)
  }, [island, filters])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const handleToggle = async (creatureId, collected) => {
    // Optimistic update
    setCreatures((prev) =>
      prev.map((c) => c.id === creatureId ? { ...c, collected } : c)
    )

    try {
      await creaturesApi.toggle(creatureId, collected, island.id)
      showToast(collected ? '✓ Créature collectée !' : 'Marqué non collecté')
      // Refresh stats
      const statsRes = await creaturesApi.stats(island.id)
      setStats(statsRes.data)
    } catch {
      // Revert on error
      setCreatures((prev) =>
        prev.map((c) => c.id === creatureId ? { ...c, collected: !collected } : c)
      )
      showToast('❌ Erreur, réessayez')
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>🦋 Bébétopédie</h1>
          <p style={styles.subtitle}>Suivez votre progression de collecte</p>
        </div>
        {island && (
          <span style={styles.islandBadge}>
            🏝️ {island.name} · {island.hemisphere === 'north' ? 'Nord' : 'Sud'}
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && <ProgressStats stats={stats} />}

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Count */}
      {!loading && (
        <p style={styles.count}>
          {creatures.length} créature{creatures.length !== 1 ? 's' : ''} affichée{creatures.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="spinner" />
      ) : creatures.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</div>
          <p style={{ color: '#757575' }}>Aucune créature trouvée avec ces filtres.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {creatures.map((creature) => (
            <CreatureCard
              key={creature.id}
              creature={creature}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Toast notification */}
      {toastMsg && (
        <div style={styles.toast}>{toastMsg}</div>
      )}
    </div>
  )
}

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#3A7D44' },
  subtitle: { color: '#757575', fontSize: '0.9rem', marginTop: '0.2rem' },
  islandBadge: {
    background: '#E8F5E9',
    color: '#3A7D44',
    borderRadius: 50,
    padding: '0.4rem 1rem',
    fontWeight: 700,
    fontSize: '0.88rem',
  },
  count: { fontSize: '0.85rem', color: '#757575', marginBottom: '0.75rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  toast: {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#3A7D44',
    color: '#fff',
    borderRadius: 50,
    padding: '0.65rem 1.5rem',
    fontWeight: 700,
    fontSize: '0.9rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    zIndex: 200,
    animation: 'fadeIn 0.2s ease',
  },
}
