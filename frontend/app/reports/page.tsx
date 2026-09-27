'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFamilyContext } from '../../components/layout/family-context';
import { apiRequest } from '../../services/api';
import type { FamilyMember, ParentChildRelationship } from '../../types/api';

function AnimatedNumber({
  value,
  duration = 1200,
  delay = 0,
}: {
  value: number;
  duration?: number;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(value)) {
      return;
    }

    let frameId = 0;
    const startTime = Date.now() + delay;

    const tick = () => {
      const now = Date.now();
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - elapsed) ** 3;
      setDisplayValue(Math.round(value * eased));

      if (elapsed < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [value, duration, delay]);

  return <span>{displayValue}</span>;
}

export default function ReportsPage() {
  const { familyId } = useFamilyContext();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<ParentChildRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiRequest<FamilyMember[]>('/family-members', {}, { familyId }),
      apiRequest<ParentChildRelationship[]>('/relationships', {}, { familyId }),
    ])
      .then(([memberData, relationshipData]) => {
        if (!cancelled) {
          setMembers(memberData);
          setRelationships(relationshipData);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load family summary data right now.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [familyId]);

  const summary = useMemo(() => {
    const totalMembers = members.length;
    const livingMembers = members.filter((member) => member.status === 'LIVING').length;
    const deceasedMembers = members.filter((member) => member.status === 'DECEASED').length;
    const relationshipCount = relationships.length;

    const parentByChild = new Map<string, string>();
    for (const rel of relationships) {
      if (!parentByChild.has(rel.childId)) {
        parentByChild.set(rel.childId, rel.parentId);
      }
    }

    const depthMap = new Map<string, number>();
    const getDepth = (id: string, visited = new Set<string>()): number => {
      if (depthMap.has(id)) return depthMap.get(id)!;
      if (visited.has(id)) return 1;

      const parentId = parentByChild.get(id);
      if (!parentId) {
        depthMap.set(id, 1);
        return 1;
      }

      const depth = getDepth(parentId, new Set([...visited, id])) + 1;
      depthMap.set(id, depth);
      return depth;
    };

    let maxGeneration = 0;
    for (const member of members) {
      maxGeneration = Math.max(maxGeneration, getDepth(member.id));
    }

    const childIds = new Set(relationships.map((relationship) => relationship.childId));
    const familyBranches = members.filter((member) => !childIds.has(member.id)).length;

    return {
      totalMembers,
      livingMembers,
      deceasedMembers,
      relationshipCount,
      maxGeneration,
      familyBranches,
    };
  }, [members, relationships]);

  const summaryItems = [
    { label: 'Total members', value: loading ? null : summary.totalMembers, accent: 'emerald' },
    { label: 'Living members', value: loading ? null : summary.livingMembers, accent: 'sky' },
    { label: 'Deceased members', value: loading ? null : summary.deceasedMembers, accent: 'violet' },
    { label: 'Relationships', value: loading ? null : summary.relationshipCount, accent: 'amber' },
    { label: 'Generations', value: loading ? null : summary.maxGeneration, accent: 'emerald' },
    { label: 'Family branches', value: loading ? null : summary.familyBranches, accent: 'sky' },
    { label: 'Upcoming dates', value: 'No data recorded', muted: true, accent: 'violet' },
    { label: 'Events', value: 'No data recorded', muted: true, accent: 'amber' },
  ];

  return (
    <div className="members-page">
      <div className="dashboard-page__glow" />

      <div className="dashboard-page__content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__crumbs">
            <span>Family hierarchy</span>
            <span className="separator">/</span>
            <span className="current">Reports</span>
          </div>
        </header>

        <section className="dashboard-hero">
          <p className="dashboard-hero__eyebrow">FAMILY HIERARCHY</p>
          <h1>Reports</h1>
          <p>Summaries and family insights.</p>
        </section>

        <section className="members-shell">
          <div className="members-shell__header">
            <div className="members-shell__title-wrap">
              <span className="members-shell__icon">▣</span>
              <h2>Family summary</h2>
            </div>
          </div>

          {error ? <div className="members-state members-state--error">{error}</div> : null}

          <div className="stat-grid" style={{ marginTop: '1rem' }}>
            {summaryItems.map((item, index) => (
              <article
                key={item.label}
                className={`stat-card stat-card--${item.accent}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="stat-card__header">
                  <div className="stat-card__icon">{item.label.includes('Dates') ? '◔' : item.label.includes('Events') ? '✦' : item.label.includes('Generations') ? '⌁' : item.label.includes('Branches') ? '⎇' : item.label.includes('Relationships') ? '↔' : '◌'}</div>
                  <span>{item.label}</span>
                </div>

                <div className="stat-card__value" style={{ fontSize: item.muted ? '1.3rem' : undefined }}>
                  {item.muted || item.value === null ? (
                    item.value ?? 'No data recorded'
                  ) : (
                    <AnimatedNumber value={Number(item.value) || 0} delay={index * 180} duration={1200 + index * 180} />
                  )}
                </div>
                <div className="stat-card__meta">{item.muted ? 'No data recorded' : 'Updated recently'}</div>
                <div className="stat-card__chart stat-card__chart--bars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
