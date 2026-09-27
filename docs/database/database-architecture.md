# Database Architecture

## 1. Overview

This database design follows a normalized relational model for a multi-family genealogy system. The system supports many families, multiple users, and historical lineage preservation without storing the tree as a single JSON document.

The core source of truth is:

1. `Family`
2. `FamilyMember`
3. `ParentChildRelationship`
4. `Marriage`

Derived structures such as ancestor paths, descendants, siblings, generation, and branch groupings are calculated dynamically from the relationship graph rather than stored as redundant database columns.

---

## 2. Final architectural principles

- A user may have access to one or more families through `UserFamilyAccess`.
- A family may contain many members.
- A member belongs to one family.
- Parent-child and marriage history are stored in separate relational tables.
- Archived members remain part of the historical genealogy graph.
- Active family views may optionally hide archived members, but historical/full-tree views should include them.
- Hard deletion is rare and restricted to administrators or controlled cleanup workflows.
- Binary documents and photos are stored outside PostgreSQL and referenced by URL/path metadata.
- Audit records remain append-only and protected from normal user modification.

---

## 3. Cardinality summary

### Family
- `Family` 1:N `FamilyMember`
- `Family` 1:N `ParentChildRelationship`
- `Family` 1:N `Marriage`
- `Family` 1:N `Photo`
- `Family` 1:N `Document`
- `Family` 1:N `ImportantDate`
- `Family` 1:N `Event`
- `Family` 1:N `AuditLog`
- `Family` 1:N `UserFamilyAccess`

### FamilyMember
- `FamilyMember` 1:N `ParentChildRelationship` as `parentId`
- `FamilyMember` 1:N `ParentChildRelationship` as `childId`
- `FamilyMember` 1:N `Marriage` as `person1Id`
- `FamilyMember` 1:N `Marriage` as `person2Id`
- `FamilyMember` 1:N `Photo` (optional)
- `FamilyMember` 1:N `Document` (optional)
- `FamilyMember` 1:N `ImportantDate` (optional)
- `FamilyMember` 1:N `EventParticipant` (optional, if attendance tracking is introduced)

### User and access model
- `User` N:N `Family` through `UserFamilyAccess`
- `User` N:N `Role` through `UserRole`
- `Role` N:N `Permission` through `RolePermission`

---

## 4. Entity catalog

### Family
Represents a genealogy tree or family unit.

