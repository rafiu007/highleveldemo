# 🧠 HighLevel Contacts Management System

A full-stack multi-tenant contacts management web application built with NestJS backend, Next.js frontend, TypeORM, and PostgreSQL. This system supports multiple organizations with isolated data and comprehensive contact management features.

## 🎯 Features

### Core Functionality

- **CRUD Operations**: Complete contact management (Create, Read, Update, Delete)
- **Contact Information**: Store name, phone, email, address, and notes
- **Contact Events**: Log activities like calls, emails, meetings, and notes
- **Activity Tracking**: Track "Last Contacted On" and "Means of Contact"

### Multi-Tenant Architecture

- **Workspace Isolation**: Each organization's data is completely isolated
- **User Management**: Users belong to specific workspaces
- **Access Control**: Workspace-based data access validation
- **Scalable Design**: Support for unlimited organizations

### Advanced Features

- **Search Functionality**: Search contacts by name, email, or phone
- **Dashboard Analytics**: Workspace overview with contact and activity metrics
- **Event Logging**: Comprehensive activity tracking for each contact
- **REST API**: Full REST API for all operations

## 🏗️ Architecture

### Database Schema

```
Workspaces (Organizations)
├── Users (Multi-tenant users)
├── Contacts (Workspace-specific contacts)
└── Contact Events (Activity logs)
```

### Technology Stack

**Backend:**

- **Framework**: NestJS (Node.js framework)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT tokens (access + refresh)
- **Validation**: Class-validator decorators
- **API**: RESTful endpoints with proper HTTP status codes

**Frontend:**

- **Framework**: Next.js 14 with App Router
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query (TanStack Query)
- **Language**: TypeScript
- **Styling**: CSS-in-JS with Material-UI

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 12+
- **pnpm** (recommended) or npm

### Installation & Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
cd highlevel
```

2. **Install dependencies:**

```bash
# Install backend dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install
cd ..
```

3. **Setup environment variables:**

Create a `.env` file in the root directory with your database credentials:

```env
JWT_ACCESS_SECRET='Ujb8GNsH1Z1GhrW8A/HiOXX7BO2tpp853B8lpk3Ul4E='
JWT_REFRESH_SECRET='Yu0PNkoSdDYdVw6OS5ipxdBJEOMOFn8yvVoiQy2vR/0='

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=goodwill_dev
JWT_ACCESS_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
NODE_ENV=development
```

4. **Setup database:**

```bash
# Create database
createdb highlevel_dev

# Run migrations
pnpm run migration:run
```

### 🏃‍♂️ Running the Application

#### Option 1: Run Both Services Simultaneously

```bash
# Start both backend and frontend in development mode
pnpm run dev
```

This will start:

- **Backend**: `http://localhost:3000` (API server)
- **Frontend**: `http://localhost:3001` (Web application)

#### Option 2: Run Services Separately

**Terminal 1 - Backend:**

```bash
# Start backend development server
pnpm run start:dev
```

**Terminal 2 - Frontend:**

```bash
# Start frontend development server
cd frontend
pnpm run dev
```

### 🌐 Access the Application

- **Web Application**: http://localhost:3001
- **API Documentation**: http://localhost:3000 (backend API)

### 🔑 Initial Setup

1. **Create your first account**: Navigate to http://localhost:3001 and sign up
2. **Create a workspace**: Your workspace will be created automatically during signup
3. **Add contacts**: Start managing your contacts through the web interface
4. **Explore features**: Dashboard, contacts, workspace management, and more!

### 📱 Application Features

- **Dashboard**: Overview of contacts and recent activities
- **Contacts Management**: Create, edit, delete, and search contacts
- **Workspace Settings**: Manage workspace details and team members
- **Contact Events**: Log and track all contact interactions
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📚 API Documentation

### Authentication

All endpoints require JWT authentication (except auth endpoints):

```
Authorization: Bearer <your-token>
```

### Key Endpoints

**Authentication:**

- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout

**Workspaces:**

- `GET /workspaces` - List workspaces
- `POST /workspaces` - Create workspace
- `GET /workspaces/:id/dashboard` - Get analytics

**Contacts:**

- `GET /contacts/workspace/:workspaceId` - List contacts
- `POST /contacts` - Create contact
- `PATCH /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact
- `GET /contacts/workspace/:workspaceId/search?q=term` - Search contacts

**Contact Events:**

- `GET /contact-events/contact/:contactId` - Get contact activities
- `POST /contact-events` - Log new activity
- `PATCH /contact-events/:id` - Update activity

For complete API documentation, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## 🧪 Example Usage

### 1. Create a workspace

```bash
curl -X POST http://localhost:3000/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "description": "Our main workspace"}'
```

### 2. Add a contact

```bash
curl -X POST http://localhost:3000/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1234567890",
    "workspaceId": "your-workspace-id"
  }'
```

### 3. Log a contact event

```bash
curl -X POST http://localhost:3000/contact-events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "call",
    "description": "Initial consultation call - very interested in our services",
    "eventDate": "2024-01-15T10:00:00Z",
    "contactId": "your-contact-id"
  }'
