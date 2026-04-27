# Google Docs & Sheets OAuth Integration

NestJS application for integrating with Google Docs and Sheets APIs using OAuth 2.0.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Add your Google OAuth credentials:
     ```
     GOOGLE_CLIENT_ID=your_client_id_here
     GOOGLE_CLIENT_SECRET=your_client_secret_here
     GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
     PORT=5000
     ```

3. **Google Cloud Console Setup:**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable APIs: Google Docs API, Google Drive API, Google Sheets API
   - Go to **OAuth consent screen**:
     - Add the following scopes under "Data access":
       - `https://www.googleapis.com/auth/drive.metadata.readonly` (Non-sensitive)
       - `https://www.googleapis.com/auth/documents.readonly` (Sensitive)
       - `https://www.googleapis.com/auth/spreadsheets.readonly` (Sensitive)
   - Create OAuth 2.0 credentials (Web Application)
   - Add authorized redirect URI: `http://localhost:5000/auth/google/callback`

## Running the Application

```bash
# Development mode
npm run start:dev

```

## API Endpoints

### Authentication

- **GET** `/auth/google` - Initiate OAuth flow
- **GET** `/auth/google/callback` - OAuth callback (handled automatically)

### API Operations

- **GET** `/api/files?pageSize=10` - List files from Google Drive
- **GET** `/api/file/:fileId/metadata` - Get file metadata
- **GET** `/api/doc/:docId` - Get Google Doc content
- **GET** `/api/sheet/:sheetId?range=Sheet1` - Get Google Sheet content

## Usage Flow

1. Navigate to `http://localhost:5000/auth/google` to start OAuth
2. Authorize the application with Google
3. Tokens are automatically stored in `./storage/tokens.json`
4. Access tokens are automatically refreshed when expired
5. Use API endpoints to fetch data from Google Docs/Sheets

## Features

- OAuth 2.0 authentication with Google
- Automatic token refresh
- Local file-based token storage
- Support for Google Docs, Sheets, and Drive APIs
- Metadata and content retrieval

## Scopes

- `https://www.googleapis.com/auth/drive.metadata.readonly` - Read file metadata
- `https://www.googleapis.com/auth/documents.readonly` - Read Google Docs
- `https://www.googleapis.com/auth/spreadsheets.readonly` - Read Google Sheets


## Configuring Scopes

Scopes are configured in two places:

1. **Google Cloud Console** (OAuth consent screen → Scopes):
   - Add the scopes your application needs under "Data access"
   - These must match the scopes requested by your application

2. **Environment Variables** (`.env` file):
   - Set `GOOGLE_SCOPES` as a comma-separated list
   - If not set, defaults to Drive, Docs, and Sheets readonly scopes
   - Example: `GOOGLE_SCOPES=https://www.googleapis.com/auth/drive.readonly,https://www.googleapis.com/auth/documents.readonly`

Make sure the scopes in your `.env` file match those configured in Google Cloud Console.
