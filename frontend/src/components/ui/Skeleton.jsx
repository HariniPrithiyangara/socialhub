/**
 * Skeleton loader cards — shown while posts are loading
 */
const SkeletonCard = () => (
  <div className="sh-skeleton-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
      <div className="sh-skeleton sh-skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <div className="sh-skeleton sh-skeleton-line" style={{ width: '40%', marginBottom: '6px' }} />
        <div className="sh-skeleton sh-skeleton-line" style={{ width: '25%' }} />
      </div>
    </div>
    <div className="sh-skeleton sh-skeleton-line" style={{ width: '100%' }} />
    <div className="sh-skeleton sh-skeleton-line" style={{ width: '80%' }} />
    <div className="sh-skeleton sh-skeleton-image" />
    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
      <div className="sh-skeleton sh-skeleton-line" style={{ width: '80px', height: '36px', borderRadius: '20px' }} />
      <div className="sh-skeleton sh-skeleton-line" style={{ width: '80px', height: '36px', borderRadius: '20px' }} />
    </div>
  </div>
);

const SkeletonFeed = ({ count = 3 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export { SkeletonCard, SkeletonFeed };
