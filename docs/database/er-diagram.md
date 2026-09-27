# ER Diagram

```mermaid
erDiagram
    FAMILY ||--o{ FAMILY_MEMBER : contains
    FAMILY ||--o{ PARENT_CHILD_RELATIONSHIP : owns
    FAMILY ||--o{ MARRIAGE : records
    FAMILY ||--o{ PHOTO : owns
    FAMILY ||--o{ DOCUMENT : owns
    FAMILY ||--o{ IMPORTANT_DATE : owns
    FAMILY ||--o{ EVENT : owns
    FAMILY ||--o{ AUDIT_LOG : records
    FAMILY ||--o{ USER_FAMILY_ACCESS : scopes

    FAMILY_MEMBER ||--o{ PARENT_CHILD_RELATIONSHIP : "parent"
    FAMILY_MEMBER ||--o{ PARENT_CHILD_RELATIONSHIP : "child"
    FAMILY_MEMBER ||--o{ MARRIAGE : "person 1"
    FAMILY_MEMBER ||--o{ MARRIAGE : "person 2"
    FAMILY_MEMBER ||--o{ PHOTO : has
    FAMILY_MEMBER ||--o{ DOCUMENT : has
    FAMILY_MEMBER ||--o{ IMPORTANT_DATE : relates_to
    FAMILY_MEMBER ||--o{ EVENT_PARTICIPANT : attends

    USER ||--o{ USER_FAMILY_ACCESS : grants
    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : assigned_to
    ROLE ||--o{ ROLE_PERMISSION : grants
    PERMISSION ||--o{ ROLE_PERMISSION : assigned_to

    EVENT ||--o{ EVENT_PARTICIPANT : includes

    FAMILY {
        UUID id PK
        varchar name
        text description
        varchar status
        timestamptz createdAt
        timestamptz updatedAt
    }

    FAMILY_MEMBER {
        UUID id PK
        UUID familyId FK
        varchar firstName
        varchar middleName
        varchar lastName
        varchar displayName
        varchar gender
        date dateOfBirth
        varchar birthDatePrecision
        text birthPlace
        date dateOfDeath
        varchar deathDatePrecision
        text deathPlace
        varchar occupation
        text education
        varchar phone
        varchar email
        text address
        text biography
        text notes
        UUID profilePhotoId
        varchar status
        boolean isArchived
        timestamptz createdAt
        timestamptz updatedAt
    }

    PARENT_CHILD_RELATIONSHIP {
        UUID id PK
        UUID familyId FK
        UUID parentId FK
        UUID childId FK
        varchar relationshipType
        text notes
        timestamptz createdAt
    }

    MARRIAGE {
        UUID id PK
        UUID familyId FK
        UUID person1Id FK
        UUID person2Id FK
        date marriageDate
        varchar marriageDatePrecision
        text marriagePlace
        date endDate
        varchar endDatePrecision
        varchar status
        text notes
        timestamptz createdAt
        timestamptz updatedAt
    }

    PHOTO {
        UUID id PK
        UUID familyId FK
        UUID memberId FK
        varchar fileName
        text description
        text storageUrl
        varchar storagePublicId
        UUID uploadedBy
        timestamptz createdAt
        timestamptz updatedAt
    }

    DOCUMENT {
        UUID id PK
        UUID familyId FK
        UUID memberId FK
        varchar title
        varchar fileName
        varchar fileType
        bigint fileSize
        text storageUrl
        text description
        UUID uploadedBy
        timestamptz createdAt
        timestamptz updatedAt
    }

    IMPORTANT_DATE {
        UUID id PK
        UUID familyId FK
        UUID memberId FK
        varchar title
        date date
        varchar datePrecision
        varchar type
        text notes
        timestamptz createdAt
        timestamptz updatedAt
    }

    EVENT {
        UUID id PK
        UUID familyId FK
        varchar title
        varchar type
        timestamptz eventDate
        text location
        text description
        UUID createdBy
        timestamptz createdAt
        timestamptz updatedAt
    }

    EVENT_PARTICIPANT {
        UUID id PK
        UUID eventId FK
        UUID memberId FK
        varchar role
        timestamptz createdAt
    }

    USER {
        UUID id PK
        varchar email
        text passwordHash
        varchar fullName
        varchar status
        timestamptz createdAt
        timestamptz updatedAt
    }

    ROLE {
        UUID id PK
        varchar name
        text description
        timestamptz createdAt
    }

    PERMISSION {
        UUID id PK
        varchar name
        text description
    }

    USER_ROLE {
        UUID userId FK
        UUID roleId FK
        timestamptz createdAt
    }

    ROLE_PERMISSION {
        UUID roleId FK
        UUID permissionId FK
        timestamptz createdAt
    }

    USER_FAMILY_ACCESS {
        UUID id PK
        UUID userId FK
        UUID familyId FK
        UUID roleId FK
        timestamptz grantedAt
    }

    AUDIT_LOG {
        UUID id PK
        UUID userId FK
        varchar action
        varchar entityType
        UUID entityId
        UUID familyId FK
        timestamptz timestamp
        jsonb oldValues
        jsonb newValues
        jsonb metadata
    }
```

This is the final normalized model for a multi-family genealogy system: relationship tables drive the tree, users are scoped by family access, and archive-safe historical records remain intact while derived family views are computed dynamically.
