# Changelog - {{app.name}}

All notable changes to {{app.name}} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [{{app.version}}] - 2024-01-15

### Added
- {{features.attachments}} - Users can now attach files to tasks
- {{features.history}} - View complete history of task changes
- Dark mode support for {{platforms.web}} application

### Changed
- Improved API rate limiting to {{api.rate_limit}} requests per hour
- Updated database connection pooling (max {{db.max_connections}} connections)
- Enhanced {{features.notifications}} with customizable preferences

### Fixed
- Fixed task due date timezone handling
- Resolved team invitation email delivery issues
- Fixed {{platforms.ios}} app crash on task deletion

## [2.0.0] - 2024-01-01

### Added
- {{features.collaboration}} - Create and manage teams
- {{features.tags}} - Organize tasks with custom tags
- {{platforms.android}} app release
- {{platforms.desktop}} support

### Changed
- Complete API redesign ({{api.base_url}}/{{api.version}})
- Migrated to PostgreSQL ({{db.name}})
- New authentication system with JWT

### Removed
- Deprecated v0 API endpoints
- Legacy MongoDB support

## [1.5.0] - 2023-10-15

### Added
- {{features.priority}} - Set task priorities and deadlines
- Email notifications for task assignments
- Bulk task operations

### Changed
- Improved search performance
- Updated {{platforms.web}} UI design

### Fixed
- Fixed duplicate task creation bug
- Resolved session timeout issues

## [1.0.0] - 2023-07-01

### Added
- Initial release of {{app.name}}
- {{features.task_management}}
- User registration and authentication
- Basic {{platforms.web}} application

---

## Release Notes

For detailed release notes, visit: {{app.repository}}/releases

## Support

- Documentation: {{organization.website}}/docs
- Email: {{organization.email}}
- Repository: {{app.repository}}
