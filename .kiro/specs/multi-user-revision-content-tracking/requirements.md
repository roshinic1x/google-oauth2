# Requirements Document

## Introduction

This feature enhances the existing Google Docs and Sheets revision tracking system to properly display content changes from multiple users with editor permissions, not just the document creator. The system currently returns revision metadata but fails to show actual content changes and doesn't properly track all users who have made edits. This enhancement will enable comprehensive multi-user revision tracking with full content visibility, date range filtering, and user-specific change tracking.

## Glossary

- **Revision_System**: The Google Drive API revision tracking functionality that records document/spreadsheet versions
- **Content_Retriever**: The component that fetches actual document/spreadsheet content for specific revisions using exportLinks
- **User_Filter**: The component that filters revisions by specific user email addresses
- **Date_Filter**: The component that filters revisions within specified date ranges
- **Permission_Checker**: The component that verifies user access permissions for documents/spreadsheets
- **Diff_Engine**: The component that compares two revisions and identifies added, removed, and modified content
- **Export_Link**: A URL provided by Google Drive API that allows downloading revision content in various formats
- **Editor**: A user with edit permissions on a Google Doc or Sheet
- **Revision_Metadata**: Information about a revision including ID, timestamp, and last modifying user
- **OAuth_Scope**: Permission level granted to the application for accessing Google APIs

## Requirements

### Requirement 1: Display All Editor Revisions

**User Story:** As a document administrator, I want to see revisions from all users with editor permissions, so that I can track contributions from the entire team.

#### Acceptance Criteria

1. WHEN the Revision_System retrieves revisions for a document, THE Revision_System SHALL include revisions from all users with editor permissions
2. THE Revision_System SHALL use the fields=* parameter when calling the Google Drive Revisions API
3. FOR ALL revisions returned, THE Revision_System SHALL include the lastModifyingUser field with email address
4. THE Permission_Checker SHALL verify that the requesting user has at least read access to the document
5. WHEN multiple users edit within the same time window, THE Revision_System SHALL preserve the lastModifyingUser attribution for the merged revision

### Requirement 2: Retrieve Revision Content

**User Story:** As a compliance officer, I want to view the actual content of each revision, so that I can audit document changes over time.

#### Acceptance Criteria

1. WHEN a specific revision is requested, THE Content_Retriever SHALL fetch the exportLinks from the revision metadata
2. THE Content_Retriever SHALL download content using the exportLinks provided by Google Drive API
3. FOR Google Docs, THE Content_Retriever SHALL support text/plain and text/html export formats
4. FOR Google Sheets, THE Content_Retriever SHALL support text/csv and Excel export formats
5. IF exportLinks are not available for a revision, THEN THE Content_Retriever SHALL return a descriptive error message explaining why content is unavailable
6. THE Content_Retriever SHALL include both content and htmlContent fields in the response for Google Docs
7. THE Content_Retriever SHALL include csvContent field in the response for Google Sheets

### Requirement 3: Filter Revisions by Date Range

**User Story:** As a project manager, I want to filter revisions by date range, so that I can review changes made during specific time periods.

#### Acceptance Criteria

1. WHEN a date range is provided, THE Date_Filter SHALL filter revisions where modifiedTime falls between startDate and endDate inclusive
2. THE Date_Filter SHALL accept ISO 8601 formatted date strings as input
3. THE Date_Filter SHALL validate that startDate is before or equal to endDate
4. IF startDate is after endDate, THEN THE Date_Filter SHALL return a validation error
5. THE Date_Filter SHALL return revisions sorted by modifiedTime in descending order (newest first)
6. THE Date_Filter SHALL support filtering for both Google Docs and Google Sheets

### Requirement 4: Filter Revisions by User

**User Story:** As a team lead, I want to filter revisions by specific user email, so that I can review an individual contributor's changes.

#### Acceptance Criteria

1. WHEN a user email is provided, THE User_Filter SHALL filter revisions where lastModifyingUser.emailAddress matches the provided email
2. THE User_Filter SHALL perform case-insensitive email matching
3. THE User_Filter SHALL return an empty array if no revisions match the specified user email
4. THE User_Filter SHALL support filtering for both Google Docs and Google Sheets
5. THE User_Filter SHALL return revisions sorted by modifiedTime in descending order (newest first)