Fields:
- `id` UUID PRIMARY KEY
- `name` VARCHAR(150) NOT NULL
- `description` TEXT NULL
- `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updatedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `createdBy` UUID NULL
- `updatedBy` UUID NULL

Indexes:
- `idx_family_name`
- `idx_family_status`

Notes:
- `status` allows future active/inactive states without changing the schema.

---

### FamilyMember
Represents a person in a family.

Fields:
- `id` UUID PRIMARY KEY
- `familyId` UUID NOT NULL FK -> `Family.id`
- `firstName` VARCHAR(100) NULL
- `middleName` VARCHAR(100) NULL
- `lastName` VARCHAR(100) NULL
- `displayName` VARCHAR(200) NULL
- `gender` VARCHAR(20) NULL
- `dateOfBirth` DATE NULL
- `birthDatePrecision` VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN'
- `birthPlace` TEXT NULL
- `dateOfDeath` DATE NULL
- `deathDatePrecision` VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN'
- `deathPlace` TEXT NULL
- `occupation` VARCHAR(200) NULL
- `education` TEXT NULL
- `phone` VARCHAR(50) NULL
- `email` VARCHAR(255) NULL
- `address` TEXT NULL
- `biography` TEXT NULL
- `notes` TEXT NULL
- `profilePhotoId` UUID NULL
- `status` VARCHAR(30) NOT NULL DEFAULT 'LIVING'
- `isArchived` BOOLEAN NOT NULL DEFAULT false
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updatedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `createdBy` UUID NULL
- `updatedBy` UUID NULL

Allowed values:
- `birthDatePrecision`, `deathDatePrecision`, `marriageDatePrecision`, `eventDatePrecision`, `importantDatePrecision`: `EXACT`, `APPROXIMATE`, `YEAR_ONLY`, `UNKNOWN`
- `status`: `LIVING`, `DECEASED`, `UNKNOWN`, `ARCHIVED`

Rules:
- `displayName` may be generated when absent.
- `phone`, `email`, and `address` are sensitive and must be protected by role-based authorization.
- `profilePhotoId` is a reference to a media item and should not duplicate binary data.

Indexes:
- `idx_family_member_family_id`
- `idx_family_member_status`
- `idx_family_member_display_name`
- `idx_family_member_birth_date`
- `idx_family_member_death_date`
- `idx_family_member_name_search`

Unique constraints:
- No universal unique constraint on names because the same names can legitimately repeat across a family.
- Import-key uniqueness may be added later if a canonical external source or deduplication strategy is introduced.

---

### ParentChildRelationship
Represents parent-child lineage.

Fields:
- `id` UUID PRIMARY KEY
- `familyId` UUID NOT NULL FK -> `Family.id`
- `parentId` UUID NOT NULL FK -> `FamilyMember.id`
- `childId` UUID NOT NULL FK -> `FamilyMember.id`
- `relationshipType` VARCHAR(20) NOT NULL DEFAULT 'BIOLOGICAL'
- `notes` TEXT NULL
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `createdBy` UUID NULL

Allowed values:
- `BIOLOGICAL`
- `ADOPTIVE`
- `STEP`
- `UNKNOWN`

Constraints:
- `parentId <> childId`
- `UNIQUE (familyId, parentId, childId, relationshipType)`
- `CHECK (relationshipType IN (...))`

Indexes:
- `idx_parent_child_family_id`
- `idx_parent_child_parent_id`
- `idx_parent_child_child_id`

Notes:
- This is the normalized graph that drives ancestors, descendants, and sibling calculations.
- Multiple children are supported naturally.
- Two biological parents are supported by two rows with different parentId values.
- Step/adoptive relationships remain supported without extra redundant columns.

---

### Marriage
Represents spouse/marriage records.

Fields:
- `id` UUID PRIMARY KEY
- `familyId` UUID NOT NULL FK -> `Family.id`
- `person1Id` UUID NOT NULL FK -> `FamilyMember.id`
- `person2Id` UUID NOT NULL FK -> `FamilyMember.id`
- `marriageDate` DATE NULL
- `marriageDatePrecision` VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN'
- `marriagePlace` TEXT NULL
- `endDate` DATE NULL
- `endDatePrecision` VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN'
- `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
- `notes` TEXT NULL
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updatedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `createdBy` UUID NULL
- `updatedBy` UUID NULL

Allowed values:
- `ACTIVE`
- `ENDED`
- `DIVORCED`
- `WIDOWED`
- `UNKNOWN`

Constraints:
- `person1Id <> person2Id`
- `CHECK (status IN (...))`

Indexes:
- `idx_marriage_family_id`
- `idx_marriage_person1_id`
- `idx_marriage_person2_id`
- `idx_marriage_status`

Notes:
- Multiple marriages are explicitly supported.
- The system does not impose a one-spouse-only constraint.
- A canonical pair function may be used in service validation to prevent accidental duplicates, but the data model itself is intentionally flexible.

---

### Photo
Represents family or member media references.

Fields:
- `id` UUID PRIMARY KEY
- `familyId` UUID NOT NULL FK -> `Family.id`
- `memberId` UUID NULL FK -> `FamilyMember.id`
- `fileName` VARCHAR(255) NOT NULL
- `description` TEXT NULL
- `storageUrl` TEXT NOT NULL
- `storagePublicId` VARCHAR(255) NULL
- `uploadedBy` UUID NULL
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updatedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Rules:
- Actual file bytes remain external to PostgreSQL.
- Storage provider can be later abstracted behind a service interface.

