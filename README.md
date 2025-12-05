# Peel O Juice - E-Commerce Platform

A modern, full-stack e-commerce application for a juice bar featuring geolocation-based ordering, admin dashboard, and optimized performance with code-splitting.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Performance](#performance)

---

## Overview

**Peel O Juice** is a juice bar e-commerce platform that allows customers to:
- Browse fresh juice menu items
- Order online with geolocation-based address autofill
- Track orders via WhatsApp integration
- Visit store location with embedded maps

Administrators can:
- Manage menu items (add, edit, delete)
- View dashboard analytics
- Control access with JWT authentication
- Rate-limited login protection

**Live Location**: Vijayawada, Andhra Pradesh 520010, India

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Router**: Wouter (lightweight client-side router)
- **Bundler**: Vite 7.1.12 (esbuild)
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand (with persist middleware)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack React Query
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (7-day expiry)
- **Password**: bcryptjs (salt rounds: 10)
- **Image Upload**: Cloudinary
- **Security**: Helmet, CORS, Express Rate Limit
- **Validation**: Custom middleware

### DevOps
- **Development Server**: Vite dev server (port 5173)
- **Backend Server**: Express (port 5000)
- **Build Tool**: esbuild
- **Package Manager**: npm

---

## Project Structure

```
kingdompeelo/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── App.tsx                  # Main app with routing & code-splitting
│   │   ├── main.tsx                 # Vite entry point
│   │   ├── index.css                # Global styles
│   │   ├── components/
│   │   │   ├── layout/              # Navbar, Footer, ScrollToTop
│   │   │   ├── cart/                # CartDrawer component
│   │   │   ├── menu/                # CategoryCard, ItemCard
│   │   │   └── ui/                  # Reusable UI components (60+ files)
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page with hero & featured items
│   │   │   ├── Menu.tsx             # Product catalog with filters
│   │   │   ├── About.tsx            # Brand story & values
│   │   │   ├── VisitUs.tsx          # Location, hours, embedded Google Maps
│   │   │   ├── Checkout.tsx         # Cart & order form with geolocation
│   │   │   ├── Invoice.tsx          # Order confirmation
│   │   │   ├── not-found.tsx        # 404 page
│   │   │   └── admin/               # Protected admin routes
│   │   │       ├── Login.tsx        # Admin authentication
│   │   │       ├── Dashboard.tsx    # Analytics & item management
│   │   │       └── MenuManagement.tsx # CRUD for menu items
│   │   ├── store/                   # Zustand state management
│   │   │   ├── useCart.ts          # Shopping cart store
│   │   │   └── useMenu.ts          # Menu data store
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   └── lib/                     # Utilities & configuration
│   │       ├── utils.ts            # Centralized API_BASE_URL & cn()
│   │       ├── api.ts              # API client functions
│   │       ├── queryClient.ts      # React Query setup
│   │       └── mockData.ts         # (Deprecated - data now from API)
│   ├── public/                      # Static assets
│   ├── index.html                   # HTML template
│   └── package.json
│
├── backend/                         # Express.js API server
│   ├── server.js                    # Express app setup
│   ├── env                          # Environment variables (git-ignored)
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── cloudinary.js           # Image upload service
│   ├── controllers/
│   │   ├── authController.js       # Login/register endpoints
│   │   ├── dishController.js       # Dish CRUD operations
│   │   ├── menuControllers.js      # Menu & categories
│   │   └── categoryController.js   # Category management
│   ├── middleware/
│   │   ├── adminAuth.js            # JWT verification middleware
│   │   └── upload.js               # Multer file upload middleware
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Dish.js
│   │   ├── Category.js
│   │   ├── SubCategory.js
│   │   └── (legacy files)
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/* endpoints
│   │   ├── categoryRoutes.js       # /api/menu/categories/*
│   │   ├── dishRoutes.js           # /api/menu/dishes/*
│   │   ├── menuRoutes.js           # /api/menu/* aggregates
│   │   └── dashboard.js            # /dashboard endpoint
│   ├── middleware/
│   │   └── (auth, upload, etc.)
│   └── package.json
│
├── dist/                            # Production build output
│   └── public/                      # Client build artifacts
│
├── script/                          # Build scripts
│   └── build.ts                     # Vite + backend build script
│
├── vite.config.ts                   # Vite configuration with code-splitting
├── tsconfig.json                    # TypeScript configuration
├── postcss.config.js                # PostCSS setup
├── components.json                  # shadcn/ui configuration
├── .env.example                     # Environment variable template
├── CODE_SPLITTING.md                # Code-splitting documentation
├── CENTRALIZED_API_CONFIG.md        # API URL configuration guide
├── README.md                        # This file
└── package.json                     # Root package.json
```

---

## Features

### Customer Features
✅ **Geolocation-Based Ordering**
- Auto-fill delivery address using browser geolocation
- Reverse geocoding via OpenStreetMap Nominatim API
- Address validation and manual override option

✅ **Shopping Experience**
- Browse products by category/subcategory
- Add items to cart with quantity management
- Real-time cart updates with Zustand
- Responsive design for mobile/tablet/desktop

✅ **Checkout & Payment**
- Form validation with React Hook Form + Zod
- WhatsApp integration for order placement
- Order summary with tax calculation (5% GST)
- Invoice generation with order details

✅ **Location Services**
- Store location with hours of operation
- Embedded Google Maps for directions
- Contact information (phone, email)
- Navigation links to store

✅ **Content Pages**
- Home page with featured items
- About page with brand story & values
- Visit Us page with location & contact info
- Responsive navigation with mobile menu

### Admin Features
✅ **Authentication**
- Admin login with JWT tokens
- 7-day token expiry
- Protected dashboard routes
- Rate-limited login (5 attempts/15min)

✅ **Dashboard**
- Revenue & order statistics
- Charts (bar chart for revenue, line chart for orders)
- Quick access to menu management
- Real-time data from MongoDB

✅ **Menu Management**
- Add/Edit/Delete menu items
- Image upload to Cloudinary
- Categorize by subcategory
- Bulk operations support

✅ **Security**
- Password hashing with bcryptjs
- CORS restrictions (env-based)
- Helmet security headers
- Rate limiting on sensitive endpoints
- Environment-gated admin registration

---

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

### 1. Clone Repository
```bash
git clone https://github.com/karthik449213/kingdompeelo.git
cd kingdompeelo
```

### 2. Install Dependencies

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd ../backend
npm install
```

### 3. Environment Setup

**Frontend (.env.local):**
```bash
cd client
VITE_API_URL=http://localhost:5000
```

**Backend (.env):**
```bash
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kingdompeelo?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Admin Registration
ALLOW_ADMIN_REGISTER=false  # Set to true only during initial setup

# CORS
FRONTEND_ORIGIN=http://localhost:5173  # Change for production
NODE_ENV=development
```

---

## Environment Configuration

### Development
```bash
# Frontend
VITE_API_URL=http://localhost:5000

# Backend
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
ALLOW_ADMIN_REGISTER=false
```

### Production
```bash
# Frontend
VITE_API_URL=https://api.yourdomain.com

# Backend
NODE_ENV=production
FRONTEND_ORIGIN=https://yourdomain.com
ALLOW_ADMIN_REGISTER=false
JWT_SECRET=<strong-random-secret>
```

---

## Development

### Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Runs on http://localhost:5173

### Development Features
- Hot Module Replacement (HMR) for instant code updates
- TypeScript type checking
- ESLint for code quality
- Automatic browser refresh

### Available Scripts

**Frontend:**
```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run preview       # Preview production build
npm run type-check    # TypeScript type checking
```

**Backend:**
```bash
npm run dev          # Start dev server with nodemon
npm run start        # Start production server
```

---

## Build & Deployment

### Production Build

```bash
# Build both client and backend
npm run build

# Or individually:
cd client && npm run build    # Creates dist/public/
cd backend && npm run build   # Creates dist/ (if using esbuild)
```

### Build Output
```
dist/
├── public/                          # Frontend build artifacts
│   ├── index.html                   # Main HTML file
│   ├── assets/
│   │   ├── index-*.js              # Main bundle (251 KB gzip)
│   │   ├── Dashboard-*.js          # Admin dashboard chunk (397 KB)
│   │   ├── vendor-*.js             # Vendor chunks (separated)
│   │   ├── *.css                   # Styles (115 KB)
│   │   └── images/                 # Optimized images
│   └── .well-known/               # Metadata
└── (Backend files if using esbuild)
```

### Deployment to Production

**Option 1: Vercel/Netlify (Frontend)**
```bash
# Connect GitHub repo
# Set environment: VITE_API_URL=https://api.yourdomain.com
# Auto-deploy on push
```

**Option 2: Self-Hosted**
```bash
# Build
npm run build

# Copy dist/public/ to web server (Nginx/Apache)
# Run backend on port 5000 (use PM2 or systemd)
```

### Docker Deployment (Optional)

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN cd client && npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist/public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## API Endpoints

### Public Endpoints

**Menu**
```
GET  /api/menu/categories              # All categories
GET  /api/menu/subcategories           # All subcategories
GET  /api/menu/dishes                  # All dishes
GET  /api/menu/full                    # Full menu (categories + dishes)
```

### Admin Endpoints (Protected)

**Authentication**
```
POST /api/auth/login                   # Login
POST /api/auth/register                # Register (if ALLOW_ADMIN_REGISTER=true)
```

**Menu Management (Requires JWT)**
```
POST   /api/menu/dishes                # Create dish
GET    /api/menu/dishes/:id            # Get dish details
PUT    /api/menu/dishes/:id            # Update dish
DELETE /api/menu/dishes/:id            # Delete dish
```

**Dashboard (Requires JWT)**
```
GET  /dashboard                         # Dashboard data (stats)
```

### Request/Response Format

**Login Request**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Login Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

**Create Dish Request**
```
POST /api/menu/dishes
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Orange Juice",
  "price": "50",
  "description": "Fresh orange juice",
  "category": "61f5c3e8a2b9f1234567890a",  // SubCategory ID
  "image": <File>
}
```

---

## Security

### Implemented Measures

✅ **Authentication**
- JWT-based authentication (7-day expiry)
- Secure password hashing (bcryptjs, 10 salt rounds)
- Protected routes with middleware

✅ **API Security**
- CORS restricted to whitelisted origin (FRONTEND_ORIGIN env var)
- Helmet security headers
- Rate limiting on login (5 attempts/15 minutes per IP)

✅ **Admin Protection**
- Admin registration gated by ALLOW_ADMIN_REGISTER env var (default: false)
- JWT verification on all protected endpoints
- 401 errors for unauthorized access

✅ **Data Validation**
- Zod schema validation on frontend forms
- Express validation middleware on backend
- Type-safe TypeScript throughout

### Recommended Production Changes

⚠️ **Before Going Live:**

1. **Environment Variables**
   - Change JWT_SECRET to strong random value
   - Set ALLOW_ADMIN_REGISTER=false
   - Use production MongoDB URI
   - Set NODE_ENV=production

2. **HTTPS & Security Headers**
   - Enable HTTPS (SSL/TLS certificate)
   - Add HSTS header for HTTPS enforcement
   - Set secure cookie flags

3. **Additional Hardening**
   - Implement login attempt logging
   - Add account lockout after N failed attempts
   - Enable CSRF protection
   - Implement refresh token pattern (access + refresh tokens)

4. **Monitoring**
   - Set up error logging (Sentry, LogRocket)
   - Monitor API performance (New Relic, DataDog)
   - Set up uptime monitoring

---

## Performance

### Code-Splitting Strategy

The application uses **lazy loading** with React.lazy() and Suspense to split routes into separate chunks:

✅ **Main Bundle**: 251 KB gzip (includes Home page only)
✅ **Route Chunks**: 1-5 KB each (loaded on-demand)
✅ **Vendor Chunks** (Separated):
- vendor-react: 11.92 KB (React core)
- vendor-query: 22.56 KB (React Query)
- vendor-ui: 122.88 KB (Framer Motion + Lucide)
- vendor-forms: 76.18 KB (React Hook Form + Zod)
- vendor-router: 5.36 KB (Wouter)
- vendor-utils: 0.65 KB (Zustand)

✅ **Feature Chunks**:
- ui-components: 65.68 KB (shadcn/ui components)
- layout: 28.10 KB (Navbar, Footer)

### Performance Metrics

| Metric | Value |
|--------|-------|
| Main Bundle | 251 KB (gzip: 81 KB) |
| Total CSS | 115 KB (gzip: 18 KB) |
| Images | ~1.6 MB (optimized) |
| Chunks | 22 separate chunks |
| Build Time | ~4s |

### Optimization Tips

1. **Image Optimization**
   - Use next-gen formats (WebP)
   - Lazy-load images below fold
   - Use srcset for responsive images

2. **Caching**
   - Set long cache TTL for vendor chunks (1 year)
   - Set short TTL for main bundle (1 hour)
   - Use service workers for offline support

3. **Database**
   - Index frequently queried fields (categoryId, subCategoryId)
   - Use pagination for large datasets
   - Cache popular menu items

---

## Development Workflow

### Creating a New Page

1. **Create component** in `client/src/pages/`
2. **Add to App.tsx** with lazy loading:
```tsx
const NewPage = lazy(() => import("@/pages/NewPage"));
// In Router component:
<Route path="/new-page">
  {() => (
    <Suspense fallback={<LoadingFallback />}>
      <NewPage />
    </Suspense>
  )}
