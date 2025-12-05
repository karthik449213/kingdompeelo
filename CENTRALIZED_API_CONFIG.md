# Centralized API Configuration

## Overview
All API requests now use a single centralized API URL configuration from `lib/utils.ts` instead of having hardcoded URLs in each component.

## Changes Made

### 1. **lib/utils.ts** - New Exports
Added two new exports for centralized API configuration:

```typescript
// Base API URL (defaults to http://localhost:5000)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API endpoint URL (includes /api suffix)
export const API_URL = `${API_BASE_URL}/api`;
```

**Features:**
- Reads from environment variable `VITE_API_URL` (Vite convention for client-side env vars)
- Falls back to localhost for development
- Single source of truth for API configuration

### 2. **lib/api.ts** - Updated
Changed from hardcoded URL to using centralized export:

```typescript
// Before
const API_BASE_URL = 'http://localhost:5000/api';

// After
import { API_URL } from './utils';
export const api = {
  menu: {
    getFull: () => fetch(`${API_URL}/menu/full`).then(res => res.json()),
  },
};
```

### 3. **Admin Pages** - Unified Imports
Updated all admin pages to import from `lib/utils`:

**Files Updated:**
- `pages/admin/Dashboard.tsx`
- `pages/admin/MenuManagement.tsx`
- `pages/admin/Login.tsx`

**Pattern:**
```typescript
// Import
import { API_BASE_URL, API_URL } from '@/lib/utils';

// Usage in fetch calls
fetch(`${API_URL}/menu/dishes`, { ... })
fetch(`${API_BASE_URL}/dashboard`, { ... })
```

### 4. **.env.example** - Configuration Template
New file created for environment variable documentation:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Build Configuration
VITE_APP_TITLE=peel O juice
```

## Benefits

✅ **Single Source of Truth** - One place to change API URL for all pages  
✅ **Environment-Based** - Different URLs for dev/staging/production  
✅ **Cleaner Code** - No scattered hardcoded URLs  
✅ **Easy Migration** - Change one variable instead of updating 5+ files  
✅ **Type-Safe** - Exported as constants with proper types  

## Configuration

### Development (Default)
```bash
# Uses fallback: http://localhost:5000
npm run dev
```

### Custom API URL
Create `.env.local` (not committed to git):
```env
VITE_API_URL=https://api.example.com
```

Or set environment variable:
```bash
VITE_API_URL=https://api.example.com npm run build
```

### Production
```bash
# Deploy with environment variable set
VITE_API_URL=https://api.yourdomain.com npm run build
```

## API Endpoints Consolidated

**Dashboard:**
- `GET /dashboard` → `${API_BASE_URL}/dashboard`
- `GET /api/menu/dishes` → `${API_URL}/menu/dishes`
- `GET /api/menu/subcategories` → `${API_URL}/menu/subcategories`
- `POST|PUT|DELETE /api/menu/dishes/:id` → `${API_URL}/menu/dishes/:id`

**Menu Management:**
- `GET /api/menu/dishes` → `${API_URL}/menu/dishes`
- `GET /api/menu/categories` → `${API_URL}/menu/categories`
- `POST|PUT|DELETE /api/menu/dishes/:id` → `${API_URL}/menu/dishes/:id`

**Login:**
- `POST /api/auth/login` → `${API_URL}/auth/login`

## File Changes Summary

| File | Change |
|------|--------|
| `lib/utils.ts` | Added `API_BASE_URL` and `API_URL` exports |
| `lib/api.ts` | Import `API_URL` instead of hardcoding |
| `pages/admin/Dashboard.tsx` | Import and use `API_BASE_URL`, `API_URL` |
| `pages/admin/MenuManagement.tsx` | Import and use `API_URL` |
| `pages/admin/Login.tsx` | Import and use `API_URL` |
| `.env.example` | New configuration template |

## Testing

Build verification:
```bash
npm run build
# ✓ 2891 modules transformed
# ✓ built in 3.75s
```

All TypeScript errors resolved ✅
