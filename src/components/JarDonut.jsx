export default function JarDonut({ percentages, size = 200 }) {
  // SVG cannot use CSS variables in Safari, so we read computed colors
  const getJarColor = (key) => {
    const cssVar = `--jar-${key}`;
    const computed = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return computed || {
      necessities: '#3B82F6',
      freedom: '#10B981',
      savings: '#F59E0B',
      education: '#8B5CF6',
      play: '#EF4444',
      give: '#EC4899'
    }[key] || '#64748B';
  };

  const jarOrder = ['necessities', 'freedom', 'savings', 'education', 'play', 'give'];
  const total = jarOrder.reduce((sum, key) => sum + (percentages[key] || 0), 0);

  const radius = (size - 30) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentOffset = 0;
  const segments = jarOrder.map(key => {
    const pct = total > 0 ? (percentages[key] || 0) / total : 0;
    const dashLength = pct * circumference;
    const segment = {
      key,
      color: getJarColor(key),
      dashArray: `${dashLength} ${circumference - dashLength}`,
      dashOffset: -currentOffset,
      percentage: percentages[key] || 0
    };
    currentOffset += dashLength;
    return segment;
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius}
          fill="none" stroke="var(--border)" strokeWidth="14" opacity={0.3} />
        {segments.map(seg => (
          seg.percentage > 0 && (
            <circle key={seg.key} cx={center} cy={center} r={radius}
              fill="none" stroke={seg.color} strokeWidth="14"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }} />
          )
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{total}%</span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Alocado</span>
      </div>
    </div>
  );
}
