# 🧠 Contacts Management System

A multi-tenant contacts management web application built with NestJS, TypeORM, and PostgreSQL. This system supports multiple organizations with isolated data and comprehensive contact management features.

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

- **Backend**: NestJS (Node.js framework)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT tokens (access + refresh)
- **Validation**: Class-validator decorators
- **API**: RESTful endpoints with proper HTTP status codes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd highlevel
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Setup environment variables:**

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=highlevel_dev
JWT_ACCESS_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
NODE_ENV=development
```

4. **Setup database:**

```bash
# Create database
createdb highlevel_dev

# Run migrations
npm run migration:run
```

5. **Start the application:**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

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
src/
├── auth/           # Authentication logic
├── users/          # User management
├── workspace/      # Multi-tenant workspace management
├── contacts/       # Contact CRUD operations
├── contact-events/ # Activity logging
├── guards/         # Authentication guards
├── decorators/     # Custom decorators
├── migrations/     # Database migrations
└── interfaces/     # TypeScript interfaces
```

## 🚦 Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start with hot reload
npm run start:debug    # Start in debug mode

# Building
npm run build          # Build for production
npm run start:prod     # Start production server

# Database
npm run migration:run      # Run migrations
npm run migration:revert   # Revert migrations
npm run migration:generate # Generate new migration

# Testing
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Test coverage
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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support, please refer to:

- [API Documentation](docs/API_DOCUMENTATION.md)
- [API Examples](docs/api-examples.md)
- GitHub Issues for bug reports and feature requests

---

**Built with ❤️ using NestJS, TypeORM, and PostgreSQL**
