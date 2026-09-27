# Relationship Rules

## 1. Family access rules

- `User` to `Family` access is handled through `UserFamilyAccess`.
- A single user may have access to multiple families.
- A family may have many users.
- Role and permission checks determine what each user can do inside a specific family.
- Access must not be inferred only from frontend state; backend authorization remains authoritative.

---

## 2. Archive semantics

Archived members are not removed from the genealogical graph.

Example:

- Grandfather [ARCHIVED]
  - Father
    - Child
  - Uncle

The historical relationship remains intact even when a member is archived.

Rules:
- `isArchived = true` does not delete lineage edges.
- Archived members stay in the graph for historical and full-tree queries.
- Active views may optionally hide archived members.
- Hard deletion should be rare, controlled, and admin-only.
- A member can be archived while remaining linked as parent, child, spouse, or ancestor/descendant.

---

## 3. Parent-child rules

### Canonical rules
- `ParentChildRelationship` connects `parentId` to `childId` within a family.
- A person cannot be their own parent.
- A person cannot be their own child.
- Duplicate parent-child relations are prevented.
- Cross-family genealogical links are not allowed.
- Historical parent-child relationships remain valid even if a person is archived.
- Multiple children are supported.
- Two biological parents are represented with two rows.
- Step and adoptive relationships are represented with `relationshipType` values.

### Supported types
- `BIOLOGICAL`
- `ADOPTIVE`
- `STEP`
- `UNKNOWN`

### Duplicate prevention
Recommended baseline uniqueness:
- `UNIQUE (familyId, parentId, childId, relationshipType)`

### Circular ancestry prevention
A cycle cannot be prevented by FK constraints alone. The application/service layer must detect cycles before commit.

Validation should include:
- `parentId <> childId`
- no path from child back to parent in the same family
- no self-loop in ancestry traversal
- no cycle during batch import or bulk update

This validation belongs primarily in the application/service layer, with optional database trigger enforcement later if needed.

---

## 4. Marriage rules

### Canonical rules
- A `Marriage` row connects two members within the same family.
- Self-marriage is forbidden.
- A person may have multiple marriages across time.
- Historical and ended marriages must remain representable.
- Divorce, widowhood, and unknown statuses are supported.
- A permanent one-spouse-only rule is not imposed.

### Supported statuses
- `ACTIVE`
- `ENDED`
- `DIVORCED`
- `WIDOWED`
- `UNKNOWN`

### Duplicate prevention
- Duplicate active marriage records are prevented in service validation.
- Multiple historical marriages are allowed when they are distinct and intentionally recorded.
- The model should not enforce a blanket unique rule on `(familyId, person1Id, person2Id)` because multiple distinct marriages can occur over time.
++
---

## 5. Cross-family restrictions

- Parent-child relationships should remain within the same family.
- Marriage relationships should remain within the same family.
- Cross-family genealogical links are not allowed unless there is an explicit future requirement reviewed by stakeholders.

This is a data integrity rule and should be enforced in application logic and any DB-level validation that is added later.

---

## 6. Data integrity rules

### Primary rules
- Every relationship row must reference valid people and a valid family.
- `familyId` must match the relevant member family during relationship creation.
- A member must not be orphaned from a family because family membership is foundational to the genealogical model.
- Audit logs should never be mutated by normal users.

### Deletion and archive expectations
- Archive should be used instead of hard delete for genealogically important records.
- Relationship rows are not deleted just because a member is archived.
- Deletion is a controlled administrative action, not a normal workflow.

---

## 7. Derived relationship rules

The following must be derived, not stored as redundant columns:

- father
- mother
- son
- daughter
- sibling
- grandfather
- grandmother
- grandparent
- grandchild
- uncle
- aunt
- nephew
- niece
- cousin
- ancestor
- descendant
- generation
- branch

These are determined from the same canonical relationship tables.

---

## 8. Generation and branch rules

- Generation is derived from graph depth relative to a selected node.
- Ancestors and descendants are derived from recursive traversal.
- Siblings and cousins are derived from relation paths.
- Branches are derived from descendant clusters unless a very strong reason emerges for storing a persistent branch entity.
- Tree coordinates or nested tree JSON are not part of the canonical persistent model.

---

## 9. Import/export rules

The canonical relationship tables must be preserved during import/export so family data can be reconstructed:

- people must retain family membership
- parent-child rows must be exported as relational edges
- marriage rows must remain historical and distinct
- media/document metadata must point to external storage files
- enough structure must remain to re-create the graph without a nested JSON blob

---

## 10. Security and access rules

- Sensitive fields such as phone, email, address, and private notes must not be exposed without authorization.
- Access is granted through `UserFamilyAccess` and validated server-side.
- Audit entries are append-only and protected from normal user modification.

---

## 11. Summary

The final architecture ensures that genealogical meaning is preserved through normalized relationships, archive-safe historical records, and family-scoped access control. The family tree is derived from the graph rather than stored as redundant fields, and circular or duplicate relationship issues are prevented at the relationship-validation layer rather than by assuming any single table can guarantee it alone.
