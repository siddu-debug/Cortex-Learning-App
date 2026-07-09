'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { KnowledgeEdge, KnowledgeNode } from '@/types/database';
import { layoutKnowledgeGraph } from './layout';
import { cn } from '@/lib/utils';

const NODE_R = 30;

const relColor: Record<string, string> = {
  prerequisite: '#9C8DD0',
  related: '#5FA694',
  extends: '#C9A227',
};

export function KnowledgeGraph({
  nodes,
  edges,
  courseSlug,
}: {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  courseSlug: string;
}) {
  const { nodes: laidOut, edges: laidEdges } = useMemo(
    () => layoutKnowledgeGraph(nodes, edges),
    [nodes, edges]
  );

  const [hovered, setHovered] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const width = Math.max(600, ...laidOut.map((n) => n.x + 160));
  const height = Math.max(420, ...laidOut.map((n) => n.y + 120)) + 80;

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of laidOut) map.set(n.id, new Set());
    for (const e of laidEdges) {
      map.get(e.source_node_id)?.add(e.target_node_id);
      map.get(e.target_node_id)?.add(e.source_node_id);
    }
    return map;
  }, [laidOut, laidEdges]);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = { startX: e.clientX, startY: e.clientY, ox: transform.x, oy: transform.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.startX;
    const dy = e.clientY - dragging.current.startY;
    setTransform((t) => ({ ...t, x: dragging.current!.ox + dx, y: dragging.current!.oy + dy }));
  }
  function onPointerUp() {
    dragging.current = null;
  }
  function zoom(delta: number) {
    setTransform((t) => ({ ...t, scale: Math.min(2, Math.max(0.5, t.scale + delta)) }));
  }

  return (
    <div className="relative rounded-2xl border border-border bg-paper-panel overflow-hidden">
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        <button
          onClick={() => zoom(0.15)}
          className="h-8 w-8 rounded-lg border border-border bg-paper-panel text-ink-soft hover:bg-paper-dim flex items-center justify-center"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => zoom(-0.15)}
          className="h-8 w-8 rounded-lg border border-border bg-paper-panel text-ink-soft hover:bg-paper-dim flex items-center justify-center"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          className="h-8 px-2.5 rounded-lg border border-border bg-paper-panel text-ink-soft hover:bg-paper-dim text-xs font-mono"
        >
          reset
        </button>
      </div>

      <div
        className="paper-grid cursor-grab active:cursor-grabbing"
        style={{ height: 480, touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="select-none"
        >
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
            {laidEdges.map((e) => {
              const a = laidOut.find((n) => n.id === e.source_node_id);
              const b = laidOut.find((n) => n.id === e.target_node_id);
              if (!a || !b) return null;
              const dim = hovered && !(hovered === a.id || hovered === b.id);
              return (
                <line
                  key={e.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={relColor[e.relationship] ?? '#9C8DD0'}
                  strokeWidth={dim ? 1 : 1.75}
                  strokeOpacity={dim ? 0.15 : 0.6}
                />
              );
            })}

            {laidOut.map((n) => {
              const dim = hovered && hovered !== n.id && !neighbors.get(hovered)?.has(n.id);
              const content = (
                <g
                  key={n.id}
                  transform={`translate(${n.x} ${n.y})`}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  opacity={dim ? 0.35 : 1}
                  className="transition-opacity duration-150"
                >
                  <circle
                    r={NODE_R}
                    fill="#FFFFFF"
                    stroke={n.node_type === 'skill' ? '#C9A227' : '#0F7B6C'}
                    strokeWidth={hovered === n.id ? 2.5 : 1.5}
                  />
                  <foreignObject x={-52} y={NODE_R + 4} width={104} height={36}>
                    <div className="text-[11px] font-mono text-center text-ink-soft leading-tight">
                      {n.label}
                    </div>
                  </foreignObject>
                </g>
              );
              return n.lesson_id ? (
                <Link key={n.id} href={`/courses/${courseSlug}/learn/${n.lesson_id}`}>
                  {content}
                </Link>
              ) : (
                content
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-xs font-mono text-ink-faint">
        <LegendDot color={relColor.prerequisite} label="prerequisite" />
        <LegendDot color={relColor.related} label="related" />
        <LegendDot color={relColor.extends} label="extends" />
        <span className="ml-auto">drag to pan · click a node to open its lesson</span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full')} style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
