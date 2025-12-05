# Code-Splitting Implementation

## Overview
Implemented dynamic code-splitting using React's `lazy()` and `Suspense` APIs combined with Vite's advanced rollup chunking configuration to optimize bundle size and improve application performance.

## Changes Made

### 1. **vite.config.ts** - Optimized Build Configuration
```typescript
build: {
  chunkSizeWarningLimit: 1000,  // Raised from default 500 KB
  rollupOptions: {
    output: {
      manualChunks: {
        // Vendor chunks - separated for better caching
        "vendor-react": ["react", "react-dom"],
        "vendor-router": ["wouter"],
        "vendor-ui": ["framer-motion", "lucide-react"],
        "vendor-forms": ["react-hook-form", "zod"],
        "vendor-query": ["@tanstack/react-query"],
        "vendor-utils": ["zustand"],
        
        // Feature chunks - grouped for easier lazy-loading
        "ui-components": [
          "@/components/ui/button",
          "@/components/ui/card",
          "@/components/ui/dialog",
          "@/components/ui/input",
        ],
        "layout": [
          "@/components/layout/Navbar",
          "@/components/layout/Footer",
          "@/components/layout/ScrollToTop",
        ],
      },
    },
  },
}
```

**Benefits:**
- Vendor libraries remain stable and cached longer
- Feature chunks reduce main bundle size
- Better browser caching strategy

### 2. **App.tsx** - Dynamic Route Loading
Converted all route components to use React's `lazy()` for dynamic imports:

```typescript
// Before: Direct imports (bundled with main chunk)
import Menu from "@/pages/Menu";
import Checkout from "@/pages/Checkout";

// After: Lazy imports (separate chunks, loaded on-demand)
const Menu = lazy(() => import("@/pages/Menu"));
const Checkout = lazy(() => import("@/pages/Checkout"));
```

**Routes with code-splitting:**
- `/menu` - Menu.js chunk
- `/about` - About.js chunk
- `/visit-us` - VisitUs.js chunk
- `/checkout` - Checkout.js chunk
- `/invoice` - Invoice.js chunk
- `/admin/login` - Login.js chunk
- `/admin/dashboard` - Dashboard.js chunk
- `/admin/menu` - MenuManagement.js chunk

**Home page** (`/`) remains in main bundle for fast initial load.

### 3. **Loading Fallback Component**
Added a smooth loading spinner while chunks are being fetched:

```typescript
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```

## Build Output

Final bundle analysis:
- **Main bundle** (`index-iwZ_clY3.js`): 251.70 KB (81.39 KB gzip)
- **vendor-react**: 11.92 KB gzip
- **vendor-query**: 22.56 KB gzip (TanStack Query)
- **vendor-ui**: 122.88 KB gzip (Framer Motion + Lucide)
- **vendor-forms**: 76.18 KB gzip (React Hook Form + Zod)
- **ui-components**: 65.62 KB gzip
- **layout**: 28.10 KB gzip
- **Page chunks**: 1-5 KB each (loaded on-demand)
- **Dashboard**: 397.27 KB (largest admin feature, lazy-loaded)

## Performance Improvements

### Before Code-Splitting:
- Single large main bundle with all routes
- All dependencies loaded upfront
- Slower Time to Interactive (TTI)

### After Code-Splitting:
1. **Reduced Initial Load**: Home page no longer loads unnecessary route chunks
2. **Better Caching**: Vendor chunks rarely change, can be cached indefinitely
3. **On-Demand Loading**: Route components load only when user navigates
4. **Bandwidth Savings**: Users only download what they use
5. **Faster TTI**: Smaller main bundle = faster JavaScript parsing and execution

## How It Works

1. **User loads app** → Downloads main bundle (251 KB gzip) + vendor chunks
2. **User navigates to `/menu`** → Browser downloads Menu.js chunk (5 KB gzip)
3. **LoadingFallback shown** → Chunk downloads in background
4. **Chunk loaded** → Menu component renders with Suspense
5. **User navigates to other routes** → Same process repeats with separate chunks

## Browser Support

Code-splitting works in all modern browsers that support:
- Dynamic `import()` - ES2020+
- React Suspense - React 16.6+
- Vite's rollup bundler - All target browsers

## Configuration Details

### Manual Chunks Rationale:
- **vendor-react**: Core framework (stable, large)
- **vendor-router**: Routing library (separates nav logic)
- **vendor-ui**: Animation & icons (frequently used)
- **vendor-forms**: Form handling (large, used by multiple pages)
- **vendor-query**: Data fetching (large dependency)
- **vendor-utils**: State management (small, stable)
- **ui-components**: Reusable UI (common across pages)
- **layout**: Navigation components (used on every page, worth separate chunk)

### Chunk Size Warning Limit:
Set to 1000 KB (from default 500 KB) to prevent warnings for large feature chunks like Dashboard admin page.

## Development

Development mode (`npm run dev`) uses esbuild with HMR (Hot Module Replacement), so code-splitting doesn't affect dev experience.

## Monitoring Performance

Check bundle size:
```bash
npm run build
```

View breakdown in `dist/public/assets/`:
- Each `.js` file is a separate chunk
- `.css` is shared across chunks
- Gzip sizes shown in build output

## Future Optimizations

1. **Prefetching**: Preload chunks user likely to visit
2. **Route-based prefetch**: On hover of menu link, prefetch chunk
3. **Intersection Observer**: Lazy-load images with observer
4. **Service Workers**: Cache chunks for offline access
5. **Component-level splitting**: Split large feature components

## Notes

- All pages have proper default exports (required for lazy())
- LoadingFallback ensures smooth UX during chunk load
- Suspense boundaries at route level for simplicity
- No external CDN needed - all chunks self-hosted
