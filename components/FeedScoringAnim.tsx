/**
 * FeedScoringAnim — pure-CSS animated illustration of a product feed
 * being scored. Three stacked rows, each with a score bar that fills
 * from 0 to its target with staggered delays, then loops.
 *
 * Used in <SidebarAuditPromo /> (vertical layout, grows to fill the
 * column height) and inside <AuditBanner /> (compact horizontal slot).
 *
 * No client-side JS, no React state — the CSS @keyframes drive the
 * whole thing, so it works in a server component and adds zero JS.
 *
 * The `variant="sidebar"` form ALSO renders a small status line at the
 * bottom ("Live scoring") with a pulsing dot, which makes the vertical
 * card feel intentional rather than padded.
 */

const ROWS = [
  { label: 'P1', score: 42, tone: 'low'  as const, delay: '0s'   },
  { label: 'P2', score: 67, tone: 'mid'  as const, delay: '0.6s' },
  { label: 'P3', score: 94, tone: 'high' as const, delay: '1.2s' },
];

export default function FeedScoringAnim({
  variant = 'sidebar',
  liveScoringText = 'Live scoring',
}: {
  variant?: 'sidebar' | 'banner';
  liveScoringText?: string;
}) {
  return (
    <div className={`feed-anim feed-anim--${variant}`} aria-hidden="true">
      <div className="feed-anim__header">
        <span className="feed-anim__header-dot feed-anim__header-dot--r" />
        <span className="feed-anim__header-dot feed-anim__header-dot--a" />
        <span className="feed-anim__header-dot feed-anim__header-dot--g" />
        <span className="feed-anim__header-title">feed_audit.json</span>
      </div>

      <div className="feed-anim__rows">
        {ROWS.map((r) => (
          <div
            key={r.label}
            className={`feed-anim__row feed-anim__row--${r.tone}`}
            style={{ animationDelay: r.delay }}
          >
            <div className="feed-anim__row-thumb">{r.label}</div>
            <div className="feed-anim__row-body">
              <div className="feed-anim__row-line" />
              <div className="feed-anim__row-line feed-anim__row-line--short" />
              <div className="feed-anim__row-bar">
                <span
                  className={`feed-anim__row-bar-fill feed-anim__row-bar-fill--${r.tone}`}
                  style={
                    {
                      // CSS var consumed by @keyframes to fill to the target %
                      '--target': `${r.score}%`,
                      animationDelay: r.delay,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
            <div
              className={`feed-anim__row-score feed-anim__row-score--${r.tone}`}
              style={{ animationDelay: r.delay }}
            >
              <span className="feed-anim__row-score-num">{r.score}</span>
              <span className="feed-anim__row-score-unit">/100</span>
            </div>
          </div>
        ))}
      </div>

      {variant === 'sidebar' && (
        <div className="feed-anim__footer">
          <span className="feed-anim__footer-pulse" />
          <span className="feed-anim__footer-text">{liveScoringText}</span>
        </div>
      )}
    </div>
  );
}
