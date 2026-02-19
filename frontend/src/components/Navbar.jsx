import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, island, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          🌿 <span style={styles.logoText}>AC Tracker</span>
        </Link>

        {/* Nav links */}
        {user && (
          <div style={styles.links}>
            <NavLink to="/dashboard" style={({ isActive }) => ({
              ...styles.link, ...(isActive ? styles.linkActive : {})
            })}>
              🏠 Accueil
            </NavLink>
            <NavLink to="/creopedia" style={({ isActive }) => ({
              ...styles.link, ...(isActive ? styles.linkActive : {})
            })}>
              🦋 Bébétopédie
            </NavLink>
          </div>
        )}

        {/* Right side */}
        <div style={styles.right}>
          {user ? (
            <>
              {island && (
                <span style={styles.islandBadge}>
                  🏝️ {island.name}
                </span>
              )}
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>Connexion</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Inscription</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#fff',
    borderBottom: '3px solid #6BAE3C',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 1.5rem',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    textDecoration: 'none',
    fontSize: '1.25rem',
  },
  logoText: {
    fontWeight: 800,
    color: '#3A7D44',
    fontSize: '1.15rem',
  },
  links: {
    display: 'flex',
    gap: '0.5rem',
    flex: 1,
  },
  link: {
    padding: '0.4rem 0.9rem',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#424242',
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  linkActive: {
    background: '#E8F5E9',
    color: '#3A7D44',
  },
  right: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  islandBadge: {
    background: '#E8F5E9',
    color: '#3A7D44',
    borderRadius: 50,
    padding: '0.3rem 0.8rem',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
}
