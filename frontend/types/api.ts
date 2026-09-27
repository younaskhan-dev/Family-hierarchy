export type FamilyStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type MemberStatus = 'LIVING' | 'DECEASED' | 'UNKNOWN' | 'ARCHIVED';
export type RelationshipType = 'BIOLOGICAL' | 'ADOPTIVE' | 'STEP' | 'UNKNOWN';
export type MarriageStatus = 'ACTIVE' | 'ENDED' | 'DIVORCED' | 'WIDOWED' | 'UNKNOWN';
export type DatePrecision = 'EXACT' | 'APPROXIMATE' | 'YEAR_ONLY' | 'UNKNOWN';

export interface FamilyMember {
  id: string;
  familyId: string;
  fullName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  birthDatePrecision: DatePrecision;
  birthPlace: string | null;
  dateOfDeath: string | null;
  deathDatePrecision: DatePrecision;
  deathPlace: string | null;
  occupation: string | null;
  education: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  biography: string | null;
  notes: string | null;
  profilePhotoId: string | null;
  status: MemberStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface DashboardData {
  familyId: string;
  familyName: string;
  stats: {
    totalMembers: number;
    livingMembers: number;
    deceasedMembers: number;
    archivedMembers: number;
    totalEvents: number;
    totalImportantDates: number;
    totalMarriages: number;
    totalParentChildRelationships: number;
    totalPhotos: number;
    totalDocuments: number;
  };
  recentEvents: EventItem[];
  upcomingImportantDates: ImportantDate[];
}

export interface SearchResult {
  familyId: string;
  query: string | null;
  totalCount: number;
  members: FamilyMember[];
  events: EventItem[];
  importantDates: ImportantDate[];
}

export interface ReportSummary {
  familyId: string;
  familyName: string;
  generatedAt: string;
  totals: {
    totalMembers: number;
    livingMembers: number;
    deceasedMembers: number;
    totalEvents: number;
    totalImportantDates: number;
    totalMarriages: number;
    totalParentChildRelationships: number;
  };
  recentEvents: EventItem[];
  upcomingImportantDates: ImportantDate[];
}

export interface EventItem {
  id: string;
  familyId: string;
  title: string;
  type: string;
  eventDate: string | null;
  location: string | null;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportantDate {
  id: string;
  familyId: string;
  memberId: string | null;
  title: string;
  date: string | null;
  datePrecision: DatePrecision;
  type: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoItem {
  id: string;
  familyId: string;
  memberId: string | null;
  fileName: string;
  description: string | null;
  storageUrl: string;
  storagePublicId: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  familyId: string;
  memberId: string | null;
  title: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  storageUrl: string;
  description: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyTreeData {
  familyId: string;
  member: FamilyMember;
  parents: Array<FamilyMember & { relationshipType: RelationshipType }>;
  children: Array<FamilyMember & { relationshipType: RelationshipType }>;
  spouses: Array<FamilyMember & { marriageStatus: MarriageStatus; marriageDate: string | null }>;
  siblings: Array<FamilyMember & { relationshipType: RelationshipType }>;
  ancestors: Array<FamilyMember & { depth: number }>;
  descendants: Array<FamilyMember & { depth: number }>;
  totalFamilyMembers: number;
}

export interface ParentChildRelationship {
  id: string;
  familyId: string;
  parentId: string;
  childId: string;
  relationshipType: RelationshipType;
  parent: Pick<FamilyMember, 'id' | 'fullName'>;
  child: Pick<FamilyMember, 'id' | 'fullName'>;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  familyId: string | null;
  timestamp: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}
