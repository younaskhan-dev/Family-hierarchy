import { apiRequest } from './api';
import type { FamilyMember } from '../types/api';

export async function fetchMembers(familyId: string): Promise<FamilyMember[]> {
  return apiRequest<FamilyMember[]>('/family-members', {}, { familyId });
}

export async function fetchMemberById(memberId: string): Promise<FamilyMember> {
  return apiRequest<FamilyMember>(`/family-members/${memberId}`);
}

export async function createMember(payload: Record<string, unknown>): Promise<FamilyMember> {
  return apiRequest<FamilyMember>('/family-members', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateMember(memberId: string, payload: Record<string, unknown>): Promise<FamilyMember> {
  return apiRequest<FamilyMember>(`/family-members/${memberId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function archiveMember(memberId: string): Promise<FamilyMember> {
  return apiRequest<FamilyMember>(`/family-members/${memberId}`, {
    method: 'DELETE',
    body: JSON.stringify({ updatedBy: 'frontend-admin' }),
  });
}
