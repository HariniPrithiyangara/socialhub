import { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { postAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CommentSection = ({ postId, initial = [], onAdded }) => {
  const { user, isAuthenticated } = useAuth();
  const [list, setList] = useState(initial);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try { const { data } = await postAPI.getComments(postId); setList(data.comments || []); }
      catch { /* keep initial */ }
      finally { setLoading(false); }
    };
    load();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [postId]);

  const submit = async () => {
    if (!isAuthenticated) return toast.error('Login to comment');
    if (!text.trim()) return;
    const tmp = {
      _id: `tmp-${Date.now()}`, username: user.username, avatar: user.avatar,
      text: text.trim(), createdAt: new Date().toISOString(),
    };
    setList(p => [tmp, ...p]);
    setText('');
    setBusy(true);
    try {
      const { data } = await postAPI.addComment(postId, tmp.text);
      setList(p => p.map(c => c._id === tmp._id ? data.comment : c));
      onAdded?.();
    } catch {
      setList(p => p.filter(c => c._id !== tmp._id));
      setText(tmp.text);
      toast.error('Could not post comment');
    } finally { setBusy(false); }
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } };

  return (
    <div className="comments">
      <div className="comments__list">
        {loading && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>
            <span className="spinner dark" style={{ width: 18, height: 18 }} />
          </div>
        )}
        {!loading && list.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '16px 0' }}>
            No comments yet. Be first! 💬
          </div>
        )}
        {!loading && list.map(c => (
          <div key={c._id} className="comment">
            <Avatar name={c.username} size={34} src={c.avatar} />
            <div className="comment__bubble">
              <div className="comment__name">@{c.username}</div>
              <div className="comment__text">{c.text}</div>
              <div className="comment__time">{timeAgo(c.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="comments__input-row">
        {user && <Avatar name={user.username} size={32} />}
        <input
          ref={inputRef} type="text" className="comments__input"
          placeholder={isAuthenticated ? 'Add a comment… (Enter to send)' : 'Login to comment'}
          value={text} onChange={e => setText(e.target.value)} onKeyDown={onKey}
          disabled={!isAuthenticated || busy} maxLength={500}
        />
        <button className="comments__send" onClick={submit}
          disabled={!text.trim() || busy || !isAuthenticated}>
          {busy ? <span className="spinner" style={{ width: 15, height: 15 }} /> : <FiSend size={14} />}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
