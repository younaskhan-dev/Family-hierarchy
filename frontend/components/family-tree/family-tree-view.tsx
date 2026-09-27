'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEventHandler, ReactNode } from 'react';
import Tree, { type CustomNodeElementProps } from 'react-d3-tree';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { TreeNodeDatum } from 'react-d3-tree';
import { AnimatePresence, motion } from 'framer-motion';
import type { FamilyMember } from '../../types/api';
// d3-selection and d3-zoom are transitive deps of react-d3-tree — always present at runtime.
// @ts-expect-error – no bundled type declarations; suppress TS7016
import { select as d3select } from 'd3-selection';
// @ts-expect-error – no bundled type declarations; suppress TS7016
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';

/** Minimum zoom level enforced when fitting — keeps node text legible. */
const MIN_FIT_ZOOM = 0.4;
/** Padding (px) to leave around the fitted tree on each side. */
const FIT_PADDING = 48;
/** Duration of the auto-fit zoom animation in ms. */
const FIT_TRANSITION_MS = 280;

export type FamilyTreeNode = FamilyMember & { children: FamilyTreeNode[] };

type TreeDatumAttributes = {
  memberId: string;
  relationLabel: string;
  generation: number;
  rootName: string;
  parentName?: string;
  synthetic?: boolean;
};

type ViewDatum = {
  name: string;
  attributes: TreeDatumAttributes;
  children?: ViewDatum[];
};

type FamilyTreeViewProps = {
  roots: FamilyTreeNode[];
};

const generationPalette = [
  // Keep this order stable: generation 1 starts at index 0, then advances by depth.
  { fill: '#334155', border: '#64748b', text: '#f8fafc' },
  { fill: '#dbeafe', border: '#3b82f6', text: '#172554' },
  { fill: '#ccfbf1', border: '#14b8a6', text: '#134e4a' },
  { fill: '#ede9fe', border: '#8b5cf6', text: '#3b0764' },
  { fill: '#fef3c7', border: '#f59e0b', text: '#78350f' },
];

const nodeWidth = 250;
const nodeHeight = 112;