Indexes:
- `idx_photo_family_id`
- `idx_photo_member_id`

---

### Document
Represents family or member documents.

Fields:
- `id` UUID PRIMARY KEY
- `familyId` UUID NOT NULL FK -> `Family.id`
- `memberId` UUID NULL FK -> `FamilyMember.id`
- `title` VARCHAR(200) NOT NULL
- `fileName` VARCHAR(255) NOT NULL
- `fileType` VARCHAR(100) NULL
- `fileSize` BIGINT NULL
- `storageUrl` TEXT NOT NULL
- `description` TEXT NULL
- `uploadedBy` UUID NULL
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updatedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Rules:
- Binary content is not stored in PostgreSQL.
- Storage should be provider-agnostic by design.

Indexes:
- `idx_document_family_id`
- `idx_document_member_id`

---

### ImportantDate
Represents custom or family-significant dates.

Fields:
- `id` UUID PRIMARY KEY
- `familyId` UUID NOT NULL FK -> `Family.id`
- `memberId` UUID NULL FK -> `FamilyMember.id`
- `title` VARCHAR(200) NOT NULL
- `date` DATE NULL
- `datePrecision` VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN'
- `type` VARCHAR(30) NOT NULL
- `notes` TEXT NULL
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updatedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Allowed values:
- `BIRTHDAY`
- `WEDDING_ANNIVERSARY`
- `DEATH_ANNIVERSARY`
- `CUSTOM`

Notes:
- Birthdays and anniversaries may be derived from canonical data, but a compact dedicated table is still useful for reminders and custom historical dates.
- The model avoids redundant birth-date duplication by allowing `memberId`-scoped dates only when needed.

Indexes:
- `idx_important_date_family_id`
- `idx_important_date_member_id`
- `idx_important_date_type`
- `idx_important_date_date`

---

### Event
Represents a family event.

Fields:
- `id` UUID PRIMARY KEY
- `familyId` UUID NOT NULL FK -> `Family.id`
- `title` VARCHAR(200) NOT NULL
- `type` VARCHAR(50) NOT NULL
- `eventDate` TIMESTAMPTZ NULL
- `location` TEXT NULL
- `description` TEXT NULL
- `createdBy` UUID NULL
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updatedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Optional participants may later be supported through `EventParticipant` if attendance tracking becomes required.

Indexes:
- `idx_event_family_id`
- `idx_event_date`
- `idx_event_type`

---

### User
Represents an authenticated application user.

Fields:
- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) NOT NULL UNIQUE
- `passwordHash` TEXT NOT NULL
- `fullName` VARCHAR(200) NOT NULL
- `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updatedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

---

### Role
Represents a role definition.

Fields:
- `id` UUID PRIMARY KEY
- `name` VARCHAR(60) NOT NULL UNIQUE
- `description` TEXT NULL
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Suggested roles:
- `ADMIN`
- `FAMILY_MANAGER`
- `FAMILY_MEMBER`

---

### Permission
Represents an allowed action.

Fields:
- `id` UUID PRIMARY KEY
- `name` VARCHAR(100) NOT NULL UNIQUE
- `description` TEXT NULL

---

### UserRole
Junction table connecting users to roles.

Fields:
- `userId` UUID NOT NULL FK -> `User.id`
- `roleId` UUID NOT NULL FK -> `Role.id`
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Primary key:
- `(userId, roleId)`

---

### RolePermission
Junction table connecting roles to permissions.

Fields:
- `roleId` UUID NOT NULL FK -> `Role.id`
- `permissionId` UUID NOT NULL FK -> `Permission.id`
- `createdAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Primary key:
- `(roleId, permissionId)`

---

### UserFamilyAccess
Bridge table connecting users to the families they can access.

