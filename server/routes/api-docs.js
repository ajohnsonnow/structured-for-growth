/**
 * API Documentation Route (P2.5)
 * Serves OpenAPI 3.0 specification and Swagger UI
 *
 * Standard: OpenAPI 3.0, IEEE 1063
 */
import express from 'express';

const router = express.Router();

/* ------------------------------------------------------------------ */
/*  Reusable response helpers                                         */
/* ------------------------------------------------------------------ */
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const jsonBody = (schema, example) => ({
  content: { 'application/json': { schema, ...(example ? { example } : {}) } },
});
const successMsg = (desc, extra = {}, example) => ({
  description: desc,
  ...jsonBody(
    {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string' },
        ...extra,
      },
    },
    example
  ),
});
const errRef = (desc) => ({ description: desc, ...jsonBody(ref('Error')) });

/* ------------------------------------------------------------------ */
/*  OpenAPI 3.0 Specification                                         */
/* ------------------------------------------------------------------ */
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Structured For Growth API',
    version: '1.8.1',
    description:
      'REST API for the Structured For Growth platform — CRM, client portal, template library, compliance knowledge base, and MBAi methodology.',
    contact: {
      name: 'Structured For Growth',
      email: 'contact@structuredforgrowth.com',
      url: 'https://structuredforgrowth.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [{ url: '/api', description: 'Current environment' }],

  /* ================================================================ */
  /*  Components                                                      */
  /* ================================================================ */
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/auth/login',
      },
      portalAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Portal JWT token obtained from /api/portal/login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
        example: { success: false, message: 'An error occurred' },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                msg: { type: 'string' },
                path: { type: 'string' },
                location: { type: 'string' },
              },
            },
          },
        },
        example: {
          success: false,
          message: 'Validation failed',
          errors: [{ type: 'field', msg: 'Email is required', path: 'email', location: 'body' }],
        },
      },
      ComplianceError: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          detail: { type: 'string' },
        },
        example: { error: 'Internal server error', detail: 'File read failed' },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' },
        },
        example: { total: 42, limit: 100, offset: 0 },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'user'] },
          is_active: { type: 'integer', enum: [0, 1] },
          created_at: { type: 'string', format: 'date-time' },
          last_login: { type: 'string', format: 'date-time' },
        },
        example: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          is_active: 1,
          created_at: '2025-01-01T00:00:00.000Z',
          last_login: '2025-06-01T12:30:00.000Z',
        },
      },
      Client: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          company: { type: 'string' },
          website: { type: 'string' },
          address: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'lead'] },
          notes: { type: 'string' },
          monthly_retainer: { type: 'number' },
          contract_start: { type: 'string', format: 'date' },
          contract_end: { type: 'string', format: 'date' },
          created_at: { type: 'string', format: 'date-time' },
        },
        example: {
          id: 1,
          name: 'Jane Doe',
          email: 'jane@acme.com',
          phone: '555-0100',
          company: 'Acme Corp',
          website: 'https://acme.com',
          address: '123 Main St',
          status: 'active',
          notes: 'Key account',
          monthly_retainer: 5000,
          contract_start: '2025-01-01',
          contract_end: '2025-12-31',
          created_at: '2025-01-01T00:00:00.000Z',
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          client_id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: {
            type: 'string',
            enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
          },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          budget: { type: 'number' },
          hours_estimated: { type: 'integer' },
          hours_actual: { type: 'integer' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
        },
        example: {
          id: 1,
          client_id: 1,
          title: 'Website Redesign',
          description: 'Complete rebrand and rebuild',
          status: 'in-progress',
          priority: 'high',
          budget: 15000,
          hours_estimated: 200,
          hours_actual: 85,
          start_date: '2025-02-01',
          end_date: '2025-06-30',
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          project_id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: {
            type: 'string',
            enum: ['pending', 'in-progress', 'completed', 'cancelled'],
          },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          due_date: { type: 'string', format: 'date' },
        },
        example: {
          id: 1,
          project_id: 1,
          title: 'Design mockups',
          description: 'Create high-fidelity mockups',
          status: 'in-progress',
          priority: 'high',
          due_date: '2025-03-15',
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          client_id: { type: 'integer' },
          user_id: { type: 'integer' },
          direction: { type: 'string', enum: ['inbound', 'outbound'] },
          subject: { type: 'string' },
          content: { type: 'string' },
          sent_via: { type: 'string', enum: ['email', 'sms', 'portal'] },
          read_at: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
        },
        example: {
          id: 1,
          client_id: 1,
          user_id: 1,
          direction: 'outbound',
          subject: 'Project update',
          content: 'Here is your weekly status update.',
          sent_via: 'email',
          read_at: null,
          created_at: '2025-06-01T14:00:00.000Z',
        },
      },
      Campaign: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          subject: { type: 'string' },
          content: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'scheduled', 'sent'] },
          sent_count: { type: 'integer' },
          open_count: { type: 'integer' },
          click_count: { type: 'integer' },
        },
        example: {
          id: 1,
          name: 'Summer Newsletter',
          subject: "What's new this quarter",
          content: '<h1>Summer Updates</h1>',
          status: 'draft',
          sent_count: 0,
          open_count: 0,
          click_count: 0,
        },
      },
      TimeEntry: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          project_id: { type: 'integer' },
          user_id: { type: 'integer' },
          hours: { type: 'number' },
          description: { type: 'string' },
          entry_date: { type: 'string', format: 'date' },
          billable: { type: 'boolean' },
        },
        example: {
          id: 1,
          project_id: 1,
          user_id: 1,
          hours: 2.5,
          description: 'Frontend development',
          entry_date: '2025-06-01',
          billable: true,
        },
      },
    },
  },
  /* ================================================================ */
  /*  Paths                                                           */
  /* ================================================================ */
  paths: {
    /* -------------------------------------------------------------- */
    /*  System                                                        */
    /* -------------------------------------------------------------- */
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Server is healthy',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                  timestamp: { type: 'string', format: 'date-time' },
                  version: { type: 'string' },
                  requestId: { type: 'string', format: 'uuid' },
                },
              },
              {
                status: 'ok',
                timestamp: '2025-06-01T12:00:00.000Z',
                version: '1.8.1',
                requestId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              }
            ),
          },
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Authentication                                                */
    /* -------------------------------------------------------------- */
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', minLength: 3 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
              example: {
                username: 'newuser',
                email: 'user@example.com',
                password: 'securePassword123',
              },
            },
          },
        },
        responses: {
          201: successMsg(
            'User registered successfully',
            {
              userId: { type: 'integer' },
            },
            {
              success: true,
              message: 'User registered successfully',
              userId: 5,
            }
          ),
          400: { description: 'Validation error', ...jsonBody(ref('ValidationError')) },
          409: errRef('Username or email already exists'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
              example: { username: 'admin', password: 'securePassword123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  token: { type: 'string' },
                  user: ref('User'),
                },
              },
              {
                success: true,
                message: 'Login successful',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
              }
            ),
          },
          401: errRef('Invalid credentials'),
        },
      },
    },
    '/auth/verify': {
      get: {
        tags: ['Authentication'],
        summary: 'Verify JWT token validity',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Token is valid',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  user: ref('User'),
                },
              },
              {
                success: true,
                user: { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
              }
            ),
          },
          401: errRef('Invalid or expired token'),
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  user: ref('User'),
                },
              },
              {
                success: true,
                user: {
                  id: 1,
                  username: 'admin',
                  email: 'admin@example.com',
                  role: 'admin',
                  created_at: '2025-01-01T00:00:00.000Z',
                  last_login: '2025-06-01T12:30:00.000Z',
                },
              }
            ),
          },
          404: errRef('User not found'),
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: successMsg(
            'Password changed successfully',
            {},
            {
              success: true,
              message: 'Password changed successfully',
            }
          ),
          401: errRef('Current password is incorrect'),
          404: errRef('User not found'),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Admin – Users                                                 */
    /* -------------------------------------------------------------- */
    '/auth/users': {
      get: {
        tags: ['Admin - Users'],
        summary: 'List all users (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Users list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  users: { type: 'array', items: ref('User') },
                },
              },
              {
                success: true,
                users: [
                  {
                    id: 1,
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin',
                    client_id: null,
                    is_active: 1,
                    created_at: '2025-01-01T00:00:00.000Z',
                    last_login: '2025-06-01T12:30:00.000Z',
                    client_name: null,
                  },
                ],
              }
            ),
          },
          403: errRef('Admin access required'),
        },
      },
      post: {
        tags: ['Admin - Users'],
        summary: 'Create a new user (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', minLength: 3 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['admin', 'user'] },
                  client_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          201: successMsg(
            'User created successfully',
            {
              userId: { type: 'integer' },
            },
            {
              success: true,
              message: 'User created successfully',
              userId: 6,
            }
          ),
          400: { description: 'Validation error', ...jsonBody(ref('ValidationError')) },
          409: errRef('Username or email already exists'),
        },
      },
    },
    '/auth/users/{id}': {
      put: {
        tags: ['Admin - Users'],
        summary: 'Update user (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['admin', 'user'] },
                  is_active: { type: 'integer', enum: [0, 1] },
                  client_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          200: successMsg(
            'User updated successfully',
            {
              user: ref('User'),
            },
            {
              success: true,
              message: 'User updated successfully',
              user: {
                id: 2,
                username: 'editor',
                email: 'editor@example.com',
                role: 'user',
                client_id: null,
                is_active: 1,
              },
            }
          ),
          400: errRef('No fields to update / Cannot demote yourself'),
          404: errRef('User not found'),
        },
      },
      delete: {
        tags: ['Admin - Users'],
        summary: 'Delete user (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: successMsg(
            'User deleted successfully',
            {},
            {
              success: true,
              message: 'User deleted successfully',
            }
          ),
          400: errRef('Cannot delete yourself'),
          404: errRef('User not found'),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Clients                                                       */
    /* -------------------------------------------------------------- */
    '/clients': {
      get: {
        tags: ['Clients'],
        summary: 'List clients with search and filtering',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: {
            description: 'Clients list with pagination',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  clients: { type: 'array', items: ref('Client') },
                  pagination: ref('Pagination'),
                },
              },
              {
                success: true,
                clients: [
                  {
                    id: 1,
                    name: 'Jane Doe',
                    email: 'jane@acme.com',
                    company: 'Acme Corp',
                    status: 'active',
                    created_by_username: 'admin',
                    project_count: 3,
                  },
                ],
                pagination: { total: 1, limit: 100, offset: 0 },
              }
            ),
          },
        },
      },
      post: {
        tags: ['Clients'],
        summary: 'Create a new client',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('Client'),
              example: {
                name: 'Jane Doe',
                email: 'jane@acme.com',
                phone: '555-0100',
                company: 'Acme Corp',
                status: 'active',
              },
            },
          },
        },
        responses: {
          201: successMsg(
            'Client created successfully',
            {
              client: ref('Client'),
            },
            {
              success: true,
              message: 'Client created successfully',
              client: {
                id: 2,
                name: 'Jane Doe',
                email: 'jane@acme.com',
                company: 'Acme Corp',
                status: 'active',
              },
            }
          ),
          400: { description: 'Validation error', ...jsonBody(ref('ValidationError')) },
        },
      },
    },
    '/clients/stats/overview': {
      get: {
        tags: ['Clients'],
        summary: 'Get client and revenue statistics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard statistics',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  stats: {
                    type: 'object',
                    properties: {
                      totalClients: { type: 'integer' },
                      activeClients: { type: 'integer' },
                      totalProjects: { type: 'integer' },
                      activeProjects: { type: 'integer' },
                      monthlyRevenue: { type: 'number' },
                      retainerClients: { type: 'integer' },
                      projectRevenue: { type: 'number' },
                      oneOffProjects: { type: 'integer' },
                      completedRevenue: { type: 'number' },
                      newThisMonth: { type: 'integer' },
                    },
                  },
                },
              },
              {
                success: true,
                stats: {
                  totalClients: 12,
                  activeClients: 8,
                  totalProjects: 24,
                  activeProjects: 10,
                  monthlyRevenue: 42000,
                  retainerClients: 5,
                  projectRevenue: 120000,
                  oneOffProjects: 6,
                  completedRevenue: 85000,
                  newThisMonth: 2,
                },
              }
            ),
          },
        },
      },
    },
    '/clients/{id}': {
      get: {
        tags: ['Clients'],
        summary: 'Get client by ID with projects and activity',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Client details with projects',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  client: {
                    allOf: [
                      ref('Client'),
                      {
                        type: 'object',
                        properties: {
                          created_by_username: { type: 'string' },
                          projects: { type: 'array', items: ref('Project') },
                          activity: { type: 'array', items: { type: 'object' } },
                        },
                      },
                    ],
                  },
                },
              },
              {
                success: true,
                client: {
                  id: 1,
                  name: 'Jane Doe',
                  email: 'jane@acme.com',
                  company: 'Acme Corp',
                  status: 'active',
                  created_by_username: 'admin',
                  projects: [{ id: 1, title: 'Website Redesign', status: 'in-progress' }],
                  activity: [],
                },
              }
            ),
          },
          404: errRef('Client not found'),
        },
      },
      put: {
        tags: ['Clients'],
        summary: 'Update client',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: ref('Client') } },
        },
        responses: {
          200: successMsg(
            'Client updated successfully',
            {
              client: ref('Client'),
            },
            {
              success: true,
              message: 'Client updated successfully',
              client: { id: 1, name: 'Jane Doe', email: 'jane@acme.com', status: 'active' },
            }
          ),
          400: errRef('No fields to update'),
          404: errRef('Client not found'),
        },
      },
      delete: {
        tags: ['Clients'],
        summary: 'Delete client',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: successMsg(
            'Client deleted successfully',
            {},
            {
              success: true,
              message: 'Client deleted successfully',
            }
          ),
          404: errRef('Client not found'),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Projects                                                      */
    /* -------------------------------------------------------------- */
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects with filtering',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'client_id', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Projects list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  projects: {
                    type: 'array',
                    items: {
                      allOf: [
                        ref('Project'),
                        {
                          type: 'object',
                          properties: {
                            client_name: { type: 'string' },
                            client_company: { type: 'string' },
                            task_count: { type: 'integer' },
                            tasks_completed: { type: 'integer' },
                          },
                        },
                      ],
                    },
                  },
                },
              },
              {
                success: true,
                projects: [
                  {
                    id: 1,
                    client_id: 1,
                    title: 'Website Redesign',
                    status: 'in-progress',
                    client_name: 'Jane Doe',
                    client_company: 'Acme Corp',
                    task_count: 5,
                    tasks_completed: 2,
                  },
                ],
              }
            ),
          },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('Project'),
              example: {
                client_id: 1,
                title: 'Website Redesign',
                description: 'Complete rebrand',
                status: 'planning',
                priority: 'high',
                budget: 15000,
              },
            },
          },
        },
        responses: {
          201: successMsg(
            'Project created successfully',
            {
              project: ref('Project'),
            },
            {
              success: true,
              message: 'Project created successfully',
              project: { id: 2, client_id: 1, title: 'Website Redesign', status: 'planning' },
            }
          ),
          404: errRef('Client not found'),
        },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project with tasks and time entries',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Project details with tasks and time entries',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  project: {
                    allOf: [
                      ref('Project'),
                      {
                        type: 'object',
                        properties: {
                          client_name: { type: 'string' },
                          client_email: { type: 'string' },
                          client_company: { type: 'string' },
                          tasks: { type: 'array', items: ref('Task') },
                          timeEntries: { type: 'array', items: ref('TimeEntry') },
                          totalHours: { type: 'number' },
                        },
                      },
                    ],
                  },
                },
              },
              {
                success: true,
                project: {
                  id: 1,
                  client_id: 1,
                  title: 'Website Redesign',
                  status: 'in-progress',
                  client_name: 'Jane Doe',
                  client_email: 'jane@acme.com',
                  client_company: 'Acme Corp',
                  tasks: [{ id: 1, title: 'Design mockups', status: 'completed' }],
                  timeEntries: [
                    { id: 1, hours: 2.5, description: 'Frontend dev', entry_date: '2025-06-01' },
                  ],
                  totalHours: 85,
                },
              }
            ),
          },
          404: errRef('Project not found'),
        },
      },
      put: {
        tags: ['Projects'],
        summary: 'Update project',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: ref('Project') } },
        },
        responses: {
          200: successMsg(
            'Project updated successfully',
            {
              project: ref('Project'),
            },
            {
              success: true,
              message: 'Project updated successfully',
              project: { id: 1, title: 'Website Redesign', status: 'completed' },
            }
          ),
          400: errRef('No fields to update'),
          404: errRef('Project not found'),
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: successMsg(
            'Project deleted successfully',
            {},
            {
              success: true,
              message: 'Project deleted successfully',
            }
          ),
          404: errRef('Project not found'),
        },
      },
    },
    '/projects/{projectId}/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create task for project',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('Task'),
              example: {
                title: 'Design mockups',
                description: 'Create high-fidelity mockups for homepage',
                priority: 'high',
                due_date: '2025-03-15',
              },
            },
          },
        },
        responses: {
          201: successMsg(
            'Task created successfully',
            {
              task: ref('Task'),
            },
            {
              success: true,
              message: 'Task created successfully',
              task: { id: 3, project_id: 1, title: 'Design mockups', status: 'pending' },
            }
          ),
          404: errRef('Project not found'),
        },
      },
    },
    '/projects/{projectId}/time': {
      post: {
        tags: ['Time Tracking'],
        summary: 'Log time entry for project',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['hours', 'entry_date'],
                properties: {
                  hours: { type: 'number' },
                  description: { type: 'string' },
                  entry_date: { type: 'string', format: 'date' },
                  billable: { type: 'boolean', default: true },
                },
              },
              example: {
                hours: 2.5,
                description: 'Frontend development',
                entry_date: '2025-06-01',
                billable: true,
              },
            },
          },
        },
        responses: {
          201: successMsg(
            'Time entry added successfully',
            {
              timeEntry: ref('TimeEntry'),
            },
            {
              success: true,
              message: 'Time entry added successfully',
              timeEntry: {
                id: 4,
                project_id: 1,
                hours: 2.5,
                entry_date: '2025-06-01',
                billable: true,
              },
            }
          ),
          404: errRef('Project not found'),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Messages                                                      */
    /* -------------------------------------------------------------- */
    '/messages': {
      get: {
        tags: ['Messages'],
        summary: 'List conversations grouped by client',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Conversation list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  conversations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        client_id: { type: 'integer' },
                        client_name: { type: 'string' },
                        client_email: { type: 'string' },
                        company: { type: 'string' },
                        message_count: { type: 'integer' },
                        unread_count: { type: 'integer' },
                        last_message_at: { type: 'string', format: 'date-time' },
                        last_message: { type: 'string' },
                      },
                    },
                  },
                },
              },
              {
                success: true,
                conversations: [
                  {
                    client_id: 1,
                    client_name: 'Jane Doe',
                    client_email: 'jane@acme.com',
                    company: 'Acme Corp',
                    message_count: 12,
                    unread_count: 2,
                    last_message_at: '2025-06-01T14:00:00.000Z',
                    last_message: 'Thanks for the update!',
                  },
                ],
              }
            ),
          },
        },
      },
    },
    '/messages/unread/count': {
      get: {
        tags: ['Messages'],
        summary: 'Get unread message count',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Unread count',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  count: { type: 'integer' },
                },
              },
              { success: true, count: 5 }
            ),
          },
        },
      },
    },
    '/messages/client/{clientId}': {
      get: {
        tags: ['Messages'],
        summary: 'Get message thread for client',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'clientId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Message thread',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  client: ref('Client'),
                  messages: {
                    type: 'array',
                    items: {
                      allOf: [
                        ref('Message'),
                        { type: 'object', properties: { sender_name: { type: 'string' } } },
                      ],
                    },
                  },
                },
              },
              {
                success: true,
                client: { id: 1, name: 'Jane Doe', email: 'jane@acme.com' },
                messages: [
                  {
                    id: 1,
                    direction: 'outbound',
                    subject: 'Project update',
                    content: 'Here is your weekly update.',
                    sender_name: 'admin',
                    created_at: '2025-06-01T14:00:00.000Z',
                  },
                ],
              }
            ),
          },
          404: errRef('Client not found'),
        },
      },
      post: {
        tags: ['Messages'],
        summary: 'Send message to client',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'clientId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  subject: { type: 'string' },
                  content: { type: 'string' },
                  sent_via: { type: 'string', enum: ['email', 'sms', 'portal'] },
                },
              },
              example: {
                subject: 'Weekly update',
                content: 'Here is your weekly status report.',
                sent_via: 'email',
              },
            },
          },
        },
        responses: {
          201: successMsg(
            'Message sent successfully',
            {
              data: ref('Message'),
            },
            {
              success: true,
              message: 'Message sent successfully',
              data: {
                id: 5,
                client_id: 1,
                direction: 'outbound',
                content: 'Here is your weekly status report.',
              },
            }
          ),
          404: errRef('Client not found'),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Campaigns                                                     */
    /* -------------------------------------------------------------- */
    '/campaigns': {
      get: {
        tags: ['Campaigns'],
        summary: 'List campaigns',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Campaigns list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  campaigns: { type: 'array', items: ref('Campaign') },
                },
              },
              {
                success: true,
                campaigns: [
                  {
                    id: 1,
                    name: 'Summer Newsletter',
                    subject: "What's new",
                    status: 'draft',
                    segment_name: 'All Clients',
                    created_by_name: 'admin',
                  },
                ],
              }
            ),
          },
        },
      },
      post: {
        tags: ['Campaigns'],
        summary: 'Create campaign',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('Campaign'),
              example: {
                name: 'Summer Newsletter',
                subject: "What's new this quarter",
                content: '<h1>Summer Updates</h1><p>Exciting news!</p>',
              },
            },
          },
        },
        responses: {
          201: successMsg(
            'Campaign created successfully',
            {
              campaign: ref('Campaign'),
            },
            {
              success: true,
              message: 'Campaign created successfully',
              campaign: { id: 2, name: 'Summer Newsletter', status: 'draft' },
            }
          ),
        },
      },
    },
    '/campaigns/{id}/send': {
      post: {
        tags: ['Campaigns'],
        summary: 'Send campaign to recipients',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: successMsg(
            'Campaign sent',
            {
              sent_count: { type: 'integer' },
            },
            {
              success: true,
              message: 'Campaign sent to 15 recipients',
              sent_count: 15,
            }
          ),
          400: errRef('Campaign already sent'),
          404: errRef('Campaign not found'),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Contact                                                       */
    /* -------------------------------------------------------------- */
    '/contact': {
      post: {
        tags: ['Contact'],
        summary: 'Submit contact form',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'subject', 'message'],
                properties: {
                  name: { type: 'string', minLength: 2 },
                  email: { type: 'string', format: 'email' },
                  subject: { type: 'string', minLength: 3 },
                  message: { type: 'string', minLength: 10 },
                  company: { type: 'string' },
                },
              },
              example: {
                name: 'John Smith',
                email: 'john@example.com',
                subject: 'Partnership inquiry',
                message: 'I would like to discuss a potential partnership opportunity.',
                company: 'Smith Inc',
              },
            },
          },
        },
        responses: {
          200: successMsg(
            'Message sent successfully',
            {},
            {
              success: true,
              message: 'Message sent successfully',
            }
          ),
          400: { description: 'Validation error', ...jsonBody(ref('ValidationError')) },
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Client Portal                                                 */
    /* -------------------------------------------------------------- */
    '/portal/login': {
      post: {
        tags: ['Client Portal'],
        summary: 'Client portal login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
              example: { email: 'jane@acme.com', password: 'clientPassword123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful with portal token',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  token: { type: 'string' },
                  client: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      company: { type: 'string' },
                      phone: { type: 'string' },
                      status: { type: 'string' },
                      monthly_retainer: { type: 'number' },
                    },
                  },
                },
              },
              {
                message: 'Login successful',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                client: {
                  id: 1,
                  name: 'Jane Doe',
                  email: 'jane@acme.com',
                  company: 'Acme Corp',
                  phone: '555-0100',
                  status: 'active',
                  monthly_retainer: 5000,
                },
              }
            ),
          },
          401: {
            description: 'Invalid credentials',
            ...jsonBody({ type: 'object', properties: { message: { type: 'string' } } }),
          },
        },
      },
    },
    '/portal/me': {
      get: {
        tags: ['Client Portal'],
        summary: 'Get portal user info',
        security: [{ portalAuth: [] }],
        responses: {
          200: {
            description: 'Client info',
            ...jsonBody(
              { type: 'object', properties: { client: ref('Client') } },
              {
                client: {
                  id: 1,
                  name: 'Jane Doe',
                  email: 'jane@acme.com',
                  company: 'Acme Corp',
                  status: 'active',
                  monthly_retainer: 5000,
                  contract_start: '2025-01-01',
                },
              }
            ),
          },
          404: {
            description: 'Client not found',
            ...jsonBody({ type: 'object', properties: { message: { type: 'string' } } }),
          },
        },
      },
    },
    '/portal/projects': {
      get: {
        tags: ['Client Portal'],
        summary: 'Get client projects (portal view)',
        security: [{ portalAuth: [] }],
        responses: {
          200: {
            description: 'Projects list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  projects: {
                    type: 'array',
                    items: {
                      allOf: [
                        ref('Project'),
                        { type: 'object', properties: { progress: { type: 'number' } } },
                      ],
                    },
                  },
                },
              },
              {
                projects: [
                  {
                    id: 1,
                    title: 'Website Redesign',
                    status: 'in-progress',
                    priority: 'high',
                    budget: 15000,
                    progress: 42.5,
                  },
                ],
              }
            ),
          },
        },
      },
    },
    '/portal/messages': {
      get: {
        tags: ['Client Portal'],
        summary: 'Get client messages',
        security: [{ portalAuth: [] }],
        responses: {
          200: {
            description: 'Messages',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        subject: { type: 'string' },
                        content: { type: 'string' },
                        direction: { type: 'string' },
                        read_at: { type: 'string', format: 'date-time', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
              {
                messages: [
                  {
                    id: 1,
                    subject: 'Project update',
                    content: 'Here is your weekly update.',
                    direction: 'outbound',
                    read_at: null,
                    created_at: '2025-06-01T14:00:00.000Z',
                  },
                ],
              }
            ),
          },
        },
      },
      post: {
        tags: ['Client Portal'],
        summary: 'Send reply from portal',
        security: [{ portalAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: { content: { type: 'string' } },
              },
              example: { content: 'Thanks for the update, looks great!' },
            },
          },
        },
        responses: {
          201: {
            description: 'Reply sent',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  messageId: { type: 'integer' },
                },
              },
              { message: 'Message sent successfully', messageId: 8 }
            ),
          },
          400: {
            description: 'Missing content',
            ...jsonBody({ type: 'object', properties: { message: { type: 'string' } } }),
          },
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Compliance                                                    */
    /* -------------------------------------------------------------- */
    '/compliance/frameworks': {
      get: {
        tags: ['Compliance'],
        summary: 'List compliance frameworks',
        responses: {
          200: {
            description: 'Frameworks list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  frameworks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        version: { type: 'string' },
                        description: { type: 'string' },
                      },
                    },
                  },
                },
              },
              {
                frameworks: [
                  {
                    id: 'nist-800-171',
                    name: 'NIST SP 800-171',
                    version: 'Rev 2',
                    description: 'Protecting Controlled Unclassified Information',
                  },
                ],
              }
            ),
          },
          500: { description: 'Server error', ...jsonBody(ref('ComplianceError')) },
        },
      },
    },
    '/compliance/frameworks/{id}': {
      get: {
        tags: ['Compliance'],
        summary: 'Get framework details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Framework data (raw JSON from data file)',
            ...jsonBody({ type: 'object', description: 'Full framework JSON document' }),
          },
          404: {
            description: 'Framework not found',
            ...jsonBody(
              { type: 'object', properties: { error: { type: 'string' } } },
              { error: 'Framework not found' }
            ),
          },
          500: { description: 'Server error', ...jsonBody(ref('ComplianceError')) },
        },
      },
    },
    '/compliance/oscal': {
      get: {
        tags: ['Compliance'],
        summary: 'Get OSCAL catalogs',
        responses: {
          200: {
            description: 'OSCAL catalog list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  catalogs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        filename: { type: 'string' },
                        downloadUrl: { type: 'string' },
                      },
                    },
                  },
                },
              },
              {
                catalogs: [
                  {
                    id: 'nist-800-171',
                    filename: 'nist-800-171-oscal.json',
                    downloadUrl: '/api/compliance/oscal/nist-800-171',
                  },
                ],
              }
            ),
          },
          500: { description: 'Server error', ...jsonBody(ref('ComplianceError')) },
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  MBAi                                                          */
    /* -------------------------------------------------------------- */
    '/mbai/manifest': {
      get: {
        tags: ['MBAi'],
        summary: 'Get MBAi manifest',
        responses: {
          200: {
            description: 'Manifest data',
            ...jsonBody({ type: 'object', description: 'Raw MBAi manifest JSON' }),
          },
          500: { description: 'Server error', ...jsonBody(ref('ComplianceError')) },
        },
      },
    },
    '/mbai/templates': {
      get: {
        tags: ['MBAi'],
        summary: 'List MBAi templates',
        responses: {
          200: {
            description: 'Templates list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  count: { type: 'integer' },
                  templates: { type: 'array', items: { type: 'object' } },
                },
              },
              { count: 12, templates: [{ id: 'gap-analysis', name: 'Gap Analysis Template' }] }
            ),
          },
          500: { description: 'Server error', ...jsonBody(ref('ComplianceError')) },
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Admin – Backup                                                */
    /* -------------------------------------------------------------- */
    '/backup': {
      get: {
        tags: ['Admin - Backup'],
        summary: 'List backups',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Backup list',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  backups: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        filename: { type: 'string' },
                        size: { type: 'integer' },
                        sizeFormatted: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        modifiedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                  backupDir: { type: 'string' },
                },
              },
              {
                success: true,
                backups: [
                  {
                    filename: 'backup-2025-06-01.json',
                    size: 102400,
                    sizeFormatted: '100 KB',
                    createdAt: '2025-06-01T00:00:00.000Z',
                    modifiedAt: '2025-06-01T00:00:00.000Z',
                  },
                ],
                backupDir: '/data/backups',
              }
            ),
          },
        },
      },
      post: {
        tags: ['Admin - Backup'],
        summary: 'Create backup',
        security: [{ bearerAuth: [] }],
        responses: {
          201: successMsg(
            'Backup created successfully',
            {
              filename: { type: 'string' },
              filepath: { type: 'string' },
              size: { type: 'string' },
              tables: { type: 'integer' },
              records: { type: 'integer' },
            },
            {
              success: true,
              message: 'Backup created successfully',
              filename: 'backup-2025-06-01.json',
              filepath: '/data/backups/backup-2025-06-01.json',
              size: '100 KB',
              tables: 8,
              records: 342,
            }
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  Admin – Demo                                                  */
    /* -------------------------------------------------------------- */
    '/demo/generate': {
      post: {
        tags: ['Admin - Demo'],
        summary: 'Generate demo data',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Demo data generated',
            ...jsonBody(
              {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  results: {
                    type: 'object',
                    properties: {
                      created: {
                        type: 'object',
                        properties: {
                          clients: { type: 'integer' },
                          users: { type: 'integer' },
                          projects: { type: 'integer' },
                          tasks: { type: 'integer' },
                          timeEntries: { type: 'integer' },
                          messages: { type: 'integer' },
                        },
                      },
                      errors: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
              {
                success: true,
                message: 'Demo data generated successfully',
                results: {
                  created: {
                    clients: 5,
                    users: 3,
                    projects: 10,
                    tasks: 25,
                    timeEntries: 40,
                    messages: 15,
                  },
                  errors: [],
                },
              }
            ),
          },
        },
      },
    },
    '/demo/clear': {
      delete: {
        tags: ['Admin - Demo'],
        summary: 'Clear demo data',
        security: [{ bearerAuth: [] }],
        responses: {
          200: successMsg(
            'Demo data cleared',
            {
              clearedCount: { type: 'integer' },
            },
            {
              success: true,
              message: 'All demo data cleared',
              clearedCount: 98,
            }
          ),
        },
      },
    },
  },
  tags: [
    { name: 'System', description: 'Health checks and system info' },
    { name: 'Authentication', description: 'User registration, login, and token management' },
    { name: 'Admin - Users', description: 'User management (admin only)' },
    { name: 'Clients', description: 'Client CRM operations' },
    { name: 'Projects', description: 'Project management' },
    { name: 'Tasks', description: 'Task management within projects' },
    { name: 'Time Tracking', description: 'Time entry logging' },
    { name: 'Messages', description: 'Client messaging system' },
    { name: 'Campaigns', description: 'Email campaign management' },
    { name: 'Contact', description: 'Public contact form' },
    { name: 'Client Portal', description: 'Client-facing portal endpoints' },
    { name: 'Compliance', description: 'Compliance framework knowledge base' },
    { name: 'MBAi', description: 'MBAi methodology templates' },
    { name: 'Admin - Backup', description: 'Database backup management' },
    { name: 'Admin - Demo', description: 'Demo data management' },
  ],
};

// Serve OpenAPI spec as JSON
router.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Serve a simple Swagger UI-like documentation page
router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SFG API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/openapi.json',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: 'BaseLayout',
      deepLinking: true,
    });
  </script>
</body>
</html>`);
});

export default router;
