# Admin User Guide

## Structured For Growth - Dashboard Administration

Complete guide for managing the Structured For Growth client management system, content updates, and administrative functions.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Client Management](#client-management)
5. [Project Management](#project-management)
6. [Contact Form Submissions](#contact-form-submissions)
7. [Template Library Management](#template-library-management)
8. [Security & Best Practices](#security--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Stable internet connection
- Admin credentials

### First-Time Setup

1. Navigate to `/dashboard` or `/client/dashboard.html`
2. Register admin account (first user becomes admin)
3. Secure your credentials
4. Configure email notifications (if needed)

### Access Levels

- **Admin**: Full access to all features
- **Manager**: Client and project management (future)
- **Viewer**: Read-only access (future)

*Currently, all registered users have admin access. Role-based access coming in v2.0*

---

## Authentication

### Creating an Account

1. **Navigate to Dashboard**: Go to `/client/dashboard.html`
2. **Click "Register"**: Switch to registration form
3. **Fill Details**:
   - **Email**: Valid email address (used for login)
   - **Password**: Minimum 8 characters, include letters and numbers
   - **Confirm Password**: Must match password
4. **Submit**: Account created instantly
5. **Auto-Login**: Redirected to dashboard automatically

### Logging In

1. **Navigate to Dashboard**: `/client/dashboard.html`
2. **Enter Credentials**:
   - Email address
   - Password
3. **Submit**: Click "Login"
4. **Token Storage**: JWT token stored securely in browser
5. **Session Duration**: 7 days (auto-logout after)

### Logging Out

- Click "Logout" button in navigation
- Clears authentication token
- Redirects to login page
- Recommended after each session

### Password Requirements

✅ Minimum 8 characters  
✅ At least one letter  
✅ At least one number  
✅ Case-sensitive

**Security Tips:**
- Use unique password (not reused from other sites)
- Consider a password manager
- Never share credentials
- Log out on shared computers

### Token Expiration

- **Default**: 7 days
- **On Expiration**: Auto-logout and redirect to login
- **Refresh**: Simply log in again
- **Storage**: Local browser storage (not cookies)

---

## Dashboard Overview

### Main Navigation

**Top Bar:**
- 🏠 **Home**: Return to main website
- 👥 **Clients**: Manage client records
- 📁 **Projects**: Manage project data
- 📧 **Messages**: View contact submissions
- 🔧 **Templates**: Manage template library (future)
- 👤 **Profile**: User settings (future)
- 🚪 **Logout**: End session

### Dashboard Sections

**Statistics Cards** (Top of page)
- **Total Clients**: Count of active clients
- **Active Projects**: Projects in progress
- **New Messages**: Unread contact form submissions
- **Templates**: Total template count

**Quick Actions** (Action buttons)
- Add New Client
- Create Project
- View Messages
- Update Template

**Recent Activity** (Timeline)
- Last 10 actions taken
- Client updates
- New project additions
- Message submissions

---

## Client Management

### Viewing Clients

**Client List View:**
- Table showing all clients
- Columns: Name, Email, Phone, Company, Status, Actions
- **Search**: Filter by name or email
- **Sort**: Click column headers to sort
- **Pagination**: 20 clients per page

### Adding a New Client

1. **Click "Add Client"** button
2. **Fill Form**:
   - **Name**: Client's full name (required)
   - **Email**: Valid email address (required)
   - **Phone**: Phone number (optional, format: XXX-XXX-XXXX)
   - **Company**: Company name (optional)
   - **Status**: Select from dropdown:
     - Active
     - Inactive
     - Lead
     - Archived
3. **Submit**: Click "Save Client"
4. **Confirmation**: Success message appears
5. **Automatic Actions**:
   - Client appears in list immediately
   - ID auto-generated
   - Timestamp recorded

### Editing a Client

1. **Locate Client**: Use search or browse list
2. **Click "Edit"** icon/button
3. **Modify Fields**: Update any information
4. **Save Changes**: Click "Update Client"
5. **Confirmation**: Success message
6. **Audit Trail**: Update timestamp recorded

### Deleting a Client

⚠️ **Warning:** This action cannot be undone!

1. **Locate Client**: Find in list
2. **Click "Delete"** icon/button
3. **Confirm**: Popup asks for confirmation
4. **Submit**: Click "Yes, Delete"
5. **Result**: Client removed from system
6. **Related Data**: Associated projects also deleted (cascade)

**Best Practice:** Consider changing status to "Archived" instead of deleting.

### Client Statuses

- **Active**: Current paying clients
- **Inactive**: Past clients, no active projects
- **Lead**: Prospective clients, not yet converted
- **Archived**: Closed accounts, kept for records

### Exporting Client Data

1. **Click "Export"** button
2. **Select Format**:
   - CSV (for Excel)
   - JSON (for data processing)
   - PDF (for printing)
3. **Download**: File saves to your computer
4. **Use Cases**:
   - Backup data
   - Import to CRM
   - Generate reports
   - Tax records

---

## Project Management

### Viewing Projects

**Project List View:**
- Table with all projects
- Columns: Project Name, Client, Status, Start Date, End Date, Budget
- **Filter by Status**: Active, Completed, On Hold, Cancelled
- **Filter by Client**: Show projects for specific client
- **Search**: Find by project name or description

### Creating a New Project

1. **Click "New Project"** button
2. **Fill Form**:
   - **Project Name**: Descriptive title (required)
   - **Client**: Select from client dropdown (required)
   - **Description**: Project details (optional)
   - **Status**: Select:
     - Planning
     - Active
     - On Hold
     - Completed
     - Cancelled
   - **Start Date**: Project start (optional)
   - **End Date**: Expected completion (optional)
   - **Budget**: Dollar amount (optional)
3. **Submit**: Click "Create Project"
4. **Confirmation**: Project added to list

### Updating Project Status

**Workflow:**
1. Planning → Active → Completed
2. Any status → On Hold (temporarily)
3. Any status → Cancelled (permanent)

**To Update:**
1. Click "Edit" on project
2. Change status dropdown
3. Save changes
4. Status badge updates in list

### Project Notes

**Adding Notes:**
1. Open project details
2. Click "Add Note" button
3. Type note content (markdown supported)
4. Save note
5. Timestamp and author recorded

**Use Cases:**
- Progress updates
- Client feedback
- Technical decisions
- Issue tracking
- Meeting notes

### Linking Projects to Clients

- Each project must have one client
- One client can have multiple projects
- Change client: Edit project → select new client from dropdown
- View all projects for a client: Filter by client name

---

## Contact Form Submissions

### Viewing Messages

**Message Inbox:**
- All submissions from homepage contact form
- Columns: Date, Name, Email, Project Type, Status, Actions
- **Filter by Status**: New, Read, Responded, Archived
- **Sort**: By date (newest first)
- **Badge**: "New" badge for unread messages

### Reading Messages

1. **Click Message Row**: Opens message details
2. **View Information**:
   - Sender name and email
   - Project type selected
   - Full message content
   - Submission timestamp
3. **Auto-Mark**: Message marked as "Read" automatically
4. **Actions**: Reply, Archive, Convert to Client

### Responding to Messages

**Quick Reply:**
1. Click "Reply" button
2. Opens email client with:
   - To: Sender's email pre-filled
   - Subject: "Re: Your inquiry to Structured For Growth"
   - Template: Professional response template
3. Customize message
4. Send from email client

**Converting to Client:**
1. Click "Convert to Client" button
2. Pre-fills client form with submission data
3. Add additional details (phone, company)
4. Save as new client
5. Original message links to new client record

### Message Statuses

- **New**: Unread submission (appears with badge)
- **Read**: Viewed but not responded
- **Responded**: Reply sent to sender
- **Archived**: Closed inquiry, kept for records

### Archiving Messages

1. Select message(s)
2. Click "Archive" button
3. Removed from active inbox
4. Accessible in "Archived" filter
5. **Tip**: Archive after responding or if spam

---

## Template Library Management

*Note: Template management UI coming in v2.0. Currently managed via code.*

### Current Template Management

**Location:** `templates/templateData.js`

**Adding a New Template:**

```javascript
{
  id: 17, // Increment last ID
  name: 'Template Name',
  description: 'What this template does',
  category: 'Frontend', // or 'Backend', 'Utilities', 'Full-Stack'
  code: `// Your template code here`,
  tags: ['JavaScript', 'Node.js'], // Relevant tech tags
  timeSaved: 3 // Hours saved using this template
}
```

**Steps:**
1. Open `templates/templateData.js`
2. Add new object to `templates` array
3. Ensure ID is unique
4. Save file
5. Restart server: `npm run dev`
6. Template appears in library automatically

### Template Categories

- **Frontend**: UI components, client-side utilities
- **Backend**: Server routes, controllers, models
- **Utilities**: Helper functions, formatters, validators
- **Full-Stack**: Complete features (auth, CRUD, etc.)

### Updating Templates

1. Locate template object in `templateData.js`
2. Modify code, description, or metadata
3. Save file
4. Changes appear immediately (with page refresh)

### Removing Templates

1. Find template in `templateData.js`
2. Delete or comment out the object
3. Save file
4. Template removed from library

---

## Security & Best Practices

### Password Security

✅ **Do:**
- Use unique, strong passwords
- Change password every 90 days
- Use password manager
- Enable two-factor authentication (when available)

❌ **Don't:**
- Share credentials
- Use common passwords ("password123")
- Store passwords in plain text
- Reuse passwords across sites

### Session Management

- **Always logout** when finished
- **Never share** JWT tokens
- **Check URL**: Ensure https:// in production
- **Private computer**: Don't save passwords on shared machines

### Data Protection

**Client Information:**
- Treat as confidential
- Don't export unnecessarily
- Secure backups
- Delete old data per retention policy

**GDPR Compliance:**
- Obtain consent before storing data
- Provide data export on request
- Honor deletion requests
- Maintain audit logs

### Backup Procedures

**Recommended Schedule:**
- **Daily**: Automatic database backups
- **Weekly**: Manual export to CSV
- **Monthly**: Full system backup
- **Before major updates**: Create snapshot

**How to Backup:**
1. Export all clients to CSV
2. Export all projects to JSON
3. Save to secure location (encrypted drive)
4. Test restore procedure quarterly

### Access Control

**Current System:**
- All registered users = admin access
- Single-user system recommended for v1.0
- Multi-user roles coming in v2.0

**Best Practices:**
- Limit admin accounts to 1-2 people
- Create separate accounts (don't share)
- Review access logs regularly
- Remove unused accounts

---

## Troubleshooting

### Can't Log In

**Problem:** "Invalid credentials" error

**Solutions:**
1. Verify email spelling (case-sensitive)
2. Check caps lock for password
3. Try password reset (if implemented)
4. Clear browser cache and cookies
5. Try different browser
6. Check server is running (`npm run dev`)

### Session Expired

**Problem:** Logged out unexpectedly

**Cause:** JWT token expired (7 days)

**Solution:**
1. Simply log in again
2. All data remains intact
3. Consider staying logged in if using private computer

### Dashboard Not Loading

**Problem:** Blank screen or errors

**Checks:**
1. **JavaScript enabled?** Check browser settings
2. **Server running?** Terminal should show "Server running on port 3000"
3. **Database initialized?** Look for "Database initialized successfully" message
4. **Browser console:** Press F12, check for errors
5. **Network tab:** Check if API calls are failing

**Common Fixes:**
- Restart server: Stop and run `npm run dev`
- Clear browser cache: Ctrl+Shift+Delete
- Update browser to latest version
- Disable browser extensions (ad blockers can interfere)

### Can't Add/Edit Client

**Problem:** "Save" button doesn't work

**Checks:**
1. All required fields filled? (Name, Email)
2. Email format valid? (must include @)
3. Phone format correct? (XXX-XXX-XXXX optional)
4. Server responding? (check network tab)

**Solutions:**
- Refresh page and try again
- Check browser console for validation errors
- Verify server logs for error messages
- Test with minimal data (just name and email)

### Data Not Saving

**Problem:** Changes disappear after refresh

**Possible Causes:**
1. Database file locked
2. Permission issues
3. Server crashed
4. Disk space full

**Solutions:**
1. Check server logs for errors
2. Restart server
3. Verify `data/database.sqlite` exists and is writable
4. Check disk space: `df -h` (Linux/Mac) or `dir` (Windows)

### Export Not Working

**Problem:** No file downloads when clicking "Export"

**Solutions:**
1. Check browser pop-up blocker settings
2. Allow downloads from this site
3. Try different browser
4. Check Downloads folder (may already be there)
5. Try different export format (CSV vs JSON)

### Server Errors (500)

**Problem:** "Internal server error" messages

**Where to Look:**
1. Server terminal window - error messages appear here
2. `logs/error.log` - if logging configured
3. Browser network tab - see full error response

**Common Causes:**
- Database connection failed
- Missing environment variables
- Syntax error in recent code changes
- Node modules need reinstalling

**Solutions:**
1. Check server terminal for specific error
2. Verify `.env` file has all required variables
3. Restart server
4. Run `npm install` to ensure dependencies
5. Check recent code changes (use git log)

### Database Issues

**Problem:** "Database not found" or "Cannot open database"

**Solutions:**
1. Ensure `data/` directory exists
2. Check file permissions on `data/database.sqlite`
3. Delete database file and restart (recreates fresh)
4. Verify sql.js is installed: `npm list sql.js`

**Factory Reset Database:**
```bash
# Backup first!
cp data/database.sqlite data/database.backup.sqlite

# Delete and restart server
rm data/database.sqlite
npm run dev

# Database recreates automatically
```

---

## Advanced Features

### API Endpoints

**For developers:** All dashboard functions use REST API

**Base URL:** `http://localhost:3000/api`

**Authentication:** Include JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Endpoints:**

**Auth:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

**Clients:**
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

**Projects:**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Contact:**
- `POST /api/contact` - Submit message (public)
- `GET /api/contact` - List submissions (admin)

### Database Direct Access

**Location:** `data/database.sqlite`

**Tools:**
- DB Browser for SQLite (GUI)
- sqlite3 command line
- Any SQLite-compatible tool

**Schema:**

**users table:**
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- password (TEXT - bcrypt hashed)
- created_at (DATETIME)

**clients table:**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- company (TEXT)
- status (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

**projects table:**
- id (INTEGER PRIMARY KEY)
- client_id (INTEGER - foreign key)
- name (TEXT)
- description (TEXT)
- status (TEXT)
- start_date (DATE)
- end_date (DATE)
- budget (REAL)
- created_at (DATETIME)
- updated_at (DATETIME)

**contact_submissions table:**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT)
- project_type (TEXT)
- message (TEXT)
- status (TEXT)
- created_at (DATETIME)

---

## Keyboard Shortcuts

*Coming in v2.0*

**Planned:**
- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + N` - New client
- `Ctrl/Cmd + S` - Save (in forms)
- `Esc` - Close modals
- `Tab` - Navigate form fields
- `/` - Focus search box

---

## Getting Help

### Documentation

- **This Guide**: Admin operations reference
- **Client Guide**: `docs/CLIENT-GUIDE.md` - Public-facing help
- **README**: Project overview and setup
- **SETUP**: Deployment instructions

### Support Channels

**Internal Issues:**
- Check troubleshooting section above
- Review server logs
- Test in different browser
- Restart server

**Development Support:**
- GitHub Issues: Report bugs
- Email: dev@structuredforgrowth.com
- Documentation: Check all .md files

### Feature Requests

Have an idea? We want to hear it!

1. Check existing features first
2. Review roadmap (see README)
3. Submit GitHub issue with "Feature Request" label
4. Describe use case and expected behavior

---

## Appendix

### Keyboard & Mouse Tips

- **Double-click** table row to edit (coming soon)
- **Right-click** for context menu (coming soon)
- **Ctrl+Click** to select multiple items (coming soon)

### Browser Compatibility

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Limited Support:**
- IE 11 (not recommended)
- Older mobile browsers

### Performance Tips

- **Use search/filter** instead of scrolling long lists
- **Archive old data** to keep database lean
- **Export and backup** large datasets
- **Close unused tabs** to free resources
- **Clear browser cache** monthly

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Next Update:** v2.0 - Q2 2026

For the latest documentation, check the `/docs` folder in the project repository.
