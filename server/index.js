import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './lib/logger.js';
import { csrfProtection, csrfToken } from './middleware/csrf.js';
import { requestId } from './middleware/requestId.js';

// P5.1 — Architecture Modernization
import { validateEnvOrDie } from './lib/envConfig.js';
import { problemDetailsHandler } from './lib/problemDetails.js';
import { runMigrations } from './migrations/index.js';

// Import routes
import { breadcrumbMiddleware, errorMonitorMiddleware } from './lib/errorMonitor.js';
import { pivCacAuth } from './middleware/pivCac.js';
import { zeroTrustEnforce } from './middleware/zeroTrust.js';
import accessibilityRoutes from './routes/accessibility.js';
import aiRoutes from './routes/ai.js';
import apiDocsRoutes from './routes/api-docs.js';
import authRoutes from './routes/auth.js';
import backupRoutes from './routes/backup.js';
import campaignRoutes from './routes/campaigns.js';
import clientRoutes from './routes/clients.js';
import complianceEngineRoutes from './routes/compliance-engine.js';
import complianceRoutes from './routes/compliance.js';
import contactRoutes from './routes/contact.js';
import demoRoutes from './routes/demo.js';
import errorMonitorRoutes from './routes/error-monitor.js';
import fedRampRoutes from './routes/fedramp.js';
import mbaiRoutes from './routes/mbai.js';
import messageRoutes from './routes/messages.js';
import mfaRoutes from './routes/mfa.js';
import portalRoutes from './routes/portal.js';
import projectRoutes from './routes/projects.js';
import recordsRoutes from './routes/records.js';
import usaceRoutes from './routes/usace.js';

// Import database initialization
import { initializeDatabase } from './models/database.js';

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger('server');

// P5.1.10 — Validate environment variables on startup
try {
  const envConfig = validateEnvOrDie();
  const envCount = Object.keys(envConfig).filter((k) => envConfig[k] !== undefined).length;
  logger.info(`Environment validated: ${envCount} vars configured`);
} catch (err) {
  // validateEnvOrDie already logs errors and exits in production.
  // In development, we continue with defaults — log the warning.
  logger.warn(`Environment validation: ${err.message}`);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render and other PaaS platforms
app.set('trust proxy', 1);

// Initialize database
await initializeDatabase();

// P5.1.3 — Run database migrations after DB init
try {
  const migrationResult = runMigrations();
  logger.info(
    `Migrations: ${migrationResult.applied.length} applied, ${migrationResult.skipped.length} skipped`
  );
} catch (err) {
  logger.error(`Migration error: ${err.message}`);
  // Non-fatal — migrations may fail on first run if DB schema already exists
}

// P3.1.2 — Request ID middleware (correlation IDs)
app.use(requestId);

// P3.1.7 — Breadcrumb tracking for error monitoring
app.use(breadcrumbMiddleware);

// P1.2.1 — Content Security Policy (enabled and configured)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://gc.zgo.at', 'https://cdn.jsdelivr.net'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdn.jsdelivr.net',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://structured-for-growth.goatcounter.com'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow loading cross-origin resources
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Serve favicon from client assets
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/assets/favicon.svg'), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
});

// Silently handle Chrome DevTools .well-known probe
app.use('/.well-known', (req, res) => {
  res.status(204).end();
});

// Cookie parser for CSRF tokens
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// P1.2.5 — Request body size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// P3.1.3 — HTTP access logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.id,
    });
  });
  next();
});

// CSRF token endpoint (GET) and protection (state-changing routes)
app.get('/api/csrf-token', csrfToken);

// P1.2.3 — CSRF protection on all state-changing API requests
// Skips GET/HEAD/OPTIONS and Bearer-authenticated requests automatically
app.use('/api/', csrfProtection);

// P4.4.2 — PIV/CAC smart card authentication (reads client cert headers)
app.use(pivCacAuth);

// P4.4.1 — Zero Trust enforcement (continuous trust evaluation)
// Scoped to API routes — HTML pages and static assets are public.
// Auth is enforced when pages make /api/* calls, not on page load.
app.use('/api', zeroTrustEnforce);

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/mbai', mbaiRoutes);
app.use('/api/docs', apiDocsRoutes);
app.use('/api/auth/mfa', mfaRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/compliance-engine', complianceEngineRoutes);
app.use('/api/errors', errorMonitorRoutes);

// P4 — Advanced Capability Routes
app.use('/api/ai', aiRoutes);
app.use('/api/usace', usaceRoutes);
app.use('/api/accessibility', accessibilityRoutes);
app.use('/api/fedramp', fedRampRoutes);

// P6.1 — Glossary API (serves glossary.json for tooltips / auto-detect)
app.get('/api/glossary', (_req, res) => {
  const glossaryPath = path.join(__dirname, '../data/glossary/glossary.json');
  res.sendFile(glossaryPath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load glossary data' });
    }
  });
});

