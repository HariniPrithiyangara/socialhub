import { useState, useRef } from 'react';
import { FiImage, FiX, FiSend } from 'react-icons/fi';
import { BsEmojiSmile, BsCameraVideo } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { postAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const CreatePostBox = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef(null);
  const taRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast.error('Images only!');
    if (f.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    setFile(f); setExpanded(true);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const removeFile = () => { setFile(null); setPreview(''); if (fileRef.current) fileRef.current.value = ''; };

  const submit = async () => {
    if (!text.trim() && !file) return toast.error('Write something or add an image!');
    setLoading(true);
    try {
      const fd = new FormData();
      if (text.trim()) fd.append('text', text.trim());
      if (file) fd.append('image', file);
      const { data } = await postAPI.create(fd);
      toast.success('Posted!');
      setText(''); removeFile(); setExpanded(false);
      onPostCreated?.(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally { setLoading(false); }
  };

  return (
    <div className="create-post">
      <div className="create-post__top">
        <Avatar name={user?.username} size={40} src={user?.avatar} />
        <textarea
          ref={taRef}
          className="create-post__input"
          placeholder={`What's on your mind, ${user?.username}?`}
          value={text}
          onChange={e => { setText(e.target.value); setExpanded(true); }}
          onFocus={() => setExpanded(true)}
          rows={expanded ? 3 : 1}
          maxLength={2000}
          style={{ resize: 'none', lineHeight: 1.5 }}
        />
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="create-post__preview">
          <img src={preview} alt="preview" />
          <button className="create-post__rm" onClick={removeFile}><FiX size={16} /></button>
        </div>
      )}

      {expanded && (
        <>
          <div className="create-post__divider" />
          <div className="create-post__bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
            <button className="create-post__tool" onClick={() => fileRef.current?.click()} style={{ flex: 'none', width: 'auto', padding: '8px 16px' }}>
              <span style={{ fontSize: 18, marginRight: 8 }}>🖼️</span> Add Photo
            </button>
            <button className="create-post__post" onClick={submit} disabled={(!text.trim() && !file) || loading}>
              {loading ? <span className="spinner" /> : 'Post'}
            </button>
          </div>
        </>
      )}

      {!expanded && (
        <>
          <div className="create-post__divider" />
          <div className="create-post__bar">
            <button className="create-post__tool" onClick={() => { setExpanded(true); fileRef.current?.click(); }}>
              <span style={{ fontSize: 18, marginRight: 8 }}>🖼️</span> Share an image
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreatePostBox;
