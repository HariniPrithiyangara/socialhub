import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { BsLightningChargeFill } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/* ── Form Field with Label and Icon Prefix ── */
const FormField = ({ label, icon: Icon, type, placeholder, value, onChange, error, name }) => {
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPass = type === 'password';

  return (
    <div style={{ marginBottom: 20, textAlign: 'left' }}>
      <label style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 600,
        color: '#475569',
        letterSpacing: '0.02em',
        marginBottom: 6,
        fontFamily: 'Inter, sans-serif'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: error ? '#ef4444' : (focused ? '#7c3aed' : '#94a3b8'),
          pointerEvents: 'none',
          zIndex: 1,
          transition: '0.2s'
        }} />
        <input
          name={name}
          type={isPass && !showPass ? 'password' : 'text'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: 46,
            background: '#f8fafc',
            border: `1px solid ${error ? '#ef4444' : (focused ? '#7c3aed' : '#cbd5e1')}`,
            borderRadius: 8,
            paddingLeft: 42,
            paddingRight: isPass ? 42 : 14,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#0f172a',
            outline: 'none',
            transition: '0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(124, 58, 237, 0.15)' : 'none'
          }}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 5, paddingLeft: 2 }}>{error}</div>}
    </div>
  );
};

const FEATURES = [
  'Post photos, updates & stories',
  'Like, comment & connect',
  'Discover trending topics',
  'End-to-end encrypted messages'
];

const AuthPage = () => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const set = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  const validate = () => {
    const e = {};
    if (tab === 'signup') {
      if (!form.username.trim()) e.username = 'Username is required';
      else if (form.username.length < 3) e.username = 'At least 3 characters';
      else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers & underscores only';
    }
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (tab === 'signup' && form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async e => {
    if (e) e.preventDefault();
    if (!validate()) return;
    if (tab === 'login') {
      const r = await login({ email: form.email, password: form.password });
      if (r.success) { toast.success('Welcome back! 👋'); navigate('/'); }
      else toast.error(r.message || 'Invalid credentials');
    } else {
      const r = await register({ username: form.username, email: form.email, password: form.password });
      if (r.success) { toast.success('Account created! 🎉'); navigate('/'); }
      else toast.error(r.message || 'Registration failed');
    }
  };

  const switchTab = t => { setTab(t); setErrors({}); setForm({ username: '', email: '', password: '', confirm: '' }); };

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* ═══ LEFT PANEL (Brand Side - 50%) ═══ */}
      <div className="auth-hero-left" style={{
        width: '50%',
        flex: '0 0 50%',
        background: 'linear-gradient(135deg, #7c3aed, #db2777)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 80px',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
        height: '100%'
      }}>
        {/* Brand Logo in Rounded Square */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 80 }}>
          <div style={{
            width: 40,
            height: 40,
            background: '#ffffff',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BsLightningChargeFill size={20} color="#7c3aed" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>SocialHub</span>
        </div>

        {/* Headline and Subtitle */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.03em',
          lineHeight: 1.25,
          marginBottom: 16,
          textAlign: 'left'
        }}>
          Your community,<br />all in one place.
        </h1>
        <p style={{
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: 1.5,
          marginBottom: 48,
          textAlign: 'left',
          maxWidth: 360
        }}>
          Share moments, connect with people, and discover what matters to you.
        </p>

        {/* Bullets with tiny white dots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          {FEATURES.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ffffff',
                flexShrink: 0
              }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 13.5, fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ RIGHT PANEL (Form Side - 50%) ═══ */}
      <div className="auth-right" style={{
        width: '50%',
        flex: '0 0 50%',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 60px',
        overflowY: 'auto',
        height: '100%',
        borderLeft: '1px solid #e2e8f0'
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Eyebrow and Heading */}
          <div style={{ textAlign: 'left', marginBottom: 28 }}>
            <span style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              color: '#7c3aed',
              letterSpacing: '0.06em',
              marginBottom: 4,
              textTransform: 'uppercase'
            }}>
              {tab === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
            </span>
            <h2 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              marginBottom: 6
            }}>
              {tab === 'login' ? 'Sign in to your account' : 'Create your free account'}
            </h2>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {tab === 'login' ? (
                <>Don't have one? <button onClick={() => switchTab('signup')} style={{ color: '#7c3aed', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>Create a free account</button></>
              ) : (
                <>Already have an account? <button onClick={() => switchTab('login')} style={{ color: '#7c3aed', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>Sign in</button></>
              )}
            </div>
          </div>

          {/* Segmented Tab Switcher */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 3,
            marginBottom: 24
          }}>
            {['login', 'signup'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 6,
                  border: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: '0.2s',
                  background: tab === t ? '#7c3aed' : 'transparent',
                  color: tab === t ? '#fff' : '#64748b'
                }}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} noValidate>
            {tab === 'signup' && (
              <FormField
                label="Username"
                icon={FiUser}
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={set('username')}
                error={errors.username}
                name="username"
              />
            )}
            <FormField
              label="Email address"
              icon={FiMail}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              name="email"
            />
            <FormField
              label="Password"
              icon={FiLock}
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              name="password"
            />
            {tab === 'signup' && (
              <FormField
                label="Confirm password"
                icon={FiLock}
                type="password"
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={set('confirm')}
                error={errors.confirm}
                name="confirm"
              />
            )}

            {/* Forgot password */}
            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -12 }}>
                <button type="button" style={{
                  fontSize: 12,
                  color: '#7c3aed',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  padding: 0
                }}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary CTA (Continue) */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 46,
                borderRadius: 8,
                border: 'none',
                background: loading ? '#c084fc' : '#7c3aed',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: '0.2s',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#6d28d9'; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#7c3aed'; }}
            >
              {loading ? 'Processing…' : 'Continue →'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @media(max-width:850px){
          .auth-hero-left{display:none!important}
          .auth-right{width:100%!important; flex:0 0 100%!important; border-left:none!important}
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
