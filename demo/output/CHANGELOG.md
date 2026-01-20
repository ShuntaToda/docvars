# Changelog - ExampleApp

All notable changes to ExampleApp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-01-15

### Added
- File attachments - Users can now attach files to tasks
- Activity history - View complete history of task changes
- Dark mode support for Web application

### Changed
- Improved API rate limiting to 1000 requests per hour
- Updated database connection pooling (max 100 connections)
- Enhanced Real-time notifications with customizable preferences

### Fixed
- Fixed task due date timezone handling
- Resolved team invitation email delivery issues
- Fixed iOS app crash on task deletion

## [2.0.0] - 2024-01-01

### Added
- Team collaboration - Create and manage teams
- Tags and categories - Organize tasks with custom tags
- Android app release
- Desktop (Windows/macOS/Linux) support

### Changed
- Complete API redesign (https://api.example.com/v1)
- Migrated to PostgreSQL (example_production)
- New authentication system with JWT

### Removed
- Deprecated v0 API endpoints
- Legacy MongoDB support

## [1.5.0] - 2023-10-15

### Added
- Priority and deadline tracking - Set task priorities and deadlines
- Email notifications for task assignments
- Bulk task operations

### Changed
- Improved search performance
- Updated Web UI design

### Fixed
- Fixed duplicate task creation bug
- Resolved session timeout issues

## [1.0.0] - 2023-07-01

### Added
- Initial release of ExampleApp
- Task creation and management
- User registration and authentication
- Basic Web application

---

## Release Notes

For detailed release notes, visit: https://github.com/example/example/releases

## Support

- Documentation: https://example.com/docs
- Email: support@example.com
- Repository: https://github.com/example/example
