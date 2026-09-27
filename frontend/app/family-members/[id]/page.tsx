'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Pencil, UserRound } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { PageHeader } from '../../../components/ui/page-header';
import { useFamilyContext } from '../../../components/layout/family-context';
import { apiRequest } from '../../../services/api';
import type { FamilyMember, ParentChildRelationship, PhotoItem } from '../../../types/api';
import { formatDateTimeValue, formatDateValue, formatDisplayValue, formatEnumValue } from '../../../utils/display';

export default function MemberViewPage() {
  const { id } = useParams<{ id: string }>();
  const { familyId } = useFamilyContext();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [relationships, setRelationships] = useState<ParentChildRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('family-hierarchy-admin-token');
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<FamilyMember>(`/family-members/${id}`),
      apiRequest<ParentChildRelationship[]>('/relationships', {}, { familyId }),
    ]).then(async ([memberData, relationshipData]) => {
      if (!cancelled) { setMember(memberData); setRelationships(relationshipData); }
      if (memberData.profilePhotoId) {
        const photos = await apiRequest<PhotoItem[]>('/media/photos', {}, { familyId });
        const profilePhoto = photos.find((photo) => photo.id === memberData.profilePhotoId);
        if (!cancelled) setPhotoUrl(profilePhoto?.storageUrl ?? null);
      }
    }).catch((loadError) => {
      if (!cancelled) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load this member.';
        setNotFound(message.toLowerCase().includes('not found'));
        setError(message.toLowerCase().includes('not found') ? null : 'Unable to load this member right now.');
      }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [familyId, id]);

  const parents = relationships.filter((relationship) => relationship.childId === id).map((relationship) => relationship.parent.fullName ?? 'Unnamed');
  const children = relationships.filter((relationship) => relationship.parentId === id).map((relationship) => relationship.child.fullName ?? 'Unnamed');

  if (loading) return <DetailState message="Loading member details..." />;
  if (notFound) return <DetailState message="Member not found" />;
  if (error || !member) return <DetailState message={error ?? 'Unable to load this member.'} error />;

  return (
    <>
      <PageHeader
        title={formatDisplayValue(member.fullName)}
        description="Read-only member profile"
        action={<div className="flex gap-2"><Link href="/members"><Button type="button" variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>{adminToken ? <Link href={`/family-members/${member.id}/edit`}><Button type="button"><Pencil className="mr-2 h-4 w-4" />Edit</Button></Link> : null}</div>}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card title="Personal information"><div className="flex items-start gap-4 border-b border-slate-100 pb-5">{photoUrl ? <div className="relative h-16 w-16 overflow-hidden rounded-full"><Image src={photoUrl} alt="Profile" fill className="object-cover" sizes="64px" onError={() => setPhotoUrl(null)} /></div> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500"><UserRound className="h-8 w-8" /></div>}<div><h2 className="text-xl font-semibold text-slate-900">{formatDisplayValue(member.fullName)}</h2><p className="text-sm text-slate-500">{formatEnumValue(member.status)}</p></div></div><DetailGrid fields={[['Full name', member.fullName], ['Gender', member.gender], ['Status', formatEnumValue(member.status)]]} /></Card>
        <Card title="Birth information"><DetailGrid fields={[['Date of birth', formatDateValue(member.dateOfBirth, member.birthDatePrecision)], ['Date precision', formatEnumValue(member.birthDatePrecision)], ['Birth place', member.birthPlace]]} /></Card>
        <Card title="Death information"><DetailGrid fields={[['Date of death', formatDateValue(member.dateOfDeath, member.deathDatePrecision)], ['Date precision', formatEnumValue(member.deathDatePrecision)], ['Death place', member.deathPlace]]} /></Card>
        <Card title="Contact information"><DetailGrid fields={[['Phone', member.phone], ['Email', member.email], ['Address', member.address]]} /></Card>
        <Card title="Professional information"><DetailGrid fields={[['Occupation', member.occupation], ['Education', member.education]]} /></Card>
        <Card title="Relationships"><DetailGrid fields={[['Parents', parents.length ? parents.join(', ') : null], ['Children', children.length ? children.join(', ') : null]]} /></Card>
        <Card title="Biography"><DetailGrid fields={[['Biography', member.biography], ['Notes', member.notes]]} /></Card>
        <Card title="System information"><DetailGrid fields={[['Created at', formatDateTimeValue(member.createdAt)], ['Updated at', formatDateTimeValue(member.updatedAt)], ['Profile photo', photoUrl ? 'Provided' : null]]} /></Card>
      </div>
    </>
  );
}

function DetailGrid({ fields }: { fields: Array<[string, unknown]> }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-900">{formatDisplayValue(value)}</dd></div>)}</dl>;
}

function DetailState({ message, error = false }: { message: string; error?: boolean }) {
  return <div className="space-y-4"><Link href="/members"><Button type="button" variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" />Back to members</Button></Link><Card><p className={error ? 'text-sm text-rose-700' : 'text-sm text-slate-600'}>{message}</p></Card></div>;
}
