# Structured For Growth

**Content Engineering Portfolio & Template Library**

A comprehensive full-stack website showcasing Content Engineering projects with an integrated client management system and extensive template library. Features a dark forest green theme and dynamic value proposition calculator.

## 🎯 Features

### Public-Facing
- **Portfolio Showcase**: Highlights of 5 major projects demonstrating full-stack expertise
- **Template Library**: 16+ production-ready code templates with search and filtering
- **Value Proposition Calculator**: Interactive cost comparison showing savings vs traditional development teams
- **Contact Form**: Professional contact form with server-side email integration
- **Dark Forest Green Theme**: Modern, elegant dark mode design throughout

### Admin Dashboard
- **Authentication System**: Secure JWT-based authentication with bcrypt password hashing
- **Client Management**: Full CRUD operations for managing client relationships
- **Project Management**: Track projects, statuses, budgets, and timelines
- **Contact Submissions**: View and manage all contact form submissions
- **Database**: SQL.js-powered database with automatic persistence

### Developer Tools
- **Pre-Deploy Audit**: Comprehensive audit script with automatic versioning
- **User Guides**: Complete documentation for clients and administrators
- **Template System**: Modular, reusable code patterns for rapid development

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
structured-for-growth-www/
├── client/                 # Frontend application
│   ├── index.html         # Main homepage
│   ├── dashboard.html     # Admin dashboard
│   ├── templates.html     # Template library
│   ├── styles/            # CSS stylesheets (dark forest green theme)
│   ├── scripts/           # JavaScript modules
│   └── assets/            # Images, favicon, icons
├── server/                # Backend API
│   ├── index.js           # Express server
│   ├── routes/            # API routes (auth, clients, projects, contact)
│   ├── controllers/       # Business logic
│   ├── middleware/        # Authentication & security middleware
│   └── models/            # Database models (sql.js)
├── templates/             # Reusable code templates library (16+)
│   ├── templateData.js    # Template definitions
│   └── README.md          # Template documentation
├── docs/                  # Documentation
│   ├── CLIENT-GUIDE.md    # User guide for clients
│   └── ADMIN-GUIDE.md     # Admin dashboard guide
├── scripts/               # Build & deployment scripts
│   └── audit.js           # Pre-deploy audit with versioning
├── data/                  # Database storage (SQLite)
└── logs/                  # Audit logs

```

## 🛠️ Technology Stack

**Frontend**
- Vanilla JavaScript (ES6+ modules)
- HTML5 & CSS3 (Custom properties, Grid, Flexbox)
- Vite 5.0 (Build tool & dev server)
- Dark Forest Green theme

**Backend**
- Node.js 25.2.1
- Express 4.18.2
- SQL.js 1.13.0 (Pure JavaScript SQLite)
- JWT authentication (jsonwebtoken 9.0.2)
- bcrypt 5.1.1 (Password hashing)
- Nodemailer 6.9.7 (Email service)

**Security**
- Helmet 7.1.0 (Security headers)
- express-rate-limit 7.1.5 (Rate limiting)
- CORS 2.8.5 (Cross-origin protection)
- express-validator 7.0.1 (Input validation)

**Development**
- nodemon 3.0.2 (Auto-restart)
- concurrently 8.2.2 (Run multiple servers)
- GoatCounter (Analytics)

## 📚 Template Library

The template library includes 16+ production-ready templates:

**Frontend Templates**
- Contact Form with validation
- Form State Manager
- Modal Component
- Toast Notifications
- Loading State Manager
- Data Table with sorting/filtering

**Backend Templates**
- JWT Authentication System
- CRUD Model Pattern
- REST API Controller
- Email Service Integration

**Utility Templates**
- LocalStorage Manager
- API Client Wrapper
- Validation Utilities
- Debounce/Throttle Functions
- Date/Time Utilities
- Template Documentation Generator

Each template saves 1-8 hours of development time. See `docs/CLIENT-GUIDE.md` for detailed template information.

## 🚦 Scripts

- `npm run dev` - Start development servers (frontend + backend)
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run audit` - Run pre-deploy audit
- `npm run audit:bump` - Audit and bump patch version
- `npm run audit:major` - Audit and bump major version
- `npm run audit:minor` - Audit and bump minor version

## 📖 Documentation

- **[CLIENT-GUIDE.md](docs/CLIENT-GUIDE.md)** - Complete user guide for browsing the site and using templates
- **[ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md)** - Dashboard administration guide
- **[SETUP.md](SETUP.md)** - Deployment and configuration instructions
- **[TEMPLATE-INVENTORY.md](TEMPLATE-INVENTORY.md)** - Complete template catalog

## 🎨 Theme

The site features a custom dark forest green theme:
- Primary: Dark forest green (#3d7a5f)
- Accent: Moss green (#9dbd7e)
- Highlights: Amber (#d4a574)
- Backgrounds: Deep forest tones
- Complimentary earth tones throughout

## 💰 Value Proposition

The homepage features an interactive calculator showing real cost savings:
- **Solo Expert**: $420/hour
- **Development Team**: $600-1,250/hour (3-5 developers)
- **Template Library**: 16+ templates = 48+ hours saved = $20,160+ in time savings
- **Average Project Savings**: 40-60% vs traditional team approach

## 🔐 Security Features

- JWT token authentication (7-day expiration)
- bcrypt password hashing
- Rate limiting (100 requests/15 minutes)
- Input validation on all forms
- CORS protection
- Security headers (Helmet)
- SQL injection prevention

## 📧 Contact

For inquiries, use the contact form on the website or reach out directly at contact@structuredforgrowth.com

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
*Built with ❤️ by Structured For Growth*
