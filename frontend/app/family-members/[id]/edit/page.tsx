'use client';

import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { PageHeader } from '../../../../components/ui/page-header';
import { useFamilyContext } from '../../../../components/layout/family-context';
import { apiRequest } from '../../../../services/api';
import type { FamilyMember } from '../../../../types/api';

type EditForm = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  dateOfDeath: string;
  status: 'LIVING' | 'DECEASED' | 'UNKNOWN';
  phone: string;
  email: string;
  address: string;
  occupation: string;
  education: string;
  biography: string;
  notes: string;
};

const emptyForm: EditForm = {
  fullName: '',
  gender: '',
  dateOfBirth: '',
  dateOfDeath: '',
  status: 'UNKNOWN',
  phone: '',
  email: '',
  address: '',
  occupation: '',
  education: '',
  biography: '',
  notes: '',
};

export default function MemberEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { familyId } = useFamilyContext();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [adminToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('family-hierarchy-admin-token');
  });
  const [authReady] = useState(true);

  useEffect(() => {
    apiRequest<FamilyMember>(`/family-members/${id}`).then((data) => {
      setMember(data);
      setForm({
        fullName: data.fullName ?? '',
        gender: data.gender ?? '',
        dateOfBirth: data.dateOfBirth?.slice(0, 10) ?? '',
        dateOfDeath: data.dateOfDeath?.slice(0, 10) ?? '',
        status: data.status === 'ARCHIVED' ? 'UNKNOWN' : data.status,
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        occupation: data.occupation ?? '',
        education: data.education ?? '',
        biography: data.biography ?? '',
        notes: data.notes ?? '',
      });
    }).catch((loadError) => setError(loadError instanceof Error && loadError.message.toLowerCase().includes('not found') ? 'Member not found' : 'Unable to load this member right now.')).finally(() => setLoading(false));
  }, [id]);

  const updateField = (field: keyof EditForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiRequest<FamilyMember>(`/family-members/${id}`, {
        method: 'PUT',
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
          occupation: form.occupation || null,
          education: form.education || null,
          biography: form.biography || null,
          notes: form.notes || null,
        }),
      });
      setSaved(true);
      window.setTimeout(() => router.push(`/family-members/${id}`), 500);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card><p className="text-sm text-slate-600">Loading edit form...</p></Card>;
  if (!authReady) return <Card><p className="text-sm text-slate-600">Checking edit permissions...</p></Card>;
  if (!adminToken) return <div className="space-y-4"><Link href={`/family-members/${id}`}><Button type="button" variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" />Back to member</Button></Link><Card><p className="text-sm text-rose-700">Administrator sign-in is required to edit this member.</p></Card></div>;
  if (error && !member) return <div className="space-y-4"><Link href="/members"><Button type="button" variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" />Back to members</Button></Link><Card><p className="text-sm text-rose-700">{error}</p></Card></div>;

  return <><PageHeader title={`Edit ${member?.fullName ?? 'member'}`} description="Update member information" action={<Link href={`/family-members/${id}`}><Button type="button" variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button></Link>} />{error ? <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}{saved ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Member updated successfully.</p> : null}<form onSubmit={save}><div className="grid gap-6 lg:grid-cols-2"><Card title="Personal information"><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" required value={form.fullName} onChange={(value) => updateField('fullName', value)} /><SelectField label="Gender" value={form.gender} onChange={(value) => updateField('gender', value)} options={['Male', 'Female', 'Other']} /><SelectField label="Status" value={form.status} onChange={(value) => updateField('status', value as EditForm['status'])} options={['LIVING', 'DECEASED', 'UNKNOWN']} /></div></Card><Card title="Birth and death"><div className="grid gap-4 sm:grid-cols-2"><Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => updateField('dateOfBirth', value)} /><Field label="Date of death" type="date" value={form.dateOfDeath} onChange={(value) => updateField('dateOfDeath', value)} /></div></Card><Card title="Contact information"><div className="space-y-4"><Field label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} /><Field label="Email" type="email" value={form.email} onChange={(value) => updateField('email', value)} /><Field label="Address" value={form.address} onChange={(value) => updateField('address', value)} /></div></Card><Card title="Professional information"><div className="space-y-4"><Field label="Occupation" value={form.occupation} onChange={(value) => updateField('occupation', value)} /><Field label="Education" value={form.education} onChange={(value) => updateField('education', value)} /></div></Card><Card title="Biography and notes"><div className="space-y-4"><TextAreaField label="Biography" value={form.biography} onChange={(value) => updateField('biography', value)} /><TextAreaField label="Notes" value={form.notes} onChange={(value) => updateField('notes', value)} /></div></Card></div><div className="mt-6 flex justify-end"><Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save changes'}</Button></div></form></>;
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block text-sm font-medium text-slate-700">{label}{required ? ' *' : ''}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-sky-500" /></label>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="block text-sm font-medium text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-sky-500"><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm font-medium text-slate-700">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-sky-500" /></label>; }
