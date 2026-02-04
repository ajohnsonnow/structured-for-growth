# Structured For Growth

**Content Engineering Portfolio & Template Library**

A comprehensive website showcasing Content Engineering projects and providing a rich library of reusable templates and code snippets.

## 🎯 Features

- **Portfolio Showcase**: Highlights of projects including Vet-Rate-Org, Customer-Management-System, Firearm-Safety-Team, Queer-Alliance-Network, and Fernhill-Community
- **Contact Form**: Professional contact form with email integration
- **Client Management System**: Secure dashboard for managing client relationships
- **Template Library**: Extensive collection of reusable code templates and components

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
│   ├── index.html         # Entry point
│   ├── styles/            # CSS stylesheets
│   ├── js/                # JavaScript modules
│   └── assets/            # Images, icons, etc.
├── server/                # Backend API
│   ├── index.js           # Express server
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── middleware/        # Custom middleware
│   └── models/            # Data models
├── templates/             # Reusable code templates library
│   ├── components/        # UI components
│   ├── patterns/          # Design patterns
│   ├── integrations/      # Third-party integrations
│   └── documentation/     # Template documentation
└── data/                  # Database and storage

```

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Email**: Nodemailer
- **Authentication**: JWT

## 📚 Template Library

The template library includes:
- Form components (contact, registration, validation)
- Authentication patterns
- Database models and queries
- API endpoint templates
- UI components
- Email templates
- And much more!

## 📧 Contact

For inquiries, use the contact form on the website or reach out directly.

---

*Built with ❤️ by Structured For Growth*
