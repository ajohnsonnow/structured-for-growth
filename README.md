# Structured For Growth

## Content Engineering Portfolio, Template Library & Compliance Knowledge Base

A comprehensive full-stack website showcasing Content Engineering projects with an integrated client management system, extensive template library, compliance knowledge base covering 10 regulatory frameworks, and a client portal with project tracking and payments. Features a dark forest green theme and dynamic value proposition calculator.

## 🎯 Features

### Public-Facing

- **Portfolio Showcase**: Highlights of 5 major projects demonstrating full-stack expertise
- **Template Library**: 33 production-ready code templates with search and filtering
- **Compliance Knowledge Base**: 10 regulatory frameworks (SOC 2, HIPAA, GDPR, PCI-DSS, CMMC, DORA, NIS2, ISO 27001, ISO 42001, NIST AI RMF) with cross-framework mapping, OSCAL catalogs, and evidence tracking
- **Value Proposition Calculator**: Interactive cost comparison showing savings vs traditional development teams
- **Contact Form**: Professional contact form with server-side email integration
- **Dark Forest Green Theme**: Modern, elegant dark mode design throughout

### Client Portal

- **Authenticated Client Access**: Secure login for clients to view their projects
- **Project Tracking**: Real-time project status, progress bars, and milestone tracking
- **Payment Integration**: Venmo payment link with balance-due tracking
- **Estimates & Invoicing**: View pending estimates and project costs

### Admin Dashboard

- **Authentication System**: Secure JWT-based authentication with bcrypt password hashing
- **Client Management**: Full CRUD operations for managing client relationships
- **Project Management**: Track projects, statuses, budgets, and timelines
- **Messaging System**: Threaded messaging between admin and clients
- **Campaign Management**: Email campaigns with segmentation and template support
- **Contact Submissions**: View and manage all contact form submissions
- **Database Backup**: One-click database backup and restore
- **Database**: SQL.js-powered SQLite database with automatic persistence

### Compliance Knowledge Base

- **10 Regulatory Frameworks**: Complete control catalogs with searchable metadata
- **Cross-Framework Mapping**: Matrix showing control overlap between frameworks
- **OSCAL Catalogs**: NIST-standard machine-readable catalogs for GRC tool integration
- **Evidence Tracking**: Per-control evidence requirements and collection status
- **Developer Tools**: VS Code extension, MCP server, ticketing integration, AI compliance review

### MBAi Paradigm

- **Strategic Business Templates**: 8 management-grade templates across 7 business categories
- **Three Pillars**: MBAi Paradigm, Sustainable Business, Servant Leadership
- **Template Categories**: Strategic Management, Operations, Finance, Marketing, HR, IT, GRC
- **Interactive Page**: Browse and explore templates with full JSON definitions

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

```text
structured-for-growth/
├── client/                     # Frontend application
│   ├── index.html             # Main homepage
│   ├── dashboard.html         # Admin dashboard
│   ├── templates.html         # Template library
│   ├── compliance.html        # Compliance knowledge base
│   ├── portal.html            # Client portal
│   ├── styles/                # CSS stylesheets (dark forest green theme)
│   │   ├── main.css           # Core styles & variables
│   │   ├── components.css     # Reusable component styles
│   │   ├── dashboard.css      # Dashboard-specific styles
│   │   ├── templates.css      # Template page styles
│   │   ├── compliance.css     # Compliance page styles
│   │   └── portal.css         # Client portal styles
│   ├── js/                    # JavaScript modules
│   │   ├── main.js            # Homepage logic
│   │   ├── dashboard.js       # Admin dashboard logic
│   │   ├── templates.js       # Template library logic
│   │   ├── compliance.js      # Compliance page logic
│   │   ├── portal.js          # Client portal logic
│   │   ├── templateData.js    # Template definitions
│   │   └── modules/           # Shared modules
│   │       ├── contactForm.js # Contact form handler
│   │       ├── navigation.js  # Navigation logic
│   │       └── smoothScroll.js# Smooth scrolling
│   ├── scripts/               # Client-side scripts
│   │   └── value-calculator.js# Value proposition calculator
│   └── assets/                # Images, favicon, icons
├── server/                    # Backend API
│   ├── index.js               # Express server entry point
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication (login/register)
│   │   ├── clients.js         # Client management CRUD
│   │   ├── projects.js        # Project management
│   │   ├── contact.js         # Contact form submissions
│   │   ├── compliance.js      # Compliance data API
│   │   ├── portal.js          # Client portal API
│   │   ├── messages.js        # Messaging system
│   │   ├── campaigns.js       # Email campaigns
│   │   ├── backup.js          # Database backup/restore
│   │   └── demo.js            # Demo/sandbox routes
│   ├── controllers/           # Business logic
│   │   └── contactController.js # Email sending logic
│   ├── middleware/            # Authentication & security middleware
│   │   └── auth.js            # JWT verification
│   └── models/                # Database models
│       └── database.js        # SQL.js database setup & models
├── data/                      # Data files
│   ├── compliance/            # Compliance framework data
│   │   ├── frameworks/        # 10 framework JSON files
│   │   ├── mappings/          # Cross-framework mapping data
│   │   └── oscal/             # NIST OSCAL catalog files
│   └── mbai/                  # MBAi Paradigm data
│       ├── manifest.json      # Pillar & category definitions
│       └── templates/         # 8 strategic business templates
├── templates/                 # (Empty — templates defined in client/js/templateData.js)
├── docs/                      # Documentation
│   ├── CLIENT-GUIDE.md        # User guide for clients
│   └── ADMIN-GUIDE.md         # Admin dashboard guide
├── scripts/                   # Build & deployment scripts
│   ├── audit.js               # Pre-deploy audit with versioning
│   ├── generate-docs.js       # Docs-as-Code manifest generator
│   └── setup.ps1              # First-time project setup (PowerShell)
├── logs/                      # Audit logs
├── archive/                   # Historical artifacts (not runtime)
│   ├── docs/                  # Checklists, overviews, visual guides
│   ├── scripts/               # One-time fix scripts
│   └── templates/             # Superseded template data
├── render.yaml                # Render deployment configuration
├── vite.config.js             # Vite build configuration
└── package.json               # Dependencies & scripts
```