// Skills API (serves skills.json for the interactive skills web page)
app.get('/api/skills', (_req, res) => {
  const skillsPath = path.join(__dirname, '../data/skills/skills.json');
  res.sendFile(skillsPath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load skills data' });
    }
  });
});

// Also serve skills.json at /data/skills/skills.json for Vite dev proxy
app.get('/data/skills/skills.json', (_req, res) => {
  const skillsPath = path.join(__dirname, '../data/skills/skills.json');
  res.sendFile(skillsPath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load skills data' });
    }
  });
});

// Also serve glossary.json at /data/glossary/glossary.json for Vite dev proxy
app.get('/data/glossary/glossary.json', (_req, res) => {
  const glossaryPath = path.join(__dirname, '../data/glossary/glossary.json');
  res.sendFile(glossaryPath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load glossary data' });
    }
  });
});

// P5.1.6 — Health check endpoints (Kubernetes-style probes)
// /healthz — basic liveness (is the process running?)
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// /livez — liveness probe (can the server accept requests?)
app.get('/livez', (_req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// /readyz — readiness probe (are all dependencies available?)
app.get('/readyz', (_req, res) => {
  try {
    // Check database connectivity
    const dbReady = typeof initializeDatabase === 'function';
    if (!dbReady) {
      return res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
    }
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: { database: 'ok', server: 'ok' },
    });
  } catch {
    res.status(503).json({ status: 'not ready', reason: 'health check failed' });
  }
});

// /api/health — detailed health (backward compatible)
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.8.1',
    requestId: req.id,
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // P1.2.4 — Cookie security flags
  app.use((req, res, next) => {
    res.cookie('_sfg_session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    next();
  });

  // Serve static assets
  app.use(express.static(path.join(__dirname, '../dist')));

  // Handle client-side routing
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/dashboard.html'));
  });

  app.get('/templates', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/templates.html'));
  });

  app.get('/portal', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/portal.html'));
  });

  app.get('/compliance', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/compliance.html'));
  });

  app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/docs.html'));
  });

  app.get('/mbai', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/mbai.html'));
  });

  app.get('/glossary', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/glossary.html'));
  });

  app.get('/skills', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/skills.html'));
  });

  // Catch-all route for main page
  app.get('*', (req, res) => {
    // Don't catch API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Development: serve client files directly + redirect to Vite for HMR
if (process.env.NODE_ENV !== 'production') {
  // Serve static assets (CSS, JS, images) from client/ so pages render
  app.use('/styles', express.static(path.join(__dirname, '../client/styles')));
  app.use('/js', express.static(path.join(__dirname, '../client/js')));
  app.use('/assets', express.static(path.join(__dirname, '../client/assets')));

  // Dev page routes — serve HTML directly so pages work on port 3000
  const devPages = [
    'dashboard',
    'templates',
    'portal',
    'compliance',
    'docs',
    'mbai',
    'glossary',
    'skills',
    'offline',
  ];
  for (const page of devPages) {
    app.get(`/${page}`, (_req, res) => {
      res.sendFile(path.join(__dirname, `../client/${page}.html`));
    });
  }

  // Root redirect to Vite (for HMR / live reload)
  app.get('/', (_req, res) => {
    res.redirect('http://localhost:5173');
  });

  // SPA fallback for unknown non-API routes in dev
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Try to serve matching .html file
    const htmlPath = path.join(__dirname, `../client${req.path}.html`);
    res.sendFile(htmlPath, (err) => {
      if (err) {
        next();
      }
    });
  });
}

// Catch-all 404 for unmatched routes (ensures Helmet CSP headers are applied)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.status(404).json({ success: false, message: 'Not found' });
});

// P3.1.7 — Error monitoring middleware (captures errors with context)
app.use(errorMonitorMiddleware);

// P5.1.4 — RFC 7807 Problem Details error handler
// Converts AppError subclasses into structured JSON responses.
// Falls back to generic 500 for unexpected errors.
app.use(problemDetailsHandler);

// P1.2.6 — Graceful shutdown handling
// eslint-disable-next-line prefer-const
let server;
function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API available at http://localhost:${PORT}/api`);
  logger.info(`API docs at http://localhost:${PORT}/api/docs`);
});

export default app;
