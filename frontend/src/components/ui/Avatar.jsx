import { useState } from 'react';

const COLORS = [
  ['#7c3aed','#db2777'], ['#f72585','#b5179e'], ['#06d6a0','#118ab2'],
  ['#ffd166','#ef476f'], ['#48dbfb','#1dd1a1'], ['#ff6b6b','#feca57'],
  ['#8338ec','#3a86ff'], ['#4cc9f0','#4361ee'],
];

const getColors = (name = '') => {
  const lower = name.toLowerCase().trim();
  if (lower.startsWith('evaluator')) {
    return ['#ff7e5f', '#feb47b']; // Beautiful Orange/Peach gradient
  }
  if (lower.startsWith('user')) {
    return ['#7c3aed', '#db2777']; // Premium Purple/Pink gradient
  }
  // Fallback hash colors
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
};

const getInitials = (name = '') => {
  const lower = name.toLowerCase().trim();
  if (lower.startsWith('evaluator')) return 'EV';
  if (lower.startsWith('user')) return 'U';
  
  const clean = name.replace(/[^a-zA-Z\s_]/g, '').trim(); // Remove digits
  const p = clean.split(/[\s_]+/);
  if (p.length >= 2 && p[0] && p[1]) {
    return (p[0][0] + p[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '?';
};

const Avatar = ({ name = '', size = 44, src = '' }) => {
  const [err, setErr] = useState(false);
  const [c1, c2] = getColors(name);

  const style = {
    width: size, height: size, minWidth: size,
    fontSize: Math.floor(size * 0.36),
    background: `linear-gradient(135deg, ${c1}, ${c2})`,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, flexShrink: 0,
    userSelect: 'none', overflow: 'hidden',
  };

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        style={{ ...style, objectFit: 'cover' }}
        onError={() => setErr(true)}
      />
    );
  }

  return <div style={style} title={name}>{getInitials(name)}</div>;
};

export default Avatar;
