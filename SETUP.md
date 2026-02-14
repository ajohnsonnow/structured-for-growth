# Structured For Growth - Setup Guide

## 🎉 Welcome!

This guide will walk you through setting up your Structured For Growth website and template library.

## 📋 Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** (optional, for version control)
- **Code Editor** (VS Code recommended)
- **Email Account** (for contact form functionality)

## 🚀 Quick Start

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages.

### 2. Configure Environment Variables

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit the `.env` file with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (for contact form)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@structuredforgrowth.com
EMAIL_TO=contact@structuredforgrowth.com

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database
DB_PATH=./data/database.db

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Start Development Server

```powershell
npm run dev
```

This starts both the frontend (Vite) and backend (Express) servers.

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

### 4. Access the Website

Open your browser and navigate to:

- **Main Website**: http://localhost:5173
- **Template Library**: http://localhost:5173/client/templates.html
- **Client Dashboard**: http://localhost:5173/client/dashboard.html
- **Compliance KB**: http://localhost:5173/client/compliance.html
- **Client Portal**: http://localhost:5173/client/portal.html

## 📧 Email Setup

### Gmail Configuration

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password

3. **Update .env File**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```

### Other Email Providers

For other SMTP providers (SendGrid, Mailgun, etc.):

```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

## 🔐 Security Setup

### 1. Generate JWT Secret

Use a strong, random secret key:

```powershell
# Generate a random string (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Update your `.env` file with the generated secret.

### 2. First User Account

When you first access the dashboard (http://localhost:5173/client/dashboard.html):

1. Click "Register here"
2. Create your admin account
3. Use strong credentials

## 🗄️ Database

The application uses SQLite via SQL.js (a pure JavaScript SQLite implementation - no native binaries required). The database is automatically created when you first run the server.

**Default location**: `./data/database.db`

### Database Tables

The following tables are created automatically:

- **users** - User accounts for dashboard access
- **clients** - Client management records
- **projects** - Project tracking
- **contact_submissions** - Contact form submissions

## 📱 Project Structure

```
structured-for-growth-www/
├── client/                      # Frontend files
│   ├── index.html              # Main homepage
│   ├── dashboard.html          # Client management
│   ├── templates.html          # Template library
│   ├── compliance.html         # Compliance knowledge base
│   ├── portal.html             # Client portal
│   ├── styles/                 # CSS files
│   │   ├── main.css           # Main styles
│   │   ├── components.css     # Component styles
│   │   ├── dashboard.css      # Dashboard styles
│   │   ├── templates.css      # Template page styles
│   │   ├── compliance.css     # Compliance page styles
│   │   └── portal.css         # Portal page styles
│   └── js/                     # JavaScript modules
│       ├── main.js            # Main app logic
│       ├── dashboard.js       # Dashboard functionality
│       ├── templates.js       # Template library
│       ├── compliance.js      # Compliance KB logic
│       ├── portal.js          # Client portal logic
│       ├── templateData.js    # Template data definitions
│       └── modules/           # Shared modules
├── server/                     # Backend API
│   ├── index.js               # Express server
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication
│   │   ├── clients.js         # Client management
│   │   ├── contact.js         # Contact form
│   │   ├── compliance.js      # Compliance endpoints
│   │   ├── portal.js          # Portal endpoints
│   │   ├── messages.js        # Messaging
│   │   ├── campaigns.js       # Campaign management
│   │   ├── projects.js        # Project tracking
│   │   ├── backup.js          # Backup utilities
│   │   └── demo.js            # Demo routes
│   ├── controllers/           # Business logic
│   ├── middleware/            # Custom middleware
│   └── models/                # Database models
├── templates/                  # Template library data
│   ├── templateData.js        # Template definitions
│   └── README.md              # Template docs
├── data/                       # Database & compliance data
│   └── compliance/            # Compliance frameworks
│       ├── frameworks/        # Framework definitions (JSON)
│       ├── mappings/          # Cross-framework mappings
│       └── oscal/             # OSCAL catalogs
├── logs/                       # Audit logs
├── package.json               # Dependencies
├── vite.config.js            # Vite configuration
├── render.yaml                # Render deployment config
├── .env                       # Environment variables
└── README.md                  # Project documentation
```

## 🎨 Customization

### Update Branding

1. **Colors** - Edit `client/styles/main.css`:
   ```css
   :root {
       --primary-color: #2563eb;  /* Your brand color */
       --secondary-color: #10b981;
   }
   ```

2. **Company Name** - Search and replace "Structured For Growth" in:
   - `client/index.html`
   - `client/dashboard.html`
   - `client/templates.html`

3. **Logo** - Add your logo to `client/assets/` and update HTML

### Add Projects

Update the portfolio section in `client/index.html` with your actual projects.

### Customize Templates

Edit `templates/templateData.js` to add or modify templates.

## 🚀 Deployment

### Build for Production

```powershell
npm run build
```

This creates optimized files in the `dist/` folder.

### Environment Variables

Update `.env` for production:

```env
NODE_ENV=production
JWT_SECRET=your-production-secret
# Update other settings as needed
```

### Deployment Options

#### Option 1: Traditional Hosting

1. Upload `dist/` folder and `server/` folder
2. Upload `.env` file (with production settings)
3. Install dependencies on server: `npm install --production`
4. Start server: `npm start`

#### Option 2: Platform as a Service (PaaS)

**Heroku, Railway, Render:**
- Connect your Git repository
- Set environment variables in platform dashboard
- Platform will build and deploy automatically

#### Render (Pre-configured)

The project includes a `render.yaml` for one-click Render deployment:

1. Push code to GitHub
2. Connect repository to Render
3. Render auto-detects render.yaml configuration
4. Set environment variables in Render dashboard
5. Deploy

#### Option 3: Serverless

Consider splitting frontend (Netlify/Vercel) and backend (serverless functions).

## 🔧 Maintenance

### Update Dependencies

```powershell
# Check for updates
npm outdated

