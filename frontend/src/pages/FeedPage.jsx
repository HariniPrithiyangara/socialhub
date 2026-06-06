import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { postAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import RightSidebar from '../components/layout/RightSidebar';
import CreatePostBox from '../components/post/CreatePostBox';
import PostCard from '../components/post/PostCard';

const TABS = [
  { label: 'All Posts', value: 'recent' },
  { label: '🔥 Most Liked', value: 'mostLiked' },
  { label: '💬 Most Commented', value: 'mostCommented' },
];

const SkeletonCard = () => (
  <div className="skel-card">
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <div className="skel skel-av" />
      <div style={{ flex: 1 }}>
        <div className="skel skel-line" style={{ width: '35%', marginBottom: 6 }} />
        <div className="skel skel-line" style={{ width: '20%' }} />
      </div>
    </div>
    <div className="skel skel-line" style={{ width: '85%' }} />
    <div className="skel skel-line" style={{ width: '65%', marginBottom: 4 }} />
    <div className="skel skel-img" />
  </div>
);

const FeedPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState('recent');
  const [pag, setPag] = useState({ currentPage: 1, hasMore: false, totalPosts: 0 });

  const fetch = useCallback(async (page = 1, sort = tab, replace = true, searchTerm = search) => {
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await postAPI.getAll({ page, limit: 10, sort, search: searchTerm });
      setPosts(p => replace ? data.data : [...p, ...data.data]);
      setPag(data.pagination);
    } catch { toast.error('Could not load posts'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [tab, search]);

  useEffect(() => { fetch(1, tab, true, search); }, [tab, search]);

  const onPostCreated = p => { setPosts(prev => [p, ...prev]); setPag(x => ({ ...x, totalPosts: x.totalPosts + 1 })); };
  const onDeleted = id => { setPosts(p => p.filter(x => x._id !== id)); setPag(x => ({ ...x, totalPosts: Math.max(0, x.totalPosts - 1) })); };

  return (
    <div className="page">
      <Navbar />
      <div className="feed-grid">
        <Sidebar postCount={posts.filter(p => p.author?._id === user?._id).length} />

        {/* Main Feed */}
        <div className="feed-main">
          {isAuthenticated && <CreatePostBox onPostCreated={onPostCreated} />}

          {/* Filter tabs */}
          <div className="filter-bar">
            {TABS.map(t => (
              <button key={t.value} className={`filter-tab ${tab === t.value ? 'on' : ''}`}
                onClick={() => { setTab(t.value); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                {t.label}
              </button>
            ))}
            <button className="filter-refresh" onClick={() => fetch(1, tab, true)} title="Refresh">
              <FiRefreshCw size={15} />
            </button>
          </div>

          {/* Loading */}
          {loading && [1,2,3].map(i => <SkeletonCard key={i} />)}

          {/* Empty */}
          {!loading && posts.length === 0 && (
            <div className="empty">
              <div className="empty__ico">📭</div>
              <div className="empty__title">No posts yet</div>
              <div className="empty__sub">
                {isAuthenticated ? 'Be the first to share something with the community!' : 'Log in to create and interact with posts.'}
              </div>
            </div>
          )}

          {/* Posts */}
          {!loading && posts.map(p => <PostCard key={p._id} post={p} onDeleted={onDeleted} />)}

          {/* Load more */}
          {!loading && pag.hasMore && (
            <div className="load-more">
              <button className="load-more-btn" onClick={() => fetch(pag.currentPage + 1, tab, false)} disabled={loadingMore}>
                {loadingMore ? <span className="spinner dark" style={{ width: 16, height: 16 }} /> : 'See more posts'}
              </button>
            </div>
          )}

          {!loading && !pag.hasMore && posts.length > 0 && (
            <div className="feed-end">🎉 You're all caught up!</div>
          )}
        </div>

        <RightSidebar />
      </div>
    </div>
  );
};

export default FeedPage;
