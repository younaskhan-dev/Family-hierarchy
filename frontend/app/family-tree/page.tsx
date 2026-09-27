'use client';

import { useEffect, useMemo, useState } from 'react';
import { FamilyTreeView, type FamilyTreeNode } from '../../components/family-tree/family-tree-view';
import { useFamilyContext } from '../../components/layout/family-context';
import { apiRequest } from '../../services/api';
import type { FamilyMember, ParentChildRelationship } from '../../types/api';

export default function FamilyTreePage() {
  const { familyId } = useFamilyContext();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<ParentChildRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadTree() {
      setLoading(true);
      setError(null);
      try {
        const [memberData, relationshipData] = await Promise.all([
          apiRequest<FamilyMember[]>('/family-members', {}, { familyId }),
          apiRequest<ParentChildRelationship[]>('/relationships', {}, { familyId }),
        ]);
        if (!cancelled) {
          setMembers(memberData.filter((member) => member.fullName !== '[Name missing]'));
          setRelationships(relationshipData);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load the family tree.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (familyId) void loadTree();
    return () => { cancelled = true; };
  }, [familyId]);

  const roots = useMemo(() => {
    const memberMap = new Map(members.map((member) => [member.id, { ...member, children: [] as FamilyTreeNode[] }]));
    for (const relationship of relationships) {
      const parent = memberMap.get(relationship.parentId);
      const child = memberMap.get(relationship.childId);
      if (parent && child) parent.children.push(child);
    }
    const childIds = new Set(relationships.map((relationship) => relationship.childId));
    return [...memberMap.values()].filter((member) => !childIds.has(member.id));
  }, [members, relationships]);

  return (
    <div className="members-page">
      <div className="dashboard-page__glow" />

      <div className="dashboard-page__content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__crumbs">
            <span>Family hierarchy</span>
            <span className="separator">/</span>
            <span className="current">Family tree</span>
          </div>
        </header>

        <section className="dashboard-hero">
          <p className="dashboard-hero__eyebrow">FAMILY HIERARCHY</p>
          <h1>Family Tree</h1>
          <p>Explore a connected, searchable hierarchy of parents, children, and generations.</p>
        </section>

        {loading ? <div className="family-tree-skeleton" aria-label="Loading family hierarchy" /> : null}
        {error ? <div className="members-state members-state--error">{error}</div> : null}
        {!loading && !error ? (
          <section className="members-shell" style={{ padding: '1rem' }}>
            <div className="members-shell__header" style={{ paddingBottom: '0.8rem' }}>
              <div className="members-shell__title-wrap">
                <span className="members-shell__icon">🌳</span>
                <h2>Hierarchy view</h2>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <FamilyTreeView roots={roots} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