export function FamilyTreeView({ roots }: FamilyTreeViewProps) {
  const treeRef = useRef<Tree>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [initialDepth, setInitialDepth] = useState(2);
  const [dataKey, setDataKey] = useState(0);
  const [treeExpansionMode, setTreeExpansionMode] = useState<'expand' | 'collapse'>('expand');
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });
  const [zoomLevel, setZoomLevel] = useState(0.86);
  const [searchFocused, setSearchFocused] = useState(false);

  const treeData = useMemo(() => buildTreeData(roots, treeExpansionMode), [roots, treeExpansionMode]);
  const people = useMemo(() => flattenTree(roots), [roots]);
  const focusedPath = useMemo(() => {
    if (!focusedId) return [];
    return findPath(roots, focusedId);
  }, [focusedId, roots]);
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return people.filter((person) => getName(person).toLowerCase().includes(normalized)).slice(0, 8);
  }, [people, query]);

  useEffect(() => {
    const resize = () => {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (bounds) setDimensions({ width: Math.max(320, bounds.width), height: Math.max(620, Math.min(900, window.innerHeight - 250)) });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!focusedId) return;
    const focusTimer = window.setTimeout(() => {
      const tree = treeRef.current;
      if (!tree) return;
      const stateData = (tree as unknown as { state?: { data?: TreeNodeDatum[] } }).state?.data ?? [];
      const target = findD3NodeByMemberId(stateData, focusedId);
      if (target) tree.centerNode(target);
    }, 450);
    return () => window.clearTimeout(focusTimer);
  }, [focusedId, dataKey]);

  const focusPerson = (person: FamilyTreeNode) => {
    const path = findPath(roots, person.id);
    setFocusedId(person.id);
    setQuery(getName(person));
    setInitialDepth(Math.max(2, path.length));
    setDataKey((value) => value + 1);
  };

  /**
   * Reads the rendered SVG node positions from the DOM, computes the bounding
   * box in tree coordinates that encompasses every visible node, then calculates
   * the zoom level needed to fit BOTH width and height inside the canvas with FIT_PADDING.
   * Uses whichever dimension requires MORE zoom-out, so the entire tree is fully visible.
   */
  const fitToVisibleNodes = useCallback((forceFullFit = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const svgEl = canvas.querySelector('svg[class*="rd3t-svg"]') as SVGSVGElement | null;
    const gEl = canvas.querySelector('g[class*="rd3t-g"]') as SVGGElement | null;
    if (!svgEl || !gEl) return;

    const foreignObjects = Array.from(
      gEl.querySelectorAll('foreignObject')
    ) as SVGForeignObjectElement[];

    if (foreignObjects.length === 0) return;

    let treeLocalMinX = Infinity;
    let treeLocalMaxX = -Infinity;
    let treeLocalMinY = Infinity;
    let treeLocalMaxY = -Infinity;

    for (const fo of foreignObjects) {
      const lx = parseFloat(fo.getAttribute('x') ?? '0');
      const ly = parseFloat(fo.getAttribute('y') ?? '0');
      const lw = parseFloat(fo.getAttribute('width') ?? '0') || nodeWidth;
      const lh = parseFloat(fo.getAttribute('height') ?? '0') || nodeHeight;

      const nodeG = fo.parentElement as SVGGElement | null;
      if (!nodeG) continue;

      const nodeTransform = nodeG.getAttribute('transform') ?? '';
      const nodeMatch = nodeTransform.match(/translate\(([^,]+),([^)]+)\)/);
      const nodeX = nodeMatch ? parseFloat(nodeMatch[1]) : 0;
      const nodeY = nodeMatch ? parseFloat(nodeMatch[2]) : 0;

      const left = nodeX + lx;
      const top = nodeY + ly;
      const right = left + lw;
      const bottom = top + lh;

      treeLocalMinX = Math.min(treeLocalMinX, left);
      treeLocalMaxX = Math.max(treeLocalMaxX, right);
      treeLocalMinY = Math.min(treeLocalMinY, top);
      treeLocalMaxY = Math.max(treeLocalMaxY, bottom);
    }

    if (!isFinite(treeLocalMinX) || !isFinite(treeLocalMinY)) return;

    const treeWidth = treeLocalMaxX - treeLocalMinX;
    const treeHeight = treeLocalMaxY - treeLocalMinY;
    const { width: canvasW, height: canvasH } = dimensions;

    const availW = Math.max(100, canvasW - FIT_PADDING * 2);
    const availH = Math.max(100, canvasH - FIT_PADDING * 2);

    // Scale ratio needed to fit horizontal and vertical bounds into available canvas space
    const scaleRatioX = treeWidth > 0 ? availW / treeWidth : 1;
    const scaleRatioY = treeHeight > 0 ? availH / treeHeight : 1;

    // Use whichever dimension requires MORE zoom-out so the entire tree fits on screen
    const idealZoom = Math.min(scaleRatioX, scaleRatioY);

    // For expanded or large tree states, allow zooming out as far as needed (down to 0.02)
    // For small/collapsed normal states (few nodes), keep MIN_FIT_ZOOM safeguard
    const isLargeOrExpanded = forceFullFit || foreignObjects.length > 12 || initialDepth > 2;
    const minZoomFloor = isLargeOrExpanded ? 0.02 : MIN_FIT_ZOOM;
    const newZoom = Math.max(minZoomFloor, Math.min(1.2, idealZoom));

    const treeCenterLocalX = (treeLocalMinX + treeLocalMaxX) / 2;
    const treeCenterLocalY = (treeLocalMinY + treeLocalMaxY) / 2;

    const newTx = canvasW / 2 - treeCenterLocalX * newZoom;
    const newTy = canvasH / 2 - treeCenterLocalY * newZoom;

    const svgSel = d3select(svgEl as Element);
    const gSel = d3select(gEl as Element);

    gSel.transition()
      .duration(FIT_TRANSITION_MS)
      .ease((t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
      .attr('transform', `translate(${newTx},${newTy})scale(${newZoom})`);

    const zoomBehavior = d3zoom();
    svgSel.call(zoomBehavior.transform, zoomIdentity.translate(newTx, newTy).scale(newZoom));

    setZoomLevel(newZoom);
  }, [dimensions, initialDepth]);

  const toggleAll = (mode: 'expand' | 'collapse') => {
    setTreeExpansionMode(mode);
    setInitialDepth(mode === 'expand' ? 99 : 2);
    setDataKey((value) => value + 1);

    window.setTimeout(() => {
      fitToVisibleNodes(mode === 'expand');
    }, 280 + 120);
  };

  const changeZoom = (amount: number) => setZoomLevel((current) => Math.min(1.8, Math.max(0.02, Number((current + amount).toFixed(2)))));
  const fitTree = () => {
    // Recompute fit against the current expanded state, ensuring both width and height fit.
    fitToVisibleNodes(true);
  };

  return (
    <section className="space-y-4" aria-label="Interactive family tree">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <label htmlFor="family-tree-search" className="sr-only">Search family members</label>
          <motion.input
            id="family-tree-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search and jump to a person..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setSearchFocused(false), 160)}
            animate={{ boxShadow: searchFocused ? '0 0 0 4px rgba(56, 189, 248, 0.16)' : '0 0 0 0 rgba(56, 189, 248, 0)' }}
            transition={{ duration: 0.15 }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          <AnimatePresence>
          {suggestions.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {suggestions.map((person) => (
                <button key={person.id} type="button" onClick={() => focusPerson(person)} className="block w-full px-3 py-2 text-left text-sm hover:bg-sky-50">
                  <span className="font-medium text-slate-900">{getName(person)}</span>
                  <span className="ml-2 text-xs text-slate-500">{person.notes?.includes('[source-key:') ? 'Family hierarchy' : 'Family member'}</span>
                </button>
              ))}
            </motion.div>
          ) : null}
          </AnimatePresence>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatedButton type="button" onClick={() => toggleAll('expand')} className="bg-sky-600 text-white hover:bg-sky-700">Expand all</AnimatedButton>
          <AnimatedButton type="button" onClick={() => toggleAll('collapse')} className="border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Collapse all</AnimatedButton>
        </div>
      </div>

      <div className="flex min-h-10 items-center gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" aria-label="Focused person breadcrumb">
        {focusedPath.length > 0 ? focusedPath.map((person, index) => (
          <span key={person.id} className="flex shrink-0 items-center gap-2">
            {index > 0 ? <span className="text-slate-400">›</span> : null}
            <button type="button" onClick={() => focusPerson(person)} className={person.id === focusedId ? 'font-semibold text-sky-700' : 'hover:text-sky-700'}>{getName(person)}</button>
          </span>
        )) : <span>Select a person to see their family hierarchy path.</span>}
      </div>

      <div ref={canvasRef} style={{ height: `${dimensions.height}px` }} className="family-tree-canvas relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-md bg-slate-900/85 px-3 py-2 text-xs text-slate-300">
          Drag to pan • Scroll to zoom • Click a node to focus • Use + / − to expand
        </div>
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 p-1 shadow-lg">
          <AnimatedButton type="button" aria-label="Zoom out" onClick={() => changeZoom(-0.12)} className="h-9 w-9 bg-slate-800 p-0 text-lg text-white hover:bg-slate-700">−</AnimatedButton>
          <AnimatedButton type="button" aria-label="Fit tree to screen" onClick={fitTree} className="h-9 bg-slate-800 px-3 text-xs text-white hover:bg-slate-700">Fit</AnimatedButton>
          <AnimatedButton type="button" aria-label="Zoom in" onClick={() => changeZoom(0.12)} className="h-9 w-9 bg-slate-800 p-0 text-lg text-white hover:bg-slate-700">+</AnimatedButton>
        </div>
        <Tree
          ref={treeRef}
          data={treeData}
          dataKey={`family-tree-${dataKey}`}
          orientation="vertical"
          translate={{ x: dimensions.width / 2, y: 96 }}
          dimensions={dimensions}
          nodeSize={{ x: 300, y: 182 }}
          separation={{ siblings: 1.45, nonSiblings: 1.75 }}
          initialDepth={initialDepth}
          collapsible
          zoomable
          draggable
          enableLegacyTransitions
          transitionDuration={280}
          zoom={zoomLevel}
          scaleExtent={{ min: 0.02, max: 1.8 }}
          pathFunc="step"
          pathClassFunc={(link) => {
            const targetId = link.target.data.attributes?.memberId;
            return targetId && focusedPath.some((person) => person.id === targetId) ? 'family-tree-link family-tree-link-highlighted' : 'family-tree-link';
          }}
          renderCustomNodeElement={(nodeProps) => <FamilyTreeNode {...nodeProps} focusedId={focusedId} />}
        />
      </div>
    </section>
  );
}

