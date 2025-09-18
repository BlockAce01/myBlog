# MyBlog - Full-Stack Blog Application

A secure, full-stack blog application with cryptographic admin authentication, built with Next.js, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- MongoDB Atlas account (cloud database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myBlog
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**

   Copy the environment files:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

   Configure your environment variables in `apps/backend/.env`:
   ```env
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-secure-jwt-secret
   ADMIN_SETUP_TOKEN=your-secure-setup-token
   NODE_ENV=development
   ```

4. **Database Setup**

   The application uses MongoDB Atlas. Make sure your connection string is configured.

5. **Admin User Setup**

   ⚠️ **Security Notice**: The admin setup script requires additional security measures.

   ```bash
   # Set the admin setup token in your .env file first
   echo "ADMIN_SETUP_TOKEN=your-secure-token-here" >> apps/backend/.env

   # Run the secure admin setup
   cd apps/backend
   node setup-admin.js admin@yourdomain.com admin "Your Name" your-secure-token-here
   ```

   **Security Features:**
   - Requires `ADMIN_SETUP_TOKEN` environment variable
   - Must provide the token as a command-line argument
   - Can only run in development environments (not production)
   - Prevents unauthorized admin account creation

6. **Start the Application**

   ```bash
   # Terminal 1: Start backend
   cd apps/backend && pnpm start

   # Terminal 2: Start frontend
   cd apps/frontend && pnpm run dev
   ```

7. **Access the Application**

   - Frontend: http://localhost:3000
   - Admin Login: http://localhost:3000/admin/login

## 🔐 Admin Authentication

The application uses **enterprise-grade cryptographic authentication**:

1. **Generate Keys**: Visit the admin dashboard to generate ECDSA P-256 key pairs
2. **Secure Storage**: Private keys are stored securely in your browser's IndexedDB
3. **Challenge-Response**: Authentication uses cryptographic signatures
4. **No Passwords**: Completely passwordless admin authentication

### Security Features
- ✅ ECDSA P-256 cryptographic signatures
- ✅ Client-side key generation and storage
- ✅ Challenge-response authentication
- ✅ Replay attack prevention
- ✅ Rate limiting and audit logging
- ✅ IP allowlisting support
- ✅ MFA-ready architecture

## 🏗️ Architecture

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: Cryptographic signatures + JWT
- **Package Manager**: pnpm

## 📁 Project Structure

```
apps/
├── frontend/          # Next.js application
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   └── hooks/        # Custom React hooks
└── backend/          # Express.js API
    ├── src/
    │   ├── api/      # Route handlers
    │   ├── middleware/ # Express middleware
    │   ├── models/   # Mongoose schemas
    │   └── utils/    # Backend utilities
    └── setup-admin.js # Secure admin setup script
```

## 🔒 Security Considerations

### Admin Setup Security
- The `setup-admin.js` script includes multiple security layers
- Requires environment-based setup tokens
- Development-only execution
- Prevents unauthorized admin account creation

### Production Deployment
- Use strong, unique `ADMIN_SETUP_TOKEN`
- Set `NODE_ENV=production` to disable admin setup
- Configure IP allowlisting for admin endpoints
- Enable audit logging and monitoring

## 🧪 Testing

```bash
# Run backend tests
cd apps/backend && pnpm test

# Run frontend tests
cd apps/frontend && pnpm test
```

## 📚 Documentation

See the `docs/` folder for detailed documentation:
- Architecture specifications
- API documentation
- Security requirements
- User stories and acceptance criteria

## 🤝 Contributing

1. Follow the established coding standards
2. Use pnpm for dependency management
3. Ensure tests pass before submitting PRs
4. Update documentation as needed

## 📄 License

This project is private and proprietary.
