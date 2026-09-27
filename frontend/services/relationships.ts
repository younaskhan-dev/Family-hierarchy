import { apiRequest } from './api';
import type { FamilyMember } from '../types/api';

export async function createParentChildRelationship(payload: Record<string, unknown>): Promise<FamilyMember> {
  return apiRequest<FamilyMember>('/relationships/parent-child', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createMarriage(payload: Record<string, unknown>): Promise<FamilyMember> {
  return apiRequest<FamilyMember>('/relationships/marriages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
