# {{app.name}} - Database Schema

## Connection Details

| Property | Value |
|----------|-------|
| Host | {{db.host}} |
| Port | {{db.port}} |
| Database | {{db.name}} |
| Max Connections | {{db.max_connections}} |

## Entity Relationship Diagram

```mermaid
erDiagram
    {{db.tables.users.name}} {
        uuid {{db.tables.users.columns.id}} PK
        varchar {{db.tables.users.columns.email}}
        varchar {{db.tables.users.columns.name}}
        varchar {{db.tables.users.columns.password_hash}}
        text {{db.tables.users.columns.avatar_url}}
        timestamp {{db.tables.users.columns.created_at}}
        timestamp {{db.tables.users.columns.updated_at}}
    }

    {{db.tables.tasks.name}} {
        uuid {{db.tables.tasks.columns.id}} PK
        varchar {{db.tables.tasks.columns.title}}
        text {{db.tables.tasks.columns.description}}
        uuid {{db.tables.tasks.columns.user_id}} FK
        uuid {{db.tables.tasks.columns.team_id}} FK
        uuid {{db.tables.tasks.columns.assignee_id}} FK
        varchar {{db.tables.tasks.columns.status}}
        varchar {{db.tables.tasks.columns.priority}}
        timestamp {{db.tables.tasks.columns.due_date}}
        text[] {{db.tables.tasks.columns.tags}}
        timestamp {{db.tables.tasks.columns.created_at}}
        timestamp {{db.tables.tasks.columns.updated_at}}
    }

    {{db.tables.teams.name}} {
        uuid {{db.tables.teams.columns.id}} PK
        varchar {{db.tables.teams.columns.name}}
        text {{db.tables.teams.columns.description}}
        timestamp {{db.tables.teams.columns.created_at}}
        timestamp {{db.tables.teams.columns.updated_at}}
    }

    {{db.tables.team_members.name}} {
        uuid {{db.tables.team_members.columns.user_id}} FK
        uuid {{db.tables.team_members.columns.team_id}} FK
        varchar {{db.tables.team_members.columns.role}}
        timestamp {{db.tables.team_members.columns.joined_at}}
    }

    {{db.tables.task_attachments.name}} {
        uuid {{db.tables.task_attachments.columns.id}} PK
        uuid {{db.tables.task_attachments.columns.task_id}} FK
        varchar {{db.tables.task_attachments.columns.filename}}
        text {{db.tables.task_attachments.columns.file_url}}
        integer {{db.tables.task_attachments.columns.file_size}}
        varchar {{db.tables.task_attachments.columns.mime_type}}
        uuid {{db.tables.task_attachments.columns.uploaded_by}} FK
        timestamp {{db.tables.task_attachments.columns.created_at}}
    }

    {{db.tables.activity_log.name}} {
        uuid {{db.tables.activity_log.columns.id}} PK
        varchar {{db.tables.activity_log.columns.entity_type}}
        uuid {{db.tables.activity_log.columns.entity_id}}
        varchar {{db.tables.activity_log.columns.action}}
        uuid {{db.tables.activity_log.columns.user_id}} FK
        jsonb {{db.tables.activity_log.columns.changes}}
        timestamp {{db.tables.activity_log.columns.created_at}}
    }

    {{db.tables.users.name}} ||--o{ {{db.tables.tasks.name}} : "owns"
    {{db.tables.users.name}} ||--o{ {{db.tables.tasks.name}} : "assigned to"
    {{db.tables.teams.name}} ||--o{ {{db.tables.tasks.name}} : "contains"
    {{db.tables.users.name}} ||--o{ {{db.tables.team_members.name}} : "belongs to"
    {{db.tables.teams.name}} ||--o{ {{db.tables.team_members.name}} : "has"
    {{db.tables.tasks.name}} ||--o{ {{db.tables.task_attachments.name}} : "has"
    {{db.tables.users.name}} ||--o{ {{db.tables.task_attachments.name}} : "uploads"
    {{db.tables.users.name}} ||--o{ {{db.tables.activity_log.name}} : "performs"
```

## Tables