function FamilyTreeNode({ nodeDatum, toggleNode, focusedId }: CustomNodeElementProps & { focusedId: string | null }) {
  const attributes = nodeDatum.attributes as TreeDatumAttributes | undefined;
  const isSynthetic = attributes?.synthetic;
  const generation = Math.max(0, (attributes?.generation ?? 1) - 1);
  const colors = isSynthetic ? generationPalette[0] : generationPalette[Math.min(generation, generationPalette.length - 1)];
  const hasChildren = Boolean(nodeDatum.children?.length);
  const isFocused = attributes?.memberId === focusedId;

  if (isSynthetic) {
    return <circle r={1} fill="transparent" stroke="transparent" />;
  }

  return (
    <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24, ease: 'easeOut', delay: Math.min((attributes?.generation ?? 1) * 0.04, 0.2) }} className={isFocused ? 'family-tree-node family-tree-node-focused' : 'family-tree-node'} onClick={toggleNode} role="button" tabIndex={0} aria-label={`${nodeDatum.name}, ${attributes?.relationLabel ?? ''}`}>
      <foreignObject x={-nodeWidth / 2} y={-nodeHeight / 2} width={nodeWidth} height={nodeHeight}>
        <motion.div
          className="family-tree-card"
          style={{ backgroundColor: colors.fill, borderColor: colors.border, borderLeftColor: colors.border, color: colors.text, boxShadow: isFocused ? `0 0 0 3px ${colors.border}, 0 12px 24px rgba(15, 23, 42, 0.35)` : undefined }}
          whileHover={{ y: -2, boxShadow: `0 12px 26px ${colors.border}55` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <div className="family-tree-card-name">{nodeDatum.name}</div>
          <div className="family-tree-card-relation">{attributes?.relationLabel ?? ''}</div>
        </motion.div>
      </foreignObject>
      {isFocused ? <motion.circle initial={{ opacity: 0.8, scale: 0.72 }} animate={{ opacity: 0, scale: 1.35 }} transition={{ duration: 0.7, ease: 'easeOut' }} cx={0} cy={0} r={nodeWidth / 2 + 5} fill="none" stroke={colors.border} strokeWidth={3} /> : null}
      {hasChildren ? <g className="family-tree-toggle" onClick={(event) => { event.stopPropagation(); toggleNode(); }}><circle cx={nodeWidth / 2 - 20} cy={nodeHeight / 2 - 18} r={15} fill={colors.border} stroke="#fff" strokeWidth={2} /><text x={nodeWidth / 2 - 20} y={nodeHeight / 2 - 12} textAnchor="middle" fill="#fff" fontSize={19} fontWeight={700}>{nodeDatum.__rd3t.collapsed ? '+' : '−'}</text></g> : null}
    </motion.g>
  );
}

