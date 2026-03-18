import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CartIcon from './CartIcon';
import WishlistIcon from './WishlistIcon';
import SearchSuggestions from './SearchSuggestions';
import './Header.css';

function Header({ onLoginClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut: authSignOut } = useAuth();
  const searchInputRef = React.useRef(null);

  const handleLogout = async () => {
    try {
      await authSignOut();
      setDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
      setMenuOpen(false);
    }
  };

  const handleSuggestionSelect = () => {
    setSearchOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {menuOpen && <div className="header-backdrop" onClick={() => setMenuOpen(false)}></div>}
      {dropdownOpen && <div className="header-backdrop" onClick={() => setDropdownOpen(false)}></div>}
      {searchOpen && <div className="header-backdrop" onClick={() => setSearchOpen(false)}></div>}
      
      <header className="header-fixed">
        <div className="header-container">
          <div className="header-content">
            {/* Mobile Menu Button */}
            <button
              className={`header-hamburger${menuOpen ? ' active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Logo */}
            <div className="header-logo-wrapper">
              <Link to="/" className="header-logo" onClick={() => setMenuOpen(false)}>
                VERA
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="header-nav">
              <Link 
                to="/" 
                className={`header-nav-link${isActive('/') ? ' active' : ''}`}
              >
                New Arrivals
              </Link>
              <Link 
                to="/shop" 
                className={`header-nav-link${isActive('/shop') ? ' active' : ''}`}
              >
                Collections
              </Link>
              <Link 
                to="/about" 
                className={`header-nav-link${isActive('/about') ? ' active' : ''}`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`header-nav-link${isActive('/contact') ? ' active' : ''}`}
              >
                Contact
              </Link>
            </nav>

            {/* Icons */}
            <div className="header-icons">
              {/* Search */}
              <div className="header-search-wrapper">
                <button
                  className="header-icon-btn"
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Search"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
                
                {searchOpen && (
                  <form className="header-search-form" onSubmit={handleSearchSubmit}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="header-search-input"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="header-search-submit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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

              {/* Wishlist */}
              <WishlistIcon />

              {/* Cart */}
              <CartIcon />

              {/* User Account */}
              {user ? (
                <div className="header-user-menu">
                  <button 
                    className="header-user-btn" 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="User menu"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="header-user-avatar" />
                    ) : (
                      <div className="header-user-avatar-placeholder">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  
                  {dropdownOpen && (
                    <div className="header-dropdown">
                      <div className="header-dropdown-header">
                        <p className="header-dropdown-email">{user.email}</p>
                      </div>
                      <div className="header-dropdown-divider"></div>
                      <Link 
                        to="/wishlist" 
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Wishlist
                      </Link>
                      <Link 
                        to="/cart" 
                        className="header-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Shopping Cart
                      </Link>
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          className="header-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="header-dropdown-divider"></div>
                      <button 
                        className="header-dropdown-item header-dropdown-logout"
                        onClick={handleLogout}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="header-icon-btn"
                  onClick={onLoginClick}
                  aria-label="Sign in"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav className={`header-mobile-menu${menuOpen ? ' active' : ''}`}>
          <Link to="/" className="header-mobile-link" onClick={() => setMenuOpen(false)}>
            New Arrivals
          </Link>
          <Link to="/shop" className="header-mobile-link" onClick={() => setMenuOpen(false)}>
            Collections
          </Link>
          <Link to="/about" className="header-mobile-link" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="header-mobile-link" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <Link to="/wishlist" className="header-mobile-link" onClick={() => setMenuOpen(false)}>
            Wishlist
          </Link>
          {isAdmin && (
            <Link to="/admin" className="header-mobile-link" onClick={() => setMenuOpen(false)}>
              Admin Panel
            </Link>
          )}
          {!user && (
            <button className="header-mobile-link" onClick={() => { setMenuOpen(false); onLoginClick(); }}>
              Sign In
            </button>
          )}
        </nav>
      </header>
    </>
  );
}

export default Header;