```

## 🏢 Multi-Tenant Features

### Data Isolation

- Each workspace has completely isolated data
- Users can only access their workspace's contacts
- Cross-workspace data access is prevented at the API level
- Database foreign keys ensure referential integrity

### Workspace Management

- Create and manage multiple organizations
- User assignment to specific workspaces
- Workspace-level analytics and reporting
- Soft delete for data retention

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation using class-validator
- **SQL Injection Prevention**: TypeORM query builder protection
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🧱 Code Quality

### Best Practices Implemented

- **Immutable Code**: Using `const` and immutable operations
- **Type Safety**: Strict TypeScript with no `any` types
- **DRY Principles**: Reusable services and utilities
- **Error Handling**: Comprehensive error handling with proper HTTP codes
- **Validation**: Input validation at API boundaries

### Project Structure

```
highlevel/
├── src/                    # Backend source code
│   ├── auth/              # Authentication logic
│   ├── users/             # User management
│   ├── workspace/         # Multi-tenant workspace management
│   ├── contacts/          # Contact CRUD operations
│   ├── contact-events/    # Activity logging
│   ├── guards/            # Authentication guards
│   ├── decorators/        # Custom decorators
│   ├── migrations/        # Database migrations
│   └── interfaces/        # TypeScript interfaces
├── frontend/              # Frontend application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React context providers
│   │   ├── lib/          # Utility libraries (API client)
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
├── docs/                 # Documentation files
├── package.json          # Backend dependencies
└── README.md             # This file
```

## 🚦 Development

### Available Scripts

````bash
docker compose up -d

#### Backend Scripts

```bash
# Development
pnpm run start:dev      # Start backend with hot reload
pnpm run start:debug    # Start backend in debug mode

# Building
pnpm run build          # Build backend for production
pnpm run start:prod     # Start production backend server

# Database
pnpm run migration:run      # Run migrations
pnpm run migration:revert   # Revert migrations
pnpm run migration:generate # Generate new migration

# Testing
pnpm run test          # Unit tests
pnpm run test:e2e      # End-to-end tests
pnpm run test:cov      # Test coverage
````

#### Frontend Scripts

```bash
# Development (run from frontend/ directory)
cd frontend
pnpm run dev           # Start frontend development server
pnpm run build         # Build frontend for production
pnpm run start         # Start production frontend server
pnpm run lint          # Run ESLint
pnpm run type-check    # Run TypeScript type checking
```

#### Combined Scripts

```bash
# Run both backend and frontend together
pnpm run dev           # Start both services in development mode
```

### Database Migrations

The project uses TypeORM migrations for database schema management:

```bash
# Run all pending migrations
npm run migration:run

# Create a new migration
npm run migration:generate -- -n AddNewFeature

# Revert last migration
npm run migration:revert
```

## 📈 Performance

### Optimizations Implemented

- Database connection pooling
- Proper indexing on foreign keys
- Efficient queries with TypeORM
- Pagination for large datasets
- Input validation to prevent malformed requests

### Scalability

- Stateless API design
- Horizontal scaling ready
- Database optimization for multi-tenant queries
- Caching layer ready for implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use

If you get a "port already in use" error:

```bash
# Find and kill process using port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Find and kill process using port 3001 (frontend)
lsof -ti:3001 | xargs kill -9
```

#### Database Connection Issues

1. **PostgreSQL not running:**

   ```bash
   # Start PostgreSQL (macOS with Homebrew)
   brew services start postgresql

   # Start PostgreSQL (Ubuntu/Debian)
   sudo systemctl start postgresql
   ```

2. **Database doesn't exist:**

   ```bash
   # Create the database
   createdb highlevel_dev
   ```

3. **Permission denied:**
   ```bash
   # Connect as postgres user and create database
   sudo -u postgres createdb highlevel_dev
   ```

#### Migration Issues

```bash
# If migrations fail, reset and try again
pnpm run migration:revert
pnpm run migration:run
```

#### Frontend Build Issues

```bash
# Clear Next.js cache
cd frontend
rm -rf .next
pnpm run build
```

#### Dependencies Issues

```bash
# Clean install all dependencies
rm -rf node_modules package-lock.json pnpm-lock.yaml
rm -rf frontend/node_modules frontend/package-lock.json frontend/pnpm-lock.yaml
pnpm install
cd frontend && pnpm install
```

### Environment Variables

Make sure your `.env` file is properly configured:

- Database credentials match your PostgreSQL setup
- JWT secrets are secure and unique
- NODE_ENV is set appropriately

### Getting Help

If you're still having issues:

1. Check the console logs for specific error messages
2. Verify all prerequisites are installed and running
3. Ensure database migrations have been run successfully
4. Check that all environment variables are set correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support, please refer to:

- [API Documentation](docs/API_DOCUMENTATION.md)
- [API Examples](docs/api-examples.md)
- GitHub Issues for bug reports and feature requests

---

**Built with ❤️ using NestJS, TypeORM, and PostgreSQL**