Fields:
- `id` UUID PRIMARY KEY
- `userId` UUID NOT NULL FK -> `User.id`
- `familyId` UUID NOT NULL FK -> `Family.id`
- `roleId` UUID NULL FK -> `Role.id`
- `grantedAt` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Notes:
- This is a deliberate design choice to support multi-family access.
- A user may have one or more access rows to different families.
- `roleId` may be set to a family-specific role context, or the system may derive access from `UserRole` and policy rules.

Indexes:
- `idx_user_family_access_user_id`
- `idx_user_family_access_family_id`
- `idx_user_family_access_role_id`

---

### AuditLog
Append-only record of system events.

Fields:
- `id` UUID PRIMARY KEY
- `userId` UUID NULL FK -> `User.id`
- `action` VARCHAR(80) NOT NULL
- `entityType` VARCHAR(100) NOT NULL
- `entityId` UUID NULL
- `familyId` UUID NULL FK -> `Family.id`
- `timestamp` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `oldValues` JSONB NULL
- `newValues` JSONB NULL
- `metadata` JSONB NULL

Rules:
- Audit records are append-only.
- Normal users do not modify them.
- Sensitive fields should not be stored unless absolutely necessary.

Indexes:
- `idx_audit_log_family_id`
- `idx_audit_log_user_id`
- `idx_audit_log_entity_type`
- `idx_audit_log_timestamp`

---

## 5. Delete and archive policy by entity

### Family
- Prefer archive of the family rather than hard delete if the family is no longer active.
- Hard delete should be administrative and rare.
- `RESTRICT` is safer than `CASCADE` for family deletion because family records carry deep historical meaning.

### FamilyMember
- Preferred behavior: mark as `ARCHIVED` and set `isArchived = true`.
- Archived members remain in the genealogy graph for historical continuity.
- Active-family views may filter them out.
- Hard deletion should require admin approval and should be blocked if lineage or audit data would be lost.

### ParentChildRelationship
- Prefer logical removal by setting status or marking as inactive if a future requirement exists.
- Basic row delete is acceptable when the relationship is truly invalidated.
- `ON DELETE CASCADE` is acceptable for relationship rows tied to a family or member delete, but not as an automatic blanket rule for all relationship history.

### Marriage
- Delete row only when the relationship is truly invalid, not merely because it is historical.
- Historical marriage records should remain as family history.
- `ON DELETE CASCADE` is acceptable when the parent family or member is deleted, but not for normal archiving flows.

### Photo
- Delete from storage provider and remove metadata row.
- `ON DELETE CASCADE` is acceptable when the parent family or member is removed.
- Do not use blanket `CASCADE` for all media if there is a need to preserve historical asset records.

### Document
- Prefer soft retention or administrative delete.
- `ON DELETE CASCADE` is acceptable when parent family/member rows are removed.
- Actual file removal belongs in the storage layer, not database-only relation cleanup.

### ImportantDate
- Historical dates should remain unless intentionally removed by an admin.
- Use `RESTRICT` or checked deletion depending on system policy.

### Event
- Events can be archived or soft deleted rather than destroyed if they hold historical significance.
- `ON DELETE RESTRICT` is a safe default if the event is part of a public or historical record.

### User
- Prefer `RESTRICT` when a user owns family access, contributions, or audit history.
- Do not allow direct deletion if it would orphan important records or compromise audit integrity.
- A user may be deactivated instead of removed.

### Role
- `RESTRICT` should be used if any `UserRole` or `RolePermission` records exist.
- Do not blindly cascade role removal because access rules may be active.

### Permission
- `RESTRICT` is safer when already assigned to roles.
- Permit admin controlled cleanup only when no active link remains.

### UserFamilyAccess
- This table should usually be deleted with `ON DELETE CASCADE` when the user or family is removed.
- It is a join-table relationship and should not be used as a historical record when the access grant itself is important.

### AuditLog
- `RESTRICT` or no deletion at all.
- Audit records are append-only and critical to accountability.

---

## 6. Indexing strategy

The design intentionally avoids indexing every column. Instead it focuses on the usage patterns that matter most.