function AnimatedButton({ children, className, type = 'button', onClick, 'aria-label': ariaLabel }: { children: ReactNode; className?: string; type?: 'button' | 'submit' | 'reset'; onClick?: MouseEventHandler<HTMLButtonElement>; 'aria-label'?: string }) {
  return <motion.button type={type} aria-label={ariaLabel} onClick={onClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }} className={`rounded-md px-3 py-2 text-sm font-medium ${className ?? ''}`}>{children}</motion.button>;
}

function buildTreeData(roots: FamilyTreeNode[], mode: 'expand' | 'collapse' = 'expand'): ViewDatum[] {
  // react-d3-tree only reapplies its initial-depth collapse state when the data reference changes.
  // Keeping the mode in the tree data ensures bulk expand/collapse creates a fresh tree layout.
  const syntheticRoot: ViewDatum = {
    name: 'Family Hierarchy',
    attributes: { memberId: 'synthetic-family-root', relationLabel: '', generation: 0, rootName: '', synthetic: true },
    children: roots.map((root) => toViewDatum(root, 1, getName(root))),
  };

  return [{
    ...syntheticRoot,
    children: syntheticRoot.children ? syntheticRoot.children.map((child) => ({ ...child })) : undefined,
    __bulkMode: mode,
  } as ViewDatum & { __bulkMode?: 'expand' | 'collapse' }];
}

function toViewDatum(node: FamilyTreeNode, generation: number, rootName: string, parentName?: string): ViewDatum {
  return {
    name: getName(node),
    attributes: {
      memberId: node.id,
      relationLabel: getRelationshipLabel(generation, rootName, parentName),
      generation,
      rootName,
      parentName,
    },
    children: node.children.map((child) => toViewDatum(child, generation + 1, rootName, getName(node))),
  };
}

function flattenTree(nodes: FamilyTreeNode[]): FamilyTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

function findPath(nodes: FamilyTreeNode[], targetId: string): FamilyTreeNode[] {
  for (const node of nodes) {
    if (node.id === targetId) return [node];
    const childPath = findPath(node.children, targetId);
    if (childPath.length > 0) return [node, ...childPath];
  }
  return [];
}

function findD3NodeByMemberId(nodes: TreeNodeDatum[], memberId: string): HierarchyPointNode<TreeNodeDatum> | undefined {
  for (const node of nodes) {
    if (node.attributes?.memberId === memberId) return node as unknown as HierarchyPointNode<TreeNodeDatum>;
    const match = findD3NodeByMemberId(node.children ?? [], memberId);
    if (match) return match;
  }
  return undefined;
}

function getName(member: FamilyMember) {
  return member.fullName ?? 'Unnamed';
}

function getRelationshipLabel(generation: number, rootName: string, parentName?: string) {
  if (generation === 1) return 'Grandfather';
  if (generation === 2) return `Son of ${rootName}`;
  if (generation === 3) return `Grandson of ${rootName} & son of ${parentName}`;
  return `${'great-'.repeat(generation - 3)}grandson of ${rootName} & son of ${parentName}`;
}

