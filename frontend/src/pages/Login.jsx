import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { hasIsland } = await login(email, password)
      navigate(hasIsland ? '/dashboard' : '/setup-island')
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.icon}>🌿</div>
          <h1 style={styles.title}>Connexion</h1>
          <p style={styles.subtitle}>Bon retour sur votre île !</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to="/signup" style={{ fontWeight: 700, color: '#3A7D44' }}>S'inscrire</Link>
        </p>
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
    background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 420,
  },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  icon: { fontSize: '3rem', marginBottom: '0.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#3A7D44', marginBottom: '0.25rem' },
  subtitle: { color: '#757575', fontSize: '0.95rem' },
  errorBanner: {
    background: '#FFEBEE',
    color: '#c62828',
    borderRadius: 10,
    padding: '0.65rem 1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  footer: { textAlign: 'center', marginTop: '1.25rem', color: '#757575', fontSize: '0.9rem' },
}
