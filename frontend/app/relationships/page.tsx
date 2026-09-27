'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, GitBranch, Users, UserRound } from 'lucide-react';
import { useFamilyContext } from '../../components/layout/family-context';
import { apiRequest } from '../../services/api';
import type { FamilyMember, ParentChildRelationship } from '../../types/api';

const rootNames = new Set(['Dosham Gul']);

type RelationshipRow = {
  id: string;
  parentName: string;
  childName: string;
  generation: number;
  siblings: number;
  status: string;
};

export default function RelationshipsPage() {
  const { familyId } = useFamilyContext();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<ParentChildRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<FamilyMember[]>('/family-members', {}, { familyId }),
      apiRequest<ParentChildRelationship[]>('/relationships', {}, { familyId }),
    ]).then(([memberData, relationshipData]) => {
      if (!cancelled) {
        setMembers(memberData);
        setRelationships(relationshipData);
      }
    }).catch(() => {
      if (!cancelled) setError('Unable to load parent-child relationships right now.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [familyId]);

  const metrics = useMemo(() => buildRelationshipMetrics(members, relationships), [members, relationships]);
  const totalPages = Math.max(1, Math.ceil(metrics.rows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = metrics.rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="members-page">
      <div className="dashboard-page__glow" />

      <div className="dashboard-page__content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__crumbs">
            <span>Family hierarchy</span>
            <span className="separator">/</span>
            <span className="current">Relationships</span>
          </div>
        </header>

        <section className="dashboard-hero">
          <p className="dashboard-hero__eyebrow">FAMILY HIERARCHY</p>
          <h1>Parent / Child Relationships</h1>
          <p>Review every recorded parent-child link in the family hierarchy.</p>
        </section>

        {loading ? <div className="members-state">Loading relationships...</div> : null}
        {error ? <div className="members-state members-state--error">{error}</div> : null}

        {!loading && !error ? (
          <>
            <section className="stat-grid" style={{ marginTop: '0.25rem' }}>
              <SummaryCard icon={<GitBranch />} label="Relationships recorded" value={`${metrics.relationships.length} relationships • ${metrics.linkedMemberCount} of ${members.length} members linked`} accent="emerald" />
              <SummaryCard icon={<AlertTriangle />} label="Missing parent link" value={`${metrics.unlinkedCount} unlinked members`} warning={metrics.unlinkedCount > 0} accent="amber" />
              <SummaryCard icon={<UserRound />} label="Only-child parents" value={`${metrics.onlyChildParents} parent${metrics.onlyChildParents === 1 ? '' : 's'} with 1 child`} accent="sky" />
              <SummaryCard icon={<Users />} label="Large families" value={`${metrics.largeFamilyParents} parent${metrics.largeFamilyParents === 1 ? '' : 's'} with 5+ children`} accent="violet" />
            </section>

            <section className="members-shell">
              <div className="members-shell__header">
                <div className="members-shell__title-wrap">
                  <span className="members-shell__icon">↔</span>
                  <h2>Parent / Child</h2>
                </div>
              </div>

              <div className="member-table-wrap" style={{ marginTop: '1rem' }}>
                <table className="member-table">
                  <thead>
                    <tr>
                      <th className="member-th">Parent name</th>
                      <th className="member-th">Child name</th>
                      <th className="member-th member-th--compact">Generation depth</th>
                      <th className="member-th member-th--compact">Siblings</th>
                      <th className="member-th member-th--compact">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => (
                      <tr key={row.id} className="member-row">
                        <td className="member-cell member-cell--name">{row.parentName}</td>
                        <td className="member-cell">{row.childName}</td>
                        <td className="member-cell member-cell--compact"><span className="status-badge status-badge--info">Gen {row.generation}</span></td>
                        <td className="member-cell member-cell--compact">{row.siblings}</td>
                        <td className="member-cell member-cell--compact"><span className="status-badge status-badge--success">{formatRelationshipStatus(row.status)}</span></td>
                      </tr>
                    ))}
                    {paginatedRows.length === 0 ? <tr><td colSpan={5} className="member-empty"><div className="member-empty__title">No parent-child relationships recorded.</div></td></tr> : null}
                  </tbody>
                </table>
              </div>

              <div className="member-footer" style={{ marginTop: '1rem' }}>
                <span>
                  Showing {metrics.rows.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, metrics.rows.length)} of {metrics.rows.length}
                </span>
                <div className="member-footer__actions">
                  <button type="button" className="dashboard-topbar__button" disabled={safePage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                    Previous
                  </button>
                  <span className="member-footer__page">Page {safePage} of {totalPages}</span>
                  <button type="button" className="dashboard-topbar__button" disabled={safePage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                    Next
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

function buildRelationshipMetrics(members: FamilyMember[], relationships: ParentChildRelationship[]) {
  const memberNames = new Map(members.map((member) => [member.id, member.fullName ?? 'Unnamed']));
  const parentToChildren = new Map<string, string[]>();
  const parentByChild = new Map<string, string>();
  for (const relationship of relationships) {
    parentToChildren.set(relationship.parentId, [...(parentToChildren.get(relationship.parentId) ?? []), relationship.childId]);
    if (!parentByChild.has(relationship.childId)) parentByChild.set(relationship.childId, relationship.parentId);
  }

  const depthById = new Map<string, number>();
  const resolveDepth = (memberId: string, trail = new Set<string>()): number => {
    const knownDepth = depthById.get(memberId);
    if (knownDepth) return knownDepth;
    if (trail.has(memberId)) return 1;
    const memberName = memberNames.get(memberId);
    if (memberName && rootNames.has(memberName)) {
      depthById.set(memberId, 1);
      return 1;
    }
    const parentId = parentByChild.get(memberId);
    if (!parentId) return 1;
    const depth = resolveDepth(parentId, new Set([...trail, memberId])) + 1;
    depthById.set(memberId, depth);
    return depth;
  };

  const rows: RelationshipRow[] = relationships.map((relationship) => {
    const siblingCount = Math.max(0, (parentToChildren.get(relationship.parentId)?.length ?? 1) - 1);
    return {
      id: relationship.id,
      parentName: memberNames.get(relationship.parentId) ?? relationship.parent.fullName ?? 'Unnamed',
      childName: memberNames.get(relationship.childId) ?? relationship.child.fullName ?? 'Unnamed',
      generation: resolveDepth(relationship.childId),
      siblings: siblingCount,
      status: relationship.relationshipType,
    };
  });

  const linkedIds = new Set(relationships.map((relationship) => relationship.childId));
  const unlinkedCount = members.filter((member) => !rootNames.has(member.fullName ?? '') && !linkedIds.has(member.id)).length;
  const familySizes = [...parentToChildren.values()].map((children) => children.length);

  return {
    rows,
    relationships,
    linkedMemberCount: linkedIds.size,
    unlinkedCount,
    onlyChildParents: familySizes.filter((size) => size === 1).length,
    largeFamilyParents: familySizes.filter((size) => size >= 5).length,
  };
}

function SummaryCard({ icon, label, value, warning = false, accent }: { icon: React.ReactNode; label: string; value: string; warning?: boolean; accent: 'emerald' | 'amber' | 'sky' | 'violet' }) {
  return (
    <article className={`stat-card stat-card--${accent}`}>
      <div className="stat-card__header">
        <div className={`stat-card__icon ${warning ? 'stat-card__icon--warn' : ''}`}>{icon}</div>
        <span>{label}</span>
      </div>
      <div className="stat-card__value" style={{ fontSize: '1.5rem' }}>{value}</div>
      <div className="stat-card__meta">{warning ? 'Needs attention' : 'Updated'}</div>
      <div className="stat-card__chart stat-card__chart--bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </article>
  );
}

function formatRelationshipStatus(status: string) {
  return status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