# Update packages
npm update

# Update to latest major versions (careful!)
npm install package-name@latest
```

### Backup Database

```powershell
# Copy database file
Copy-Item data\database.db data\database-backup-$(Get-Date -Format 'yyyy-MM-dd').db
```

### Monitor Logs

In development, logs appear in the terminal. For production, consider:
- Winston (Node.js logging)
- PM2 (process management with logs)
- Cloud logging services

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

1. Find and kill the process:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property OwningProcess
   Stop-Process -Id [ProcessID]
   ```

2. Or change the port in `.env` and `vite.config.js`

### Email Not Sending

1. Check `.env` configuration
2. Verify app password (for Gmail)
3. Check firewall/antivirus settings
4. Review server logs for errors

### Database Errors

1. Delete `data/database.db` to start fresh
2. Restart the server to recreate tables
3. Check file permissions

### Build Errors

1. Clear node_modules: `Remove-Item node_modules -Recurse -Force`
2. Clear package-lock: `Remove-Item package-lock.json`
3. Reinstall: `npm install`

## 📚 Additional Resources

### Learning

- [Express.js Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [SQL.js Documentation](https://sql.js.org/)
- [JWT Best Practices](https://jwt.io/introduction)

### Tools

- **Database Browser**: [DB Browser for SQLite](https://sqlitebrowser.org/)
- **API Testing**: [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/)
- **Git GUI**: [GitKraken](https://www.gitkraken.com/) or [GitHub Desktop](https://desktop.github.com/)

## 🤝 Support

For issues or questions:

1. Check this documentation
2. Review the code comments
3. Check the template library README
4. Search for similar issues online

## 🎯 Next Steps

Now that you're set up:

1. ✅ Customize the homepage with your projects
2. ✅ Set up your email configuration
3. ✅ Create your first client record
4. ✅ Explore and customize templates
5. ✅ Add your own templates as you build
6. ✅ Deploy to production when ready

---

**Happy Building! 🚀**

Your template library will grow with every project, making you more efficient over time.
