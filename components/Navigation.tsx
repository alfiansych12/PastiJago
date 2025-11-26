// components/Navigation.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './Navigation.css';

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className={`navbar navbar-expand-lg fixed-top transition-all ${scrolled ? 'glass-effect navbar-scrolled' : 'bg-transparent'}`}>
      <div className="container">
        <Link className="navbar-brand fw-bold" href="/">
          <span className="gradient-text fs-3">🚀 PastiJago</span>
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon">
            <i className="fas fa-bars text-light"></i>
          </span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated ? (
            // Navigation for authenticated users
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item mx-2">
                <Link 
                  className={`nav-link position-relative px-3 py-2 rounded-pill ${
                    pathname === '/' ? 'active-nav' : 'text-light'
                  }`} 
                  href="/"
                >
                  <i className="fas fa-home me-2"></i>
                  Dashboard
                </Link>
              </li>
              
<li className="nav-item mx-2">
  <Link 
    className={`nav-link position-relative px-3 py-2 rounded-pill ${
      pathname === '/projects' ? 'active-nav' : 'text-light'
    }`} 
    href="/projects"
  >
    <i className="fas fa-project-diagram me-2"></i>
    Projects
  </Link>
</li>
<li className="nav-item mx-2">
  <Link 
    className={`nav-link position-relative px-3 py-2 rounded-pill ${
      pathname === '/groups' ? 'active-nav' : 'text-light'
    }`} 
    href="/groups"
  >
    <i className="fas fa-users me-2"></i>
    Groups
  </Link>
</li>
              <li className="nav-item mx-2">
  <Link 
    className={`nav-link position-relative px-3 py-2 rounded-pill ${
      pathname === '/belajar' ? 'active-nav' : 'text-light'
    }`} 
    href="/belajar"
  >
    <i className="fas fa-graduation-cap me-2"></i>
    Belajar
  </Link>
</li>
              <li className="nav-item mx-2">
                <Link 
                  className={`nav-link position-relative px-3 py-2 rounded-pill ${
                    pathname === '/leaderboard' ? 'active-nav' : 'text-light'
                  }`} 
                  href="/leaderboard"
                >
                  <i className="fas fa-trophy me-2"></i>
                  Leaderboard
                </Link>
              </li>
              
              {/* User Dropdown */}
              <li className="nav-item mx-2 dropdown">
                <button 
                  className="nav-link dropdown-toggle text-light d-flex align-items-center border-0 bg-transparent"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar bg-warning rounded-circle d-flex align-items-center justify-content-center me-2" 
                       style={{width: '32px', height: '32px'}}>
                    <i className="fas fa-user text-dark"></i>
                  </div>
                  <span className="d-none d-md-inline">{user?.username}</span>
                </button>
                
                {showDropdown && (
                  <div className="dropdown-menu show glass-effect border-0 mt-2">
                    <div className="dropdown-header text-warning">
                      <strong>{user?.username}</strong>
                      <div className="small text-muted">{user?.email}</div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link className="dropdown-item text-light" href="/profile">
                      <i className="fas fa-user me-2"></i>
                      Profile
                    </Link>
                    <Link className="dropdown-item text-light" href="/settings">
                      <i className="fas fa-cog me-2"></i>
                      Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item text-light" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </ul>
          ) : (
            // Navigation for unauthenticated users (Login/Register only)
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item mx-2">
                <Link 
                  className="nav-link position-relative px-4 py-2 rounded-pill text-light"
                  href="/login"
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login
                </Link>
              </li>
              <li className="nav-item mx-2">
                <Link 
                  className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill"
                  href="/register"
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Daftar
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}