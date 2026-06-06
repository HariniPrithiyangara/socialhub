import { useState } from 'react';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiX, FiThumbsUp } from 'react-icons/fi';
import { AiFillHeart, AiFillLike } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { postAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import CommentSection from './CommentSection';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  if (s < 604800) return `${Math.floor(s/86400)}d`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Lightbox = ({ src, onClose }) => (
  <div className="lightbox" onClick={onClose}>
    <button className="lightbox__close" onClick={onClose}><FiX size={20} /></button>
    <img src={src} alt="post" onClick={e => e.stopPropagation()} />
  </div>
);

const PostMenu = ({ postId, authorId, onDeleted }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState(false);
  if (!user || user._id !== authorId) return null;

  const doDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDel(true);
    try { await postAPI.deletePost(postId); toast.success('Deleted'); onDeleted?.(postId); }
    catch { toast.error('Could not delete'); setDel(false); }
  };

  return (
    <div className="post__menu">
      <button className="post__menu-btn" onClick={() => setOpen(o => !o)}><FiMoreHorizontal size={20} /></button>
      {open && (
        <div className="post-drop" onMouseLeave={() => setOpen(false)}>
          <button className="post-drop__item red" onClick={doDelete} disabled={del}>
            <FiTrash2 size={15} /> {del ? 'Deleting…' : 'Delete post'}
          </button>
        </div>
      )}
    </div>
  );
};

const PostCard = ({ post, onDeleted }) => {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [comments, setComments] = useState(post.commentsCount ?? post.comments?.length ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [lightbox, setLightbox] = useState('');
  const [busy, setBusy] = useState(false);

  const imgSrc = post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : `${API}${post.imageUrl}`) : '';
  const author = post.author?.username || 'Unknown';

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error('Log in to like posts');
    if (busy) return;
    const wasLiked = liked;
    setLiked(!wasLiked); setLikes(n => wasLiked ? n - 1 : n + 1);
    setBusy(true);
    try {
      const { data } = await postAPI.toggleLike(post._id);
      setLiked(data.liked); setLikes(data.likesCount);
    } catch {
      setLiked(wasLiked); setLikes(n => wasLiked ? n + 1 : n - 1);
      toast.error('Could not update like');
    } finally { setBusy(false); }
  };

  return (
    <>
      <div className="post">
        {/* Header */}
        <div className="post__head">
          <div className="post__user">
            <Avatar name={author} size={40} src={post.author?.avatar} />
            <div>
              <div className="post__name">@{author}</div>
              <div className="post__time">{timeAgo(post.createdAt)}</div>
            </div>
          </div>
          <PostMenu postId={post._id} authorId={post.author?._id} onDeleted={onDeleted} />
        </div>

        {/* Text */}
        {post.text && <div className="post__text">{post.text}</div>}

        {/* Image */}
        {imgSrc && <img className="post__img" src={imgSrc} alt="post" loading="lazy" onClick={() => setLightbox(imgSrc)} />}

        {/* Meta: likes + comments count */}
        {(likes > 0 || comments > 0) && (
          <div className="post__meta">
            {likes > 0 && (
              <div className="post__meta-likes">
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', marginRight: 4 }}>
                  <AiFillLike size={11} color="#fff" />
                </span>
                {likes}
              </div>
            )}
            {comments > 0 && (
              <button onClick={() => setShowComments(s => !s)}>
                {comments} {comments === 1 ? 'comment' : 'comments'}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="post__actions">
          <button className={`act-btn ${liked ? 'liked' : ''}`} onClick={handleLike} disabled={busy}>
            <AiFillLike size={18} /> {liked ? 'Liked' : 'Like'}
          </button>
          <button className="act-btn" onClick={() => setShowComments(s => !s)}>
            <FiMessageCircle size={18} /> Comment
          </button>
          <button className="act-btn">
            <FiShare2 size={18} /> Share
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <CommentSection postId={post._id} initial={post.comments || []} onAdded={() => setComments(c => c + 1)} />
        )}
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox('')} />}
    </>
  );
};

export default PostCard;