## 🛠️ Technology Stack

### Frontend

- Vanilla JavaScript (ES6+ modules)
- HTML5 & CSS3 (Custom properties, Flexbox, Grid)
- Vite 5.0 (Build tool & dev server)
- Dark Forest Green theme
- GoatCounter (Privacy-friendly analytics)

### Backend

- Node.js (v18+)
- Express 4.18.2
- SQL.js 1.13.0 (Pure JavaScript SQLite — no native binaries)
- JWT authentication (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3 (Password hashing)
- Nodemailer 6.9.7 (Email service)

### Security

- Helmet 7.1.0 (Security headers)
- express-rate-limit 7.1.5 (Rate limiting)
- CORS 2.8.5 (Cross-origin protection)
- express-validator 7.0.1 (Input validation)

### Development

- nodemon 3.0.2 (Auto-restart)
- concurrently 8.2.2 (Run multiple servers)

## 🌐 API Endpoints

| Route                        | Description                              |
| ---------------------------- | ---------------------------------------- |
| `/api/auth`                  | Login, register, JWT authentication      |
| `/api/clients`               | Client CRUD operations                   |
| `/api/projects`              | Project management                       |
| `/api/contact`               | Contact form submissions                 |
| `/api/compliance/frameworks` | Compliance framework data (10 frameworks)|
| `/api/compliance/crossmap`   | Cross-framework control mapping          |
| `/api/compliance/oscal`      | NIST OSCAL catalog listing               |
| `/api/compliance/evidence`   | Evidence requirements matrix             |
| `/api/portal`                | Client portal data                       |
| `/api/messages`              | Threaded messaging                       |
| `/api/campaigns`             | Email campaign management                |
| `/api/backup`                | Database backup & restore                |
| `/api/demo`                  | Demo/sandbox routes                      |
| `/api/mbai`                  | MBAi Paradigm templates & manifests      |
| `/api/health`                | Health check                             |

## 📚 Template Library

The template library includes 33 production-ready templates:

### Frontend Templates

- Contact Form with validation
- Form State Manager
- Modal Component
- Toast Notifications
- Loading State Manager
- Data Table with sorting/filtering

### Backend Templates

- JWT Authentication System
- CRUD Model Pattern
- REST API Controller
- Email Service Integration

### Utility Templates

- LocalStorage Manager
- API Client Wrapper
- Validation Utilities
- Debounce/Throttle Functions
- Date/Time Utilities
- Template Documentation Generator

Each template saves 1–8 hours of development time. See [docs/CLIENT-GUIDE.md](docs/CLIENT-GUIDE.md) for detailed template information.

## 🚦 Scripts

| Command                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start development servers (frontend + API)       |
| `npm run build`        | Build for production (generates docs + Vite)     |
| `npm start`            | Run production server                            |
| `npm run predeploy`    | Generate docs + audit with version bump          |
| `npm run prepush`      | Generate docs + audit (no version bump)          |
| `npm run docs:generate`| Regenerate docs-manifest.json                    |
| `npm run audit`        | Run pre-deploy audit                             |
| `npm run audit:bump`   | Audit and bump patch version                     |
| `npm run audit:major`  | Audit and bump major version                     |
| `npm run audit:minor`  | Audit and bump minor version                     |

## 📖 Documentation

- **[CLIENT-GUIDE.md](docs/CLIENT-GUIDE.md)** — Complete user guide for browsing the site and using templates
- **[ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md)** — Dashboard administration guide
- **[SETUP.md](SETUP.md)** — Deployment and configuration instructions

> Archived reference docs (CHECKLIST.md, PROJECT-OVERVIEW.md, TEMPLATE-INVENTORY.md, SUCCESS.md, VISUAL-GUIDE.md, TEMPLATE-EXTRACTION-SUMMARY.md) are in `archive/docs/`.

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
- **Development Team**: $600–1,250/hour (3–5 developers)
- **Template Library**: 33 templates = 96+ hours saved = $40,320+ in time savings
- **Average Project Savings**: 40–60% vs traditional team approach

## 🔐 Security Features

- JWT token authentication (7-day expiration)
- bcrypt password hashing (bcryptjs)
- Rate limiting (100 requests / 15 minutes)
- Input validation on all forms
- CORS protection
- Security headers (Helmet)
- SQL injection prevention (parameterized queries)

## 🚀 Deployment

The project is configured for **Render** deployment via [render.yaml](render.yaml). It also works on Railway, Heroku, Fly.io, or any Node.js-capable host.

```bash
# Production build
npm run build

# Start production server
NODE_ENV=production npm start
```

See [SETUP.md](SETUP.md) for full deployment instructions.

## 📧 Contact

For inquiries, use the contact form on the website or reach out directly at <contact@structuredforgrowth.com>

---

**Version**: 1.4.8  
**Last Updated**: February 2026  
*Built with ❤️ by Structured For Growth*
