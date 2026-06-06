import { useState, useEffect } from 'react';
import { authAPI } from '../../api';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

const TRENDING = [
  { tag: '#Creativity', posts: 342, signal: 'hot' },
  { tag: '#Technology', posts: 298, signal: 'hot' },
  { tag: '#Lifestyle', posts: 247, signal: 'new' },
  { tag: '#Design', posts: 184, signal: 'hot' },
  { tag: '#TrendingNow', posts: 156, signal: 'new' },
];

const FALLBACK_CONTACTS = [
  { username: 'socialhub_updates', isOfficial: true },
  { username: 'community_pulse', isOfficial: true },
];

const RightSidebar = () => {
  const { isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) {
        setContacts(FALLBACK_CONTACTS);
        return;
      }
      try {
        const res = await authAPI.getUsers();
        if (res.data?.success && res.data.users?.length > 0) {
          setContacts(res.data.users);
        } else {
          setContacts(FALLBACK_CONTACTS);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setContacts(FALLBACK_CONTACTS);
      }
    };
    fetchUsers();
  }, [isAuthenticated]);

  return (
    <div className="right-bar">
      {/* Contacts */}
      <div>
        <div className="right-section__title">Contacts</div>
        {contacts.map(c => {
          const name = c.username;
          return (
            <div key={c._id || name} className="contact-item">
              <Avatar name={name} size={36} src={c.avatar} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, marginLeft: 10 }}>
                <span className="contact-item__name" style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                  {name}
                </span>
                {c.isOfficial && (
                  <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 500 }}>Official Bot</span>
                )}
              </div>
              <div className="contact-item__dot" style={{ background: '#10b981', width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Trending */}
      <div>
        <div className="right-section__title">Trending</div>
        {TRENDING.map(t => (
          <div key={t.tag} className="trend-item">
            <div className="trend-item__tag">{t.tag}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div className="trend-item__count">{t.posts} posts</div>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                padding: '2px 6px', borderRadius: 4,
                background: t.signal === 'hot' ? '#fee2e2' : '#ecfdf5',
                color: t.signal === 'hot' ? '#ef4444' : '#10b981',
                display: 'inline-flex', alignItems: 'center', gap: 2
              }}>
                {t.signal === 'hot' ? '↑ hot' : '↑ new'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: '#65676b', lineHeight: 1.8, padding: '0 8px' }}>
        Privacy · Terms · Advertising · Cookies ·<br />
        SocialHub © 2026
      </div>
    </div>
  );
};

export default RightSidebar;
