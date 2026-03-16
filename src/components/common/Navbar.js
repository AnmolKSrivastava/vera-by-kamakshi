import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CartIcon from './CartIcon';
import WishlistIcon from './WishlistIcon';
import SearchSuggestions from './SearchSuggestions';

function Navbar({ onLoginClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut: authSignOut } = useAuth();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHamburgerClick = () => {
    setMenuOpen((open) => !open);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      setDropdownOpen(false);
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = React.useRef(null);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setMenuOpen(false);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const handleSuggestionSelect = () => {
    setSearchOpen(false);
    setSearchTerm('');
  };
  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <>
      {menuOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}
      {dropdownOpen && <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)}></div>}
      {searchOpen && <div className="dropdown-backdrop" onClick={() => setSearchOpen(false)}></div>}
      <nav className={`navbar navbar-vertical${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-row">
          <div className="navbar-col navbar-col-left">
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              aria-label="Toggle navigation menu"
              onClick={handleHamburgerClick}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
          <div className="navbar-col navbar-col-center">
            <Link to="/" className="navbar-logo" onClick={closeMenu}>VERA</Link>
          </div>
          <div className="navbar-col navbar-col-right">
            {/* Search Icon and Input */}
            <div className="navbar-search-container">
              <button
                className="navbar-search-icon"
                aria-label="Open search"
                onClick={() => setSearchOpen(open => !open)}
              >
                {/* Feather search icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C48E82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              {searchOpen && (
                <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    className="navbar-search-input"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    aria-label="Search products"
                    ref={searchInputRef}
                  />
                  <button type="submit" className="navbar-search-btn" aria-label="Search">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#C48E82" strokeWidth="2"/>
                      <line x1="13" y1="13" x2="17" y2="17" stroke="#C48E82" strokeWidth="2"/>
                    </svg>
                  </button>
                </form>
              )}
              {searchOpen && searchTerm && (
                <SearchSuggestions 
                  searchTerm={searchTerm} 
                  onSelect={handleSuggestionSelect}
                />
              )}
            </div>
            <WishlistIcon />
            <CartIcon />
            {user ? (
              <div className="user-profile-container">
                <button 
                  className="user-profile-btn" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User menu"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{user.displayName || user.email}</span>
                  <svg className="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="dropdown-user-name">{user.displayName || 'User'}</div>
                        <div className="dropdown-user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    {isAdmin ? (
                      // Admin menu items
                      <>
                        <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M0 0h6v6H0V0zm0 10h6v6H0v-6zM10 0h6v6h-6V0zm0 10h6v6h-6v-6z" fill="currentColor"/>
                          </svg>
                          Dashboard
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item logout" onClick={handleLogout}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 14H2V2H6V0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H6V14ZM12.09 11.59L10.67 10.17L12.84 8H5V6H12.84L10.66 3.83L12.08 2.41L16.67 7L12.09 11.59Z" fill="currentColor"/>
                          </svg>
                          Logout
                        </button>
                      </>
                    ) : (
                      // Regular user menu items
                      <>
                        <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="currentColor"/>
                          </svg>
                          My Profile
                        </button>
                        <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M14 2H11.82C11.4 0.84 10.3 0 9 0H7C5.7 0 4.6 0.84 4.18 2H2C0.9 2 0 2.9 0 4V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V4C16 2.9 15.1 2 14 2ZM7 2H9C9.55 2 10 2.45 10 3C10 3.55 9.55 4 9 4H7C6.45 4 6 3.55 6 3C6 2.45 6.45 2 7 2ZM14 14H2V4H4V5C4 5.55 4.45 6 5 6H11C11.55 6 12 5.55 12 5V4H14V14Z" fill="currentColor"/>
                          </svg>
                          My Orders
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item logout" onClick={handleLogout}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 14H2V2H6V0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H6V14ZM12.09 11.59L10.67 10.17L12.84 8H5V6H12.84L10.66 3.83L12.08 2.41L16.67 7L12.09 11.59Z" fill="currentColor"/>
                          </svg>
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn" onClick={onLoginClick}>Sign In</button>
            )}
          </div>
        </div>
        <ul className={`navbar-links navbar-links-center${menuOpen ? ' show' : ''}`}>
          <li><Link to="/" onClick={closeMenu} className={isActive('/') ? 'active' : ''}>Home</Link></li>
          <li><Link to="/shop" onClick={closeMenu} className={isActive('/shop') ? 'active' : ''}>Shop</Link></li>
          <li><Link to="/about" onClick={closeMenu} className={isActive('/about') ? 'active' : ''}>About</Link></li>
          <li><Link to="/contact" onClick={closeMenu} className={isActive('/contact') ? 'active' : ''}>Contact</Link></li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
