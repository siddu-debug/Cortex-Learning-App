'use client';

// Hand-placed demo nodes so the hero graph reads as a real prerequisite
// path (Arrays -> Big-O -> ... -> Dynamic Programming) rather than a
// random scatter. Purely decorative — the real graph is data-driven.
const NODES = [
  { id: 'arrays', label: 'Arrays', x: 40, y: 130 },
  { id: 'bigo', label: 'Big-O', x: 170, y: 60 },
  { id: 'recursion', label: 'Recursion', x: 170, y: 200 },
  { id: 'hashing', label: 'Hash Maps', x: 320, y: 40 },
  { id: 'trees', label: 'Trees', x: 320, y: 140 },
  { id: 'graphs', label: 'Graphs', x: 320, y: 240 },
  { id: 'dp', label: 'Dynamic Programming', x: 490, y: 100 },
  { id: 'greedy', label: 'Greedy Algorithms', x: 490, y: 200 },
] as const;

const EDGES: [string, string][] = [
  ['arrays', 'bigo'],
  ['arrays', 'recursion'],
  ['bigo', 'hashing'],
  ['bigo', 'trees'],
  ['recursion', 'trees'],
  ['recursion', 'graphs'],
  ['trees', 'dp'],
  ['graphs', 'dp'],
  ['trees', 'greedy'],
  ['graphs', 'greedy'],
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function KnowledgeGraphHero({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 280"
      className={className}
      role="img"
      aria-label="A knowledge graph showing prerequisite relationships between computer science concepts"
    >
      <defs>
        <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" fill="#9C8DD0" />
        </marker>
      </defs>

      {EDGES.map(([from, to], i) => {
        const a = nodeById(from);
        const b = nodeById(to);
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#9C8DD0"
            strokeOpacity={0.55}
            strokeWidth={1.5}
            markerEnd="url(#arrow)"
            style={{
              strokeDasharray: 6,
              animation: `dash 2.4s linear infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        );
      })}

      {NODES.map((n, i) => (
        <g key={n.id} className="animate-pulseNode" style={{ animationDelay: `${i * 0.3}s` }}>
          <circle cx={n.x} cy={n.y} r={26} fill="#FFFFFF" stroke="#0F7B6C" strokeWidth={1.5} />
          <circle cx={n.x} cy={n.y} r={26} fill="#0F7B6C" fillOpacity={0.06} />
          <foreignObject x={n.x - 44} y={n.y + 30} width={88} height={30}>
            <div className="text-[10px] font-mono text-center text-ink-soft leading-tight">
              {n.label}
            </div>
          </foreignObject>
        </g>
      ))}

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -24; }
        }
      `}</style>
    </svg>
  );
}
