import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiBell, FiLogOut, FiUser, FiSettings, FiHome, FiChevronDown, FiCheck } from 'react-icons/fi';
import { BsGrid, BsPeopleFill, BsLightningChargeFill } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { authAPI } from '../../api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Search state
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setSearchText(searchParams.get('search') || '');
  }, [searchParams]);

  const loadNotifications = async () => {
    try {
      const { data } = await authAPI.getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      setSearchParams({ search: searchText.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleBellClick = async () => {
    setShowNotifications((show) => !show);
    if (!showNotifications && unreadCount > 0) {
      try {
        await authAPI.markNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark notifications read:', err);
      }
    }
  };

  return (
    <nav className="nav">
      {/* Brand */}
      <Link to="/" className="nav__brand">
        <div className="nav__logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          <BsLightningChargeFill size={20} color="#fff" />
        </div>
        <span className="nav__name" style={{ display: 'block', background: 'linear-gradient(135deg, #7c3aed, #db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SocialHub</span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="nav__search">
        <FiSearch className="nav__search-ico" size={16} />
        <input
          type="text"
          placeholder="Search SocialHub..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </form>


      {/* Right */}
      <div className="nav__right">
        {!isAuthenticated ? (
          <>
            <Link to="/auth" className="nav__login-btn">Log In</Link>
            <Link to="/auth" className="nav__signup-btn">Sign Up</Link>
          </>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <button className="nav__action-btn" title="Notifications" onClick={handleBellClick}>
                <FiBell size={20} />
                {unreadCount > 0 && <span className="nav__badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div
                  className="nav__drop-menu"
                  style={{ right: 0, left: 'auto', width: 280, maxHeight: 320, overflowY: 'auto' }}
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="nav__drop-head" style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Notifications</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                      No notifications yet 🔔
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className="nav__drop-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 14px',
                          borderBottom: '1px solid #f1f5f9',
                          background: n.read ? 'transparent' : 'rgba(124, 58, 237, 0.04)',
                          cursor: 'default',
                          textAlign: 'left',
                        }}
                      >
                        <Avatar name={n.senderName} size={28} src={n.sender?.avatar} />
                        <div style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.3 }}>
                          <strong style={{ color: '#0f172a' }}>@{n.senderName}</strong>{' '}
                          <span style={{ color: '#475569' }}>
                            {n.type === 'like' ? 'liked your post' : 'commented on your post'}
                          </span>
                          <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 2 }}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="nav__dropdown">
              <button className="nav__user-pill" onClick={() => setOpen(o => !o)}>
                <Avatar name={user?.username} size={32} />
                <span>{user?.username}</span>
                <FiChevronDown size={14} color="#65676b" />
              </button>

              {open && (
                <div className="nav__drop-menu" onMouseLeave={() => setOpen(false)}>
                  <div className="nav__drop-head">
                    <Avatar name={user?.username} size={40} />
                    <div className="info">
                      <div className="n">{user?.username}</div>
                      <div className="e">{user?.email}</div>
                    </div>
                  </div>
                  <button className="nav__drop-item">
                    <div className="ico"><FiUser size={18} /></div> Profile
                  </button>
                  <button className="nav__drop-item">
                    <div className="ico"><FiSettings size={18} /></div> Settings
                  </button>
                  <button className="nav__drop-item red" onClick={() => { logout(); navigate('/auth'); setOpen(false); }}>
                    <div className="ico">🚪</div> Log Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