</Route>
```
3. **Update navigation** in Navbar/Footer
4. **Test** in dev server

### Adding Admin Features

1. **Create controller** in `backend/controllers/`
2. **Create route** in `backend/routes/`
3. **Protect with middleware**: Use `adminAuth` middleware
4. **Create UI** in `client/src/pages/admin/`
5. **Add API call** in component

### Commit Messages

Follow conventional commits:
```
feat: add geolocation to checkout
fix: nested anchor tag in navbar
refactor: centralize API URLs
docs: update README
```

---

## Troubleshooting

### Common Issues

**API Connection Error**
- Check backend is running on port 5000
- Verify VITE_API_URL in .env.local
- Check CORS FRONTEND_ORIGIN matches frontend URL

**MongoDB Connection Failed**
- Verify MONGODB_URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are correct

**Image Upload Fails**
- Verify Cloudinary credentials
- Check image file size (max 5MB)
- Ensure CLOUDINARY_NAME is correct

**TypeScript Errors**
```bash
npm run type-check    # Check all TypeScript errors
cd client && npm run build  # Full build validation
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is proprietary. All rights reserved.

---

## Contact & Support

**Store Location**: 
Royal Arcade 2002, Tikkle Rd, Acharya Ranga Nagar, Benz Circle, Vijayawada, AP 520010

**Phone**: +91 998986556
**Email**: hello@peelOjuice.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2025 | Initial release with geolocation, code-splitting, security hardening |

---

**Last Updated**: December 5, 2025
