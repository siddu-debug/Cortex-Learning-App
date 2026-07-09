import type { KnowledgeEdge, KnowledgeNode } from '@/types/database';

export interface LaidOutNode extends KnowledgeNode {
  layer: number;
  x: number;
  y: number;
}

const LAYER_GAP_X = 220;
const NODE_GAP_Y = 90;
const MARGIN = 60;

/**
 * Positions nodes left-to-right by their longest prerequisite depth, so the
 * graph literally reads as a learning path: roots on the left, advanced
 * topics on the right. Falls back gracefully on cycles (shouldn't occur
 * for well-formed prerequisite graphs, but AI-generated data can surprise).
 */
export function layoutKnowledgeGraph(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[]
): { nodes: LaidOutNode[]; edges: KnowledgeEdge[] } {
  const prereqEdges = edges.filter((e) => e.relationship === 'prerequisite');
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const n of nodes) {
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  }
  for (const e of prereqEdges) {
    outgoing.get(e.source_node_id)?.push(e.target_node_id);
    incoming.get(e.target_node_id)?.push(e.source_node_id);
  }

  const layer = new Map<string, number>();
  const visiting = new Set<string>();

  function computeLayer(id: string): number {
    if (layer.has(id)) return layer.get(id)!;
    if (visiting.has(id)) return 0; // cycle guard
    visiting.add(id);
    const preds = incoming.get(id) ?? [];
    const l = preds.length === 0 ? 0 : Math.max(...preds.map(computeLayer)) + 1;
    visiting.delete(id);
    layer.set(id, l);
    return l;
  }

  for (const n of nodes) computeLayer(n.id);

  const byLayer = new Map<number, KnowledgeNode[]>();
  for (const n of nodes) {
    const l = layer.get(n.id) ?? 0;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(n);
  }

  const laidOut: LaidOutNode[] = [];
  for (const [l, group] of Array.from(byLayer.entries()).sort((a, b) => a[0] - b[0])) {
    group.forEach((n, i) => {
      const columnHeight = group.length * NODE_GAP_Y;
      laidOut.push({
        ...n,
        layer: l,
        x: MARGIN + l * LAYER_GAP_X,
        y: MARGIN + i * NODE_GAP_Y - columnHeight / 2 + 200,
      });
    });
  }

  return { nodes: laidOut, edges: prereqEdges.length ? prereqEdges : edges };
}
