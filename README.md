# Highlevel Backend

A simple and clean NestJS backend application with email/password authentication using JWT.

## Features

- **User Management**: Complete CRUD operations for users
- **Authentication**: Email/password login with JWT tokens
- **Security**: Password hashing with bcrypt
- **Database**: PostgreSQL with TypeORM
- **Validation**: Request validation with class-validator

## Quick Start

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=highlevel_dev

   # JWT Secrets
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here

   # Environment
   NODE_ENV=development
   ```

3. **Run database migrations**

   ```bash
   pnpm run migration:run
   ```

4. **Start the application**
   ```bash
   pnpm run start:dev
   ```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (requires auth)

### Users

- `GET /users/me` - Get current user profile (requires auth)
- `GET /users/:id` - Get user by ID (requires auth)
- `PUT /users/me` - Update current user profile (requires auth)

## Database Schema

### Users Table

- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email address
- `password` (VARCHAR) - Hashed password
- `name` (VARCHAR) - Optional user name
- `profilePicture` (VARCHAR) - Optional profile picture URL
- `refreshToken` (VARCHAR) - JWT refresh token
- `isActive` (BOOLEAN) - Account status
- `createdAt` (TIMESTAMP) - Creation date
- `updatedAt` (TIMESTAMP) - Last update date

## Development

- **Build**: `pnpm run build`
- **Format**: `pnpm run format`
- **Lint**: `pnpm run lint`
- **Test**: `pnpm run test`

## License

Private - All rights reserved