### {{db.tables.users.name}}

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| {{db.tables.users.columns.id}} | UUID | PRIMARY KEY | Unique identifier |
| {{db.tables.users.columns.email}} | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| {{db.tables.users.columns.name}} | VARCHAR(255) | NOT NULL | Display name |
| {{db.tables.users.columns.password_hash}} | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| {{db.tables.users.columns.avatar_url}} | TEXT | NULLABLE | Profile picture URL |
| {{db.tables.users.columns.created_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| {{db.tables.users.columns.updated_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_{{db.tables.users.name}}_{{db.tables.users.columns.email}}` on `{{db.tables.users.columns.email}}`

### {{db.tables.tasks.name}}

Stores task information. Core table for {{features.task_management}}.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| {{db.tables.tasks.columns.id}} | UUID | PRIMARY KEY | Unique identifier |
| {{db.tables.tasks.columns.title}} | VARCHAR(255) | NOT NULL | Task title |
| {{db.tables.tasks.columns.description}} | TEXT | NULLABLE | Task description |
| {{db.tables.tasks.columns.user_id}} | UUID | FOREIGN KEY ({{db.tables.users.name}}.{{db.tables.users.columns.id}}) | Task owner |
| {{db.tables.tasks.columns.team_id}} | UUID | FOREIGN KEY ({{db.tables.teams.name}}.{{db.tables.teams.columns.id}}), NULLABLE | Associated team |
| {{db.tables.tasks.columns.assignee_id}} | UUID | FOREIGN KEY ({{db.tables.users.name}}.{{db.tables.users.columns.id}}), NULLABLE | Assigned user |
| {{db.tables.tasks.columns.status}} | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending, in_progress, completed |
| {{db.tables.tasks.columns.priority}} | VARCHAR(20) | NOT NULL, DEFAULT 'medium' | low, medium, high, urgent |
| {{db.tables.tasks.columns.due_date}} | TIMESTAMP | NULLABLE | Task deadline |
| {{db.tables.tasks.columns.tags}} | TEXT[] | NULLABLE | Array of tags for {{features.tags}} |
| {{db.tables.tasks.columns.created_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| {{db.tables.tasks.columns.updated_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_{{db.tables.tasks.name}}_{{db.tables.tasks.columns.user_id}}` on `{{db.tables.tasks.columns.user_id}}`
- `idx_{{db.tables.tasks.name}}_{{db.tables.tasks.columns.team_id}}` on `{{db.tables.tasks.columns.team_id}}`
- `idx_{{db.tables.tasks.name}}_{{db.tables.tasks.columns.status}}` on `{{db.tables.tasks.columns.status}}`
- `idx_{{db.tables.tasks.name}}_{{db.tables.tasks.columns.due_date}}` on `{{db.tables.tasks.columns.due_date}}`
- `idx_{{db.tables.tasks.name}}_{{db.tables.tasks.columns.tags}}` GIN index on `{{db.tables.tasks.columns.tags}}`

### {{db.tables.teams.name}}

Stores team information for {{features.collaboration}}.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| {{db.tables.teams.columns.id}} | UUID | PRIMARY KEY | Unique identifier |
| {{db.tables.teams.columns.name}} | VARCHAR(255) | NOT NULL | Team name |
| {{db.tables.teams.columns.description}} | TEXT | NULLABLE | Team description |
| {{db.tables.teams.columns.created_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| {{db.tables.teams.columns.updated_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

### {{db.tables.team_members.name}}

Junction table for {{db.tables.users.name}} and {{db.tables.teams.name}} relationship.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| {{db.tables.team_members.columns.user_id}} | UUID | FOREIGN KEY ({{db.tables.users.name}}.{{db.tables.users.columns.id}}) | User reference |
| {{db.tables.team_members.columns.team_id}} | UUID | FOREIGN KEY ({{db.tables.teams.name}}.{{db.tables.teams.columns.id}}) | Team reference |
| {{db.tables.team_members.columns.role}} | VARCHAR(20) | NOT NULL, DEFAULT 'member' | owner, admin, member |
| {{db.tables.team_members.columns.joined_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Join time |

**Primary Key:** ({{db.tables.team_members.columns.user_id}}, {{db.tables.team_members.columns.team_id}})

### {{db.tables.task_attachments.name}}

Stores file attachment metadata for {{features.attachments}}.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| {{db.tables.task_attachments.columns.id}} | UUID | PRIMARY KEY | Unique identifier |
| {{db.tables.task_attachments.columns.task_id}} | UUID | FOREIGN KEY ({{db.tables.tasks.name}}.{{db.tables.tasks.columns.id}}) | Associated task |
| {{db.tables.task_attachments.columns.filename}} | VARCHAR(255) | NOT NULL | Original filename |
| {{db.tables.task_attachments.columns.file_url}} | TEXT | NOT NULL | Storage URL |
| {{db.tables.task_attachments.columns.file_size}} | INTEGER | NOT NULL | Size in bytes |
| {{db.tables.task_attachments.columns.mime_type}} | VARCHAR(100) | NOT NULL | File MIME type |
| {{db.tables.task_attachments.columns.uploaded_by}} | UUID | FOREIGN KEY ({{db.tables.users.name}}.{{db.tables.users.columns.id}}) | Uploader |
| {{db.tables.task_attachments.columns.created_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload time |

### {{db.tables.activity_log.name}}

Stores activity history for {{features.history}}.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| {{db.tables.activity_log.columns.id}} | UUID | PRIMARY KEY | Unique identifier |
| {{db.tables.activity_log.columns.entity_type}} | VARCHAR(50) | NOT NULL | 'task', 'team', 'user' |
| {{db.tables.activity_log.columns.entity_id}} | UUID | NOT NULL | Reference to entity |
| {{db.tables.activity_log.columns.action}} | VARCHAR(50) | NOT NULL | 'created', 'updated', 'deleted' |
| {{db.tables.activity_log.columns.user_id}} | UUID | FOREIGN KEY ({{db.tables.users.name}}.{{db.tables.users.columns.id}}) | Actor |
| {{db.tables.activity_log.columns.changes}} | JSONB | NULLABLE | Changed fields |
| {{db.tables.activity_log.columns.created_at}} | TIMESTAMP | NOT NULL, DEFAULT NOW() | Event time |

**Indexes:**
- `idx_{{db.tables.activity_log.name}}_entity` on `({{db.tables.activity_log.columns.entity_type}}, {{db.tables.activity_log.columns.entity_id}})`
- `idx_{{db.tables.activity_log.name}}_{{db.tables.activity_log.columns.user_id}}` on `{{db.tables.activity_log.columns.user_id}}`
- `idx_{{db.tables.activity_log.name}}_{{db.tables.activity_log.columns.created_at}}` on `{{db.tables.activity_log.columns.created_at}}`

## Migrations

All database migrations are managed using the migration tool. Run migrations with:

```bash
npm run db:migrate
```

## Backup

Database backups are performed daily and stored for {{db.backup.retention_days}} days.

**Backup schedule:**
- Full backup: Daily at {{db.backup.full_backup_time}}
- Incremental: Every {{db.backup.incremental_interval}}

## Contact

For database questions, contact {{authors.backend.name}} ({{authors.backend.email}}).
