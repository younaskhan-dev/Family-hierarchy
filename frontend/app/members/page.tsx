'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, Pencil, Trash2, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { useFamilyContext } from '../../components/layout/family-context';
import { apiRequest } from '../../services/api';
import type { FamilyMember } from '../../types/api';

type MemberForm = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  dateOfDeath: string;
  status: 'LIVING' | 'DECEASED' | 'UNKNOWN';
  phone: string;
  email: string;
  address: string;
  biography: string;
  notes: string;
  parentId: string;
};

type LoginForm = {
  email: string;
  password: string;
};

const emptyForm: MemberForm = {
  fullName: '',
  gender: 'Male',
  dateOfBirth: '',
  dateOfDeath: '',
  status: 'LIVING',
  phone: '',
  email: '',
  address: '',
  biography: '',
  notes: '',
  parentId: '',
};

export default function MembersPage() {
  const router = useRouter();
  const { familyId } = useFamilyContext();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<'name' | 'status'>('name');
  const [sortAscending, setSortAscending] = useState(true);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('family-hierarchy-admin-token');
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const pageSize = 20;

  useEffect(() => {
    let cancelled = false;
    apiRequest<FamilyMember[]>('/family-members', {}, { familyId })
      .then((data) => { if (!cancelled) setMembers(data); })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load members.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [familyId]);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = members.filter((member) => {
      const nameMatches = !normalizedQuery || (member.fullName ?? '').toLowerCase().includes(normalizedQuery);
      const reviewStatus = member.notes?.includes('requires verification') || member.fullName === '[Name missing]' ? 'NEEDS_REVIEW' : 'RECORDED';
      const statusMatches = statusFilter === 'ALL' || statusFilter === member.status || statusFilter === reviewStatus;
      return nameMatches && statusMatches;
    });
    return filtered.sort((left, right) => {
      const leftValue = sortKey === 'name' ? (left.fullName ?? '') : left.status;
      const rightValue = sortKey === 'name' ? (right.fullName ?? '') : right.status;
      return leftValue.localeCompare(rightValue) * (sortAscending ? 1 : -1);
    });
  }, [members, query, sortAscending, sortKey, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const updateField = (field: keyof MemberForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setCurrentPage(1);
  };

  const updateStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const updateSort = (nextKey: 'name' | 'status') => {
    if (sortKey === nextKey) setSortAscending((value) => !value);
    else { setSortKey(nextKey); setSortAscending(true); }
  };

  const requestAdmin = (action: () => void) => {
    if (adminToken) action();
    else { setPendingAction(() => action); setLoginError(null); setLoginOpen(true); }
  };

  const openForm = (member?: FamilyMember) => {
    setError(null);
    setEditingMemberId(member?.id ?? null);
    setForm(member ? {
      fullName: member.fullName ?? '', gender: member.gender ?? 'Male',
      dateOfBirth: member.dateOfBirth?.slice(0, 10) ?? '', dateOfDeath: member.dateOfDeath?.slice(0, 10) ?? '', status: member.status === 'ARCHIVED' ? 'UNKNOWN' : member.status,
      phone: member.phone ?? '', email: member.email ?? '', address: member.address ?? '', biography: member.biography ?? '', notes: member.notes ?? '',
      parentId: '',
    } : emptyForm);
    setFormOpen(true);
  };

  const authenticate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    try {
      const result = await apiRequest<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(loginForm) });
      window.localStorage.setItem('family-hierarchy-admin-token', result.token);
      setAdminToken(result.token);
      setLoginOpen(false);
      setLoginForm({ email: '', password: '' });
      pendingAction?.();
      setPendingAction(null);
    } catch (authError) {
      setLoginError(authError instanceof Error ? authError.message : 'Invalid administrator credentials.');
    }
  };

  const closeForm = () => {
    if (!saving) setFormOpen(false);
  };

  const saveMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = await apiRequest<FamilyMember>(editingMemberId ? `/family-members/${editingMemberId}` : '/family-members', {
        method: editingMemberId ? 'PUT' : 'POST',
        body: JSON.stringify({
          familyId,
          ...form,
          fullName: form.fullName.trim(),
          dateOfBirth: form.dateOfBirth || null,
          dateOfDeath: form.dateOfDeath || null,
          gender: form.gender || null,
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
          biography: form.biography || null,
          notes: form.notes || null,
        }),
      });
      if (!editingMemberId && form.parentId) {
        await apiRequest('/relationships/parent-child', { method: 'POST', body: JSON.stringify({ familyId, parentId: form.parentId, childId: saved.id, relationshipType: 'BIOLOGICAL' }) });
      }
      setMembers((current) => editingMemberId ? current.map((member) => member.id === editingMemberId ? saved : member) : [saved, ...current]);
      setFormOpen(false);
      setForm(emptyForm);
      setEditingMemberId(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this family member.');
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (memberId: string) => {
    if (!window.confirm('Permanently delete this family member and its relationships?')) return;
    try {
      await apiRequest<FamilyMember>(`/family-members/${memberId}`, { method: 'DELETE', body: JSON.stringify({}) });
      setMembers((current) => current.filter((member) => member.id !== memberId));
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to delete this member.');
    }
  };

  return (
    <div className="members-page">
      <div className="dashboard-page__glow" />

      <div className="dashboard-page__content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__crumbs">
            <span>Family hierarchy</span>
            <span className="separator">/</span>
            <span className="current">Members</span>
          </div>
          <Button type="button" onClick={() => requestAdmin(() => openForm())} className="dashboard-topbar__button">
            Add member
          </Button>
        </header>

        <section className="dashboard-hero members-hero">
          <p className="dashboard-hero__eyebrow">FAMILY HIERARCHY</p>
          <h1>Family Members</h1>
          <p>Manage the people in your family registry.</p>
        </section>

        {loginOpen ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={authenticate} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-semibold text-slate-900">Administrator sign-in</h2><p className="mt-1 text-sm text-slate-600">Sign in to add, edit, or delete family records.</p><div className="mt-5 space-y-4"><Field label="Email" type="email" required value={loginForm.email} onChange={(value) => setLoginForm((current) => ({ ...current, email: value }))} /><Field label="Password" type="password" required value={loginForm.password} onChange={(value) => setLoginForm((current) => ({ ...current, password: value }))} /></div>{loginError ? <p className="mt-3 text-sm text-rose-700">{loginError}</p> : null}<div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setLoginOpen(false)}>Cancel</Button><Button type="submit">Sign in</Button></div></form></div> : null}

        {formOpen ? (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="add-member-title">
            <form onSubmit={saveMember} className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 id="add-member-title" className="text-lg font-semibold text-slate-900">{editingMemberId ? 'Edit family member' : 'Add family member'}</h2>
                  <p className="mt-1 text-sm text-slate-600">Enter the details you know. Unknown fields can be completed later.</p>
                </div>
                <button type="button" onClick={closeForm} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close form">&times;</button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required value={form.fullName} onChange={(value) => updateField('fullName', value)} />
                <label className="block text-sm font-medium text-slate-700">Gender<select value={form.gender} onChange={(event) => updateField('gender', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-sky-500"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="">Not recorded</option></select></label>
                {!editingMemberId ? <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Parent<select required value={form.parentId} onChange={(event) => updateField('parentId', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-sky-500"><option value="">Select this member&apos;s parent</option>{members.filter((member) => member.status !== 'ARCHIVED').map((member) => <option key={member.id} value={member.id}>{member.fullName ?? 'Unnamed'}</option>)}</select></label> : null}
                <Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => updateField('dateOfBirth', value)} />
                <Field label="Date of death" type="date" value={form.dateOfDeath} onChange={(value) => updateField('dateOfDeath', value)} />
                <label className="block text-sm font-medium text-slate-700">Status<select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-sky-500"><option value="LIVING">Living</option><option value="DECEASED">Deceased</option><option value="UNKNOWN">Unknown</option></select></label>
                <Field label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} />
                <Field label="Email" type="email" value={form.email} onChange={(value) => updateField('email', value)} />
                <div className="sm:col-span-2"><Field label="Address" value={form.address} onChange={(value) => updateField('address', value)} /></div>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Biography<textarea value={form.biography} onChange={(event) => updateField('biography', event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-sky-500" /></label>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Notes<textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-sky-500" /></label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4"><Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save member'}</Button></div>
            </form>
          </div>
        ) : null}

        <section className="members-shell">
          <div className="members-shell__header">
            <div className="members-shell__title-wrap">
              <span className="members-shell__icon">👥</span>
              <h2>Members</h2>
            </div>
            <div className="members-shell__meta">{filteredMembers.length} of {members.length} members</div>
          </div>

          <div className="members-toolbar">
            <input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Filter by name" className="members-filter" />
            <select value={statusFilter} onChange={(event) => updateStatusFilter(event.target.value)} className="members-select">
              <option value="ALL">All records</option><option value="LIVING">Living</option><option value="DECEASED">Deceased</option>
            </select>
          </div>

          {loading ? <p className="members-state">Loading members...</p> : null}
          {error ? <p className="members-state members-state--error">{error}</p> : null}

          <div className="member-table-wrap">
            <table className="member-table">
              <thead>
                <tr>
                  <th className="member-th"><SortButton label="Name" active={sortKey === 'name'} ascending={sortAscending} onClick={() => updateSort('name')} /></th>
                  <th className="member-th member-th--compact">Gender</th>
                  <th className="member-th member-th--compact"><SortButton label="Status" active={sortKey === 'status'} ascending={sortAscending} onClick={() => updateSort('status')} /></th>
                  <th className="member-th member-th--action">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredMembers.length === 0 ? <tr><td className="member-empty" colSpan={4}><div className="member-empty__title">No members found</div><div className="member-empty__subtitle">Try a different name or filter.</div></td></tr> : null}
                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="member-row">
                    <td className="member-cell member-cell--name">{member.fullName ?? 'Unnamed'}</td>
                    <td className="member-cell member-cell--compact"><span className="member-gender" title={member.gender ?? 'Male'}><UserRound className="h-4 w-4" aria-hidden="true" /></span></td>
                    <td className="member-cell member-cell--compact"><StatusBadge status={member.status} /></td>
                    <td className="member-cell member-cell--action"><div className="member-actions"><IconButton label="View member" onClick={() => router.push(`/family-members/${member.id}`)}><Eye /></IconButton>{adminToken ? <IconButton label="Edit member" onClick={() => requestAdmin(() => router.push(`/family-members/${member.id}/edit`))}><Pencil /></IconButton> : null}<IconButton label="Delete member permanently" onClick={() => requestAdmin(() => { void deleteMember(member.id); })}><Trash2 /></IconButton></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length > 0 ? (
            <div className="member-footer">
              <span>Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredMembers.length)} of {filteredMembers.length}</span>
              <div className="member-footer__actions">
                <Button type="button" variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>Previous</Button>
                <span className="member-footer__page">Page {currentPage} of {totalPages}</span>
                <Button type="button" variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{required ? ' *' : ''}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-sky-500" /></label>;
}

function StatusBadge({ status }: { status: FamilyMember['status'] }) {
  const styles = status === 'LIVING' ? 'bg-emerald-100 text-emerald-800' : status === 'DECEASED' ? 'bg-slate-200 text-slate-700' : status === 'ARCHIVED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{status}</span>;
}

function SortButton({ label, active, ascending, onClick }: { label: string; active: boolean; ascending: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-sky-700">{label}{active ? (ascending ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />) : null}</button>;
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-sky-700 active:scale-95">{children && <span className="block h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{children}</span>}</button>;
}