Required indexes:
- `idx_family_member_family_id`
- `idx_family_member_display_name`
- `idx_family_member_name_search`
- `idx_parent_child_parent_id`
- `idx_parent_child_child_id`
- `idx_parent_child_family_id`
- `idx_marriage_person1_id`
- `idx_marriage_person2_id`
- `idx_marriage_family_id`
- `idx_event_family_id`
- `idx_event_date`
- `idx_important_date_family_id`
- `idx_important_date_member_id`
- `idx_important_date_date`
- `idx_audit_log_family_id`
- `idx_audit_log_user_id`
- `idx_audit_log_timestamp`
- `idx_user_family_access_user_id`
- `idx_user_family_access_family_id`

This supports:
- member lookup by family
- member name search
- parent-child traversal
- child-parent traversal
- marriage traversal
- event and important-date queries
- audit log analysis
- user-family access lookups

---

## 7. Circular ancestry handling

### Relational integrity
PostgreSQL foreign keys ensure a relationship refers to an existing member, but they do not detect graph cycles.

### Duplicate prevention
- `UNIQUE (familyId, parentId, childId, relationshipType)` prevents duplicate parent-child rows.
- `CHECK (parentId <> childId)` prevents self-parent/self-child creation.

### Graph-cycle detection
Cycle detection belongs primarily in the application/service layer, with optional database-side validation triggers if the project later adopts stricter operational guarantees.

Recommended validation:
- reject inserts where `parentId = childId`
- reject inserts that create a path from child back to parent in the same family
- validate ancestor/descendant traversal before final commit
- apply the same logic in import utilities and bulk data updates

This is a graph problem, not just a row-level constraint problem.

---

## 8. Generations and branches

### Generation
Generation is derived from the relationship graph and should not be stored as a permanent integer column on `FamilyMember` unless a strong future requirement emerges.

Rationale:
- generation is context-dependent
- ancestral depth changes with the selected member
- the same person can be a parent, grandparent, or cousin depending on the tree query

### Ancestors and descendants
These should be calculated using recursive CTEs or service-layer traversal.

### Siblings, cousins, and branches
These are also derived from normalized relationships and should be computed dynamically.

### Branches
A persistent branch entity is not required unless there is a strong business reason. Branch views can be derived from descendants and relationship paths dynamically.

### Tree coordinates
No permanent coordinate system or nested JSON tree should be stored as canonical domain data.

---

## 9. Future generations and import/export compatibility

### Future generations
Adding a new child, grandchild, or great-grandchild does not require a schema change, because the model is relationship-based and the tree expands through rows in the canonical relationship tables.

### Import/export
The model can preserve enough information to reconstruct:
- people
- family membership
- parent-child relationships
- marriage history
- media and document references
- important dates and events

During export, the app should serialize the canonical relation rows, not a single tree JSON blob.

---

## 10. Privacy and authorization

Sensitive values include:
- phone
- email
- address
- private notes
- legal documents
- protected media metadata

These must be protected by authorisation rules in service and API layers; frontend-only filtering is insufficient.

---

## 11. Final review and remaining concerns

This architecture is consistent with the final decisions:
- multi-family support through `UserFamilyAccess`
- archive-safe genealogy preservation
- relationship-first normalized design
- no permanent redundant relationship columns
- no permanent generation or branch storage
- no blanket `CASCADE` strategy

### REQUIRES REVIEW
- Whether archived members should appear in all historical queries by default or only in explicit historical/full-tree views.
- Whether `UserFamilyAccess` should carry role context per family or rely only on inherited `UserRole` policy in the application layer.
- Whether identity merge workflows require a dedicated historical identity table for imported or deduplicated records.

---

## 12. Summary

The final model is a normalized, multi-family genealogical database in which families, people, lineage, marriage history, media, events, access, and audit records all have clear responsibilities. The canonical relationship tables remain the source of truth, while derived family-tree features are computed as needed. This avoids redundant data, preserves historical lineage, and supports future growth without schema redesign.
