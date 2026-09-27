'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useFamilyContext } from '../components/layout/family-context';
import { apiRequest } from '../services/api';
import type { DashboardData, FamilyMember, ParentChildRelationship } from '../types/api';

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

const quickAccessItems = [
  { label: 'Members', href: '/members', icon: '◌', tint: 'sky' },
  { label: 'Relationships', href: '/relationships', icon: '↔', tint: 'violet' },
  { label: 'Family Tree', href: '/family-tree', icon: '⎇', tint: 'emerald' },
  { label: 'Reports', href: '/reports', icon: '▣', tint: 'amber' },
];

export default function HomePage() {
  const { familyId } = useFamilyContext();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<ParentChildRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiRequest<DashboardData>('/dashboard', {}, { familyId }),
      apiRequest<FamilyMember[]>('/family-members', {}, { familyId }),
      apiRequest<ParentChildRelationship[]>('/relationships', {}, { familyId }),
    ])
      .then(([dashboardData, memberData, relationshipData]) => {
        if (!cancelled) {
          setDashboard(dashboardData);
          setMembers(memberData);
          setRelationships(relationshipData);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [familyId]);

  const { maxGeneration, branchCount, recentMembers } = useMemo(() => {
    if (members.length === 0) {
      return { maxGeneration: 0, branchCount: 0, recentMembers: [] };
    }

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

    let maxGen = 1;
    for (const member of members) {
      const depth = getDepth(member.id);
      if (depth > maxGen) maxGen = depth;
    }

    const childIds = new Set(relationships.map((relationship) => relationship.childId));
    const topRoots = members.filter((member) => !childIds.has(member.id));
    let branches = 0;
    if (topRoots.length === 1) {
      const rootChildren = relationships.filter((relationship) => relationship.parentId === topRoots[0].id);
      branches = rootChildren.length > 0 ? rootChildren.length : 1;
    } else {
      branches = topRoots.length;
    }

    const sortedMembers = [...members].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });

    return {
      maxGeneration: maxGen,
      branchCount: branches,
      recentMembers: sortedMembers.slice(0, 5),
    };
  }, [members, relationships]);

  const totalMembersCount = dashboard?.stats.totalMembers ?? (members.length > 0 ? members.length : 0);
  const generationsDisplay = loading ? 0 : maxGeneration > 0 ? maxGeneration : 0;
  const branchesDisplay = loading ? 0 : branchCount > 0 ? branchCount : 0;
  const reportsDisplay = dashboard ? 1 : 0;

  const statCards = [
    { label: 'Family members', value: totalMembersCount, meta: '+12 this year', accent: 'emerald', chart: 'line' },
    { label: 'Generations', value: generationsDisplay, meta: 'No change', accent: 'sky', chart: 'bars' },
    { label: 'Family branches', value: branchesDisplay, meta: 'No change', accent: 'violet', chart: 'bars2' },
    { label: 'Reports ready', value: reportsDisplay, meta: '+1 new', accent: 'amber', chart: 'spark' },
  ];

  const activityRows = (dashboard?.recentEvents && dashboard.recentEvents.length > 0
    ? dashboard.recentEvents
    : recentMembers.map((member) => ({
        id: member.id,
        title: member.fullName ?? 'Unnamed member',
        type: member.status,
        createdAt: member.createdAt,
      }))) as Array<{ id: string; title: string; type: string; createdAt?: string }>; 

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__glow" />

      <div className="dashboard-page__content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__crumbs">
            <span>Family hierarchy</span>
            <span className="separator">/</span>
            <span className="current">Dashboard</span>
          </div>
          <button className="dashboard-topbar__button" type="button">Demo family</button>
        </header>

        <section className="dashboard-hero">
          <p className="dashboard-hero__eyebrow">FAMILY HIERARCHY</p>
          <h1>Family Overview</h1>
          <p>Preserving our family’s history, relationships and legacy for future generations.</p>
        </section>

        <section className="stat-grid" aria-label="Overview statistics">
          {statCards.map((stat, index) => (
            <article
              key={stat.label}
              className={`stat-card stat-card--${stat.accent}`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="stat-card__header">
                <div className="stat-card__icon">{stat.label === 'Family members' ? '👥' : stat.label === 'Generations' ? '⌁' : stat.label === 'Family branches' ? '⎇' : '▣'}</div>
                <span>{stat.label}</span>
              </div>

              <div className="stat-card__value">
                <AnimatedNumber value={Number(stat.value) || 0} delay={index * 220} duration={1400 + index * 180} />
              </div>
              <div className="stat-card__meta">{stat.meta}</div>

              <div className={`stat-card__chart stat-card__chart--${stat.chart}`} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </article>
          ))}
        </section>

        <section className="dashboard-lower-grid">
          <article className="panel panel--activity">
            <div className="panel__header">
              <div className="panel__title-wrap">
                <span className="panel__icon">◔</span>
                <h2>Recent Activity</h2>
              </div>
              <button type="button" className="panel__action">
                View all
              </button>
            </div>

            <div className="activity-list">
              {error ? (
                <div className="activity-empty">{error}</div>
              ) : activityRows.length > 0 ? (
                activityRows.map((item) => (
                  <div key={item.id} className="activity-row">
                    <div className="activity-row__avatar">{item.title.charAt(0).toUpperCase()}</div>
                    <div className="activity-row__details">
                      <div className="activity-row__name">{item.title}</div>
                      {item.createdAt ? (
                        <div className="activity-row__date">
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      ) : null}
                    </div>
                    <span className="activity-row__badge">{item.type}</span>
                    <div className="activity-row__actions">
                      <button type="button" aria-label="View details">
                        ⎋
                      </button>
                      <button type="button" aria-label="Delete entry">
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-empty">No recent family activity yet.</div>
              )}
            </div>
          </article>

          <aside className="panel panel--quick">
            <div className="panel__header">
              <div className="panel__title-wrap">
                <span className="panel__icon panel__icon--warm">✦</span>
                <h2>Quick Access</h2>
              </div>
            </div>

            <div className="quick-grid">
              {quickAccessItems.map((item) => (
                <Link key={item.href} href={item.href} className={`quick-card quick-card--${item.tint}`}>
                  <span className="quick-card__icon">{item.icon}</span>
                  <span className="quick-card__text">{item.label}</span>
                  <span className="quick-card__arrow">→</span>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
