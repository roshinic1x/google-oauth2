# Removed Endpoints Summary

This document lists all endpoints that have been removed from the Swagger documentation.

## Document Endpoints (Removed from Swagger)

- `GET /api/doc/{docId}/by-date` - Get document revisions by date range
- `GET /api/doc/{docId}/by-user` - Get document revisions by user
- `GET /api/doc/{docId}/revision/{revisionId}/changes` - Get revision changes
- `GET /api/doc/{docId}/compare/{revisionId1}/{revisionId2}` - Compare document revisions

## Sheet Endpoints (Removed from Swagger)

- `GET /api/sheet/{sheetId}/revisions/by-date` - Get spreadsheet revisions by date range
- `GET /api/sheet/{sheetId}/revisions/by-user` - Get spreadsheet revisions by user
- `GET /api/sheet/{sheetId}/compare/{revisionId1}/{revisionId2}` - Compare sheet revisions

## Folder Endpoints (Removed from Swagger)

- `GET /api/folder/{folderId}/process` - Process folder recursively

---

## Active Endpoints (Still Available)

### Authentication Endpoints ✅
- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback handler

### Picker Endpoints ✅
- `GET /api/auth/status` - Check authentication status
- `GET /api/picker/config` - Get picker configuration
- `POST /api/picker/selected` - Save selected items from picker
- `GET /api/picker/items` - Get previously selected items
- `GET /picker` - Picker UI page

### Drive Endpoints ✅
- `GET /api/files` - List files from Google Drive
- `GET /api/file/{fileId}/metadata` - Get file metadata
- `GET /api/file/{fileId}/permissions` - Get file permissions
- `GET /api/folder/{folderId}/files` - List files in a folder

### Document Endpoints ✅
- `GET /api/doc/{docId}` - Get Google Doc content
- `GET /api/doc/{docId}/revisions` - Get document revision history
- `GET /api/doc/{docId}/revision/{revisionId}` - Get specific revision content
- `GET /api/doc/{docId}/activity` - Get document activity (Drive Activity API)

### Sheet Endpoints ✅
- `GET /api/sheet/{sheetId}` - Get Google Sheet content
- `GET /api/sheet/{sheetId}/metadata` - Get spreadsheet metadata
- `GET /api/sheet/{sheetId}/revisions` - Get spreadsheet revision history
- `GET /api/sheet/{sheetId}/revision/{revisionId}` - Get specific sheet revision content
- `GET /api/sheet/{sheetId}/activity` - Get spreadsheet activity (Drive Activity API)

### People API Endpoints ✅
- `GET /api/person/{personId}` - Get person information (name, email)

---

## What Was Changed

Only the following endpoints were removed from the codebase:
- Document filtering/comparison endpoints
- Sheet filtering/comparison endpoints  
- Folder recursive processing endpoint

All authentication and picker endpoints remain fully functional.
