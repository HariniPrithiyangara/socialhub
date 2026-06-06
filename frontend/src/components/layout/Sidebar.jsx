import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const LINKS = [
  { icon: FiHome, label: 'Social Feed', href: '/', on: true },
];

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="guest-side">
        <div className="guest-card">
          <p>Sign up to connect with friends, share posts, and see what your community is up to.</p>
          <div className="guest-card__btns">
            <Link to="/auth" className="btn-primary">Create New Account</Link>
            <Link to="/auth" className="btn-outline">Log In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      {/* Current user */}
      <Link to="/" className="side-user">
        <Avatar name={user.username} size={36} src={user.avatar} />
        <span className="side-user__name">{user.username}</span>
      </Link>

      {/* Nav links */}
      {LINKS.map(({ icon: Icon, label, href, on }) => (
        <Link key={label} to={href} className={`side-link ${on ? 'on' : ''}`}>
          <div className="side-link__ico"><Icon size={20} /></div>
          {label}
        </Link>
      ))}

      <div className="side-divider" />

      <div className="side-section-title">Community Guidelines</div>
      <div style={{ padding: '4px 10px', fontSize: 13, color: '#65676b', lineHeight: 1.5 }}>
        • Share interesting moments.<br />
        • Post photos & updates.<br />
        • Be polite and helpful.<br />
        • Avoid spamming or fake links.
      </div>

      <div className="sidebar__footer">
        Privacy · Terms · Cookies ·<br />
        SocialHub © 2026
      </div>
    </div>
  );
};

export default Sidebar;
