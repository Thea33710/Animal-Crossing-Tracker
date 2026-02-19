const MONTHS = [
  { value: '', label: 'Tous les mois' },
  { value: '1',  label: 'Janvier' }, { value: '2',  label: 'Février' },
  { value: '3',  label: 'Mars' },    { value: '4',  label: 'Avril' },
  { value: '5',  label: 'Mai' },     { value: '6',  label: 'Juin' },
  { value: '7',  label: 'Juillet' }, { value: '8',  label: 'Août' },
  { value: '9',  label: 'Septembre' },{ value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },{ value: '12', label: 'Décembre' },
]

export default function FilterBar({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div style={styles.bar}>
      {/* Search */}
      <input
        type="search"
        placeholder="🔍 Rechercher..."
        value={filters.search || ''}
        onChange={(e) => set('search', e.target.value)}
        style={{ ...styles.input, minWidth: 180 }}
      />

      {/* Category */}
      <select value={filters.category || ''} onChange={(e) => set('category', e.target.value)} style={styles.input}>
        <option value="">🐾 Toutes catégories</option>
        <option value="fish">🐟 Poissons</option>
        <option value="bug">🦋 Insectes</option>
        <option value="sea_creature">🦀 Créatures marines</option>
      </select>

      {/* Month */}
      <select value={filters.month || ''} onChange={(e) => set('month', e.target.value)} style={styles.input}>
        {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>

      {/* Collected */}
      <select value={filters.collected || ''} onChange={(e) => set('collected', e.target.value)} style={styles.input}>
        <option value="">Tous</option>
        <option value="false">❌ Non collecté</option>
        <option value="true">✓ Collecté</option>
      </select>

      {/* Reset */}
      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => onChange({ search: '', category: '', month: '', collected: '' })}
          className="btn btn-outline"
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}

const styles = {
  bar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    alignItems: 'center',
    background: '#fff',
    borderRadius: 16,
    padding: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    marginBottom: '1.25rem',
  },
  input: {
    flex: '1 1 160px',
    padding: '0.5rem 0.75rem',
    borderRadius: 50,
    border: '2px solid #EEEEEE',
    fontSize: '0.9rem',
    minWidth: 0,
  },
}