### Requirement 5: Compare Revision Content

**User Story:** As a content reviewer, I want to compare two revisions side-by-side, so that I can identify exactly what changed between versions.

#### Acceptance Criteria

1. WHEN two revision IDs are provided, THE Diff_Engine SHALL retrieve content for both revisions
2. THE Diff_Engine SHALL calculate line-by-line differences for text content
3. THE Diff_Engine SHALL identify added lines, removed lines, and unchanged lines
4. FOR Google Sheets, THE Diff_Engine SHALL calculate row-level differences in CSV format
5. THE Diff_Engine SHALL return a summary count of additions and removals
6. THE Diff_Engine SHALL include metadata for both revisions (timestamp, user, content)
7. IF either revision content is unavailable, THEN THE Diff_Engine SHALL return an error indicating which revision failed

### Requirement 6: Combine Date and User Filtering

**User Story:** As an auditor, I want to filter revisions by both date range and user email, so that I can review specific user's changes during a particular time period.

#### Acceptance Criteria

1. WHEN both date range and user email are provided, THE Revision_System SHALL apply both filters sequentially
2. THE Revision_System SHALL first filter by date range, then filter the results by user email
3. THE Revision_System SHALL return only revisions that match both criteria
4. THE Revision_System SHALL return an empty array if no revisions match both filters
5. THE Revision_System SHALL support this combined filtering for both Google Docs and Google Sheets

### Requirement 7: Handle Missing or Null Content

**User Story:** As a developer, I want clear error messages when revision content is unavailable, so that I can understand why content retrieval failed.

#### Acceptance Criteria

1. WHEN exportLinks are not present in revision metadata, THE Content_Retriever SHALL return a descriptive error message
2. THE Content_Retriever SHALL explain possible reasons for missing content (revision too old, insufficient permissions, file type limitations)
3. WHEN content download fails, THE Content_Retriever SHALL log the error details to the server console
4. THE Content_Retriever SHALL return null for content fields when download fails, along with an explanatory note field
5. THE Content_Retriever SHALL not throw unhandled exceptions for missing content

### Requirement 8: Verify OAuth Scopes

**User Story:** As a system administrator, I want to ensure proper OAuth scopes are configured, so that the application has necessary permissions to access revision content.

#### Acceptance Criteria

1. THE OAuth_Scope configuration SHALL include https://www.googleapis.com/auth/drive.readonly
2. THE OAuth_Scope configuration SHALL include https://www.googleapis.com/auth/documents.readonly
3. THE OAuth_Scope configuration SHALL include https://www.googleapis.com/auth/spreadsheets.readonly
4. THE OAuth_Scope configuration SHALL include https://www.googleapis.com/auth/drive.activity.readonly
5. WHEN OAuth authentication is initiated, THE Revision_System SHALL request all required scopes
6. IF any required scope is missing, THEN THE Revision_System SHALL return an error indicating which scope is needed

### Requirement 9: Retrieve Current Revision

**User Story:** As a user, I want to easily identify the current (latest) revision, so that I can compare it with historical versions.

#### Acceptance Criteria

1. WHEN revisions are retrieved, THE Revision_System SHALL sort them by modifiedTime in descending order
2. THE Revision_System SHALL identify the first revision in the sorted list as the currentRevision
3. THE Revision_System SHALL include a currentRevision field in the response containing the latest revision metadata
4. THE Revision_System SHALL include the currentRevision in the revisions array as well
5. THE Revision_System SHALL apply this logic for both Google Docs and Google Sheets

### Requirement 10: Support Multiple Export Formats

**User Story:** As a data analyst, I want to export revision content in multiple formats, so that I can use the format most suitable for my analysis tools.

#### Acceptance Criteria

1. FOR Google Docs, THE Content_Retriever SHALL support exporting as text/plain format
2. FOR Google Docs, THE Content_Retriever SHALL support exporting as text/html format
3. FOR Google Sheets, THE Content_Retriever SHALL support exporting as text/csv format
4. FOR Google Sheets, THE Content_Retriever SHALL support exporting as Excel (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet) format
5. THE Content_Retriever SHALL return all available export formats in the response
6. WHEN an export format is not available for a revision, THE Content_Retriever SHALL return null for that format field
