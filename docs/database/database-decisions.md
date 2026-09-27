# Database Decisions

## 1. Why the system uses explicit relationship tables

The family tree is a graph. The primary sources of truth are:
- `Family`
- `FamilyMember`
- `ParentChildRelationship`
- `Marriage`

This keeps the model normalized, prevents redundant fields like `fatherId`, `motherId`, or `grandparentId`, and supports graph traversal for ancestor, descendant, sibling, and cousin logic.

The system intentionally stores relationships as data, not as a nested JSON structure.

---

## 2. Why `UserFamilyAccess` is required

The project is designed for multiple families. A user may need access to more than one family, and each family may contain different permissions and roles.

`UserFamilyAccess` enforces the correct model:
- `User` N:N `Family`
- `User` N:N `Role`
- `Role` N:N `Permission`

This keeps access rules family-scoped and scalable for future permission expansion.

---

## 3. Why archive is preferred over hard delete

Genealogy is historical. A member may need to remain in the graph even if they are no longer active in the present-day family record.

Archive semantics preserve:
- historical relationship continuity
- ancestor/descendant visibility in full-tree views
- family history integrity
- audit continuity

Hard deletion is reserved for controlled administrator flows and should be rare.

---

## 4. Why archived members remain in the genealogy graph

This is a deliberate decision to protect historical lineage. Archival does not mean removal from the graph; it means removal from the current active view when necessary.

Example:
- archived grandfather still connects to father and uncle
- historical branches remain visible in full-tree or historical reports
- active views may filter them out by default

---

## 5. Why generation and branches are derived

Generation is context-sensitive and depends on the selected person and traversal direction. Similarly, branches are logical partitions of the graph and should be recalculated instead of stored as permanent domain data.

This avoids:
- drift between relationship data and derived values
- duplicate source-of-truth fields
- schema churn when the graph changes

---

## 6. Why the tree is not stored as JSON

A nested JSON tree is difficult to validate, query, export, and maintain across generations. A normalized relational model allows:

- strong integrity enforcement
- recursive tree queries
- indexing for search and traversal
- cleaner import/export of canonical relationships
- easier reporting and future scaling

---

## 7. Why multiple marriages are supported

A person may have multiple marriages across a lifespan. A genealogy database must be able to represent:
- active marriages
- ended marriages
- divorced relationships
- widowed relationships
- unknown or historical statuses

A one-spouse-only constraint would be an unrealistic business restriction for a historical genealogy system.

---

## 8. Why parent-child rows are separate from family members

This is the normalized mechanism for lineage. Parent-child rows are not redundant columns; they are the real graph edges.

This allows the system to support:
- multiple children
- two biological parents
- adoptive parents
- step-parents
- unknown parent relationship types
- historical lineage without repeated denormalized columns

---

## 9. Why no blanket `CASCADE` strategy is used

A blanket cascade policy would destroy genealogy history too easily. Historical relationships, family data, and audit records may be important beyond the current active record.

The safer patterns are:
- `RESTRICT` for critical historical and audit tables
- controlled admin deletion for family/person cleanup
- `CASCADE` only in limited relation tables such as access joins or family-owned child records

---

## 10. Why external storage is used for photos and documents

Large file binaries should not live in PostgreSQL. The database should keep metadata and references only, with actual file content stored in a service such as Cloudinary or S3.

This preserves scalability and allows storage backend changes without a database schema redesign.

---

## 11. Why access and permissions are separated

The project expects future access scaling. Separating:
- `User`
- `Role`
- `Permission`
- `UserRole`
- `RolePermission`
- `UserFamilyAccess`

creates a flexible and reviewable authorization model without hard-coding family data into the user table.

---

## 12. Why audit logs are append-only

Audit logs are evidence and accountability records. They must remain intact and protected from normal edits.

This supports:
- change review
- import validation
- conflict resolution
- historical tracking

---

## 13. Final unresolved items

### REQUIRES REVIEW: historical view policy for archived members
The exact default behavior for historical/full-tree queries should be confirmed:
- Should archived members appear in all tree queries by default?
- Or should only explicit historical views include them?

### REQUIRES REVIEW: `UserFamilyAccess.roleId` semantics
This can be treated as a family-scoped role context, but the final implementation may alternatively derive access purely from `UserRole` plus family-level policy rules.

### REQUIRES REVIEW: imported identity merge workflows
If import and deduplication workflows later need historical identity merging, a dedicated identity-resolution table may become necessary.

### REQUIRES REVIEW: event participant records
Participation tracking is not required at this stage, but a dedicated `EventParticipant` table may be added if attendance features are later considered.

---

## 14. Summary

The final design is relationship-first, multi-family, archive-safe, and normalized. It keeps genealogy data as a graph and derives family views dynamically instead of redundantly storing them. This is the correct foundation for future implementation without introducing schema churn or historical data loss.
