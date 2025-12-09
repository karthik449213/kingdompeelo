# CodeSage - Quick Testing Guide

## 🚀 Project is Running!

**URL**: http://localhost:5000

---

## 📋 What's Been Implemented

### ✅ Admin Pages (Extracted from kingdomfrontend)
1. **Login Page** - `/admin/login`
   - Authentication with username/password
   - Token-based authorization
   - Automatic redirect to dashboard

2. **Dashboard** - `/admin/dashboard`
   - Protected route (requires token)
   - Shows admin statistics
   - Menu management table
   - Analytics charts

3. **Menu Management** - `/admin/menu`
   - Full CRUD for menu items
   - Category/Subcategory filtering
   - Image upload support
   - Add/Edit/Delete functionality

### ✅ Invoice Page (Extracted from kingdomfrontend)
- **Invoice** - `/invoice`
  - Order summary display
  - WhatsApp integration
  - Call restaurant
  - Copy order details

---

## 🧪 How to Test

### Test 1: Admin Login
```
1. Navigate to: http://localhost:5000/admin/login
2. Enter credentials (you need a valid backend user)
3. Click "Login"
4. Should redirect to /admin/dashboard
5. Token stored in localStorage
```

### Test 2: Admin Dashboard
```
1. After login, you're on /admin/dashboard
2. Check console for dashboard data fetch
3. See statistics and charts
4. View menu items in table
5. Click "Menu Management" link or navigate to /admin/menu
```

### Test 3: Menu Management
```
1. Go to: http://localhost:5000/admin/menu
2. Click "Add Dish" button
3. Fill form:
   - Dish Name
   - Price
   - Category (select from dropdown)
   - Subcategory (auto-populated based on category)
   - Image (optional, shows preview)
   - Description
4. Click "Add Dish"
5. Should appear in menu list
```

### Test 4: Edit/Delete Menu Items
```
Edit:
1. Click edit (pencil) icon on item
2. Form populates with item data
3. Modify fields
4. Click "Update Dish"

Delete:
1. Click delete (trash) icon on item
2. Confirm deletion
3. Item removed from list
```

### Test 5: Filter Menu Items
```
1. Select a category from "Filter by Category"
2. Subcategory dropdown appears
3. Select a subcategory to filter further
4. Menu items filtered by selection
5. Clear to see all items
```

### Test 6: Invoice/Order Page
```
1. Go to: http://localhost:5000/menu
2. Add items to cart
3. Go to: http://localhost:5000/checkout
4. Fill in customer details
5. Click "Place Order"
6. Redirected to: http://localhost:5000/invoice
7. Review order summary
8. Try the three action buttons:
   - WhatsApp Order (opens WhatsApp with pre-filled message)
   - Call Restaurant (opens phone dialer)
   - Copy Order Details (copies to clipboard)
```

---

## 🔑 Key Features by Page

### Login Page
- ✅ Beautiful Card UI
- ✅ Input validation
- ✅ Error messages
- ✅ Loading state
- ✅ Token storage

### Dashboard
- ✅ Authentication check
- ✅ Automatic redirect to login if unauthorized
- ✅ Statistics display
- ✅ Revenue chart
- ✅ Orders timeline chart
- ✅ Menu items table

### Menu Management
- ✅ Add dishes with image
- ✅ Edit existing dishes
- ✅ Delete with confirmation
- ✅ Filter by category/subcategory
- ✅ Image preview
- ✅ Form validation
- ✅ Dialog-based UI

### Invoice
- ✅ Order summary display
- ✅ Customization display
- ✅ Total calculation
- ✅ WhatsApp integration
- ✅ Call functionality
- ✅ Copy to clipboard
- ✅ Gradient design
- ✅ Empty cart handling

---

## 🔄 Authentication Flow

```
localStorage
    ↓
/admin/login → POST /api/auth/login
    ↓
Receive token → Store in localStorage
    ↓
Navigate to /admin/dashboard
    ↓
Dashboard checks localStorage for token
    ↓
If exists: Fetch dashboard data with token in header
If missing: Redirect to /admin/login
```

---

## 📝 Expected API Endpoints

The backend should have these endpoints:

```
POST /api/auth/login
- Body: { username, password }
- Response: { token, ... }

GET /dashboard
- Headers: Authorization: Bearer <token>
- Response: { message, ... }

GET /api/menu/dishes
- Headers: Authorization: Bearer <token>
- Response: Array of dishes

POST /api/menu/dishes
- Headers: Authorization: Bearer <token>
- Body: FormData with image, name, price, etc.
- Response: { _id, ... }

PUT /api/menu/dishes/:id
- Headers: Authorization: Bearer <token>
- Body: FormData with updated data
- Response: { success: true, ... }

DELETE /api/menu/dishes/:id
- Headers: Authorization: Bearer <token>
- Response: { success: true, ... }
```

---

## 🎨 Design Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Tailwind CSS styling
- ✅ Gradient accents
- ✅ Smooth transitions
- ✅ Icon support (Lucide)
- ✅ Card-based layouts
- ✅ Form validation feedback
- ✅ Error handling UI

---

## ⚙️ Configuration

### API Base URL
- Currently set to: `http://localhost:3000`
- Change in files:
  - `client/src/pages/admin/Login.tsx` (line 8)
  - `client/src/pages/admin/MenuManagement.tsx` (line 23)
  - `client/src/pages/admin/Dashboard.tsx` (line 18)

### Phone Numbers (Invoice)
- Default: `917075543886`
- Edit in: `client/src/pages/Invoice.tsx` (line 14)

---

## 🐛 Troubleshooting

**Problem**: Token not working
- **Solution**: Check localStorage in DevTools
- **Path**: DevTools → Application → Local Storage → http://localhost:5000

**Problem**: API not responding
- **Solution**: Ensure backend is running on http://localhost:3000
- **Check**: Network tab in DevTools

**Problem**: Images not uploading
- **Solution**: Check backend multipart/form-data support

**Problem**: WhatsApp not opening
- **Solution**: Make sure you have WhatsApp Web or app installed
- **Note**: Phone number needs to be configured with country code

---

## 📱 Mobile Testing

All pages are responsive and work on:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

---

## 🎯 Next Steps (Optional)

1. Set up backend with the required endpoints
2. Configure MongoDB database for menu items
3. Implement user management
4. Add order history tracking
5. Set up analytics dashboard
6. Add email notifications
7. Implement payment integration

---

## 📞 Support

For any issues or questions:
1. Check the console (F12 → Console tab)
2. Check Network tab for API errors
3. Verify backend is running
4. Check localStorage for token
5. Review the IMPLEMENTATION_SUMMARY.md file

---

**Status**: ✅ Ready to use!

Start testing the admin features now at: http://localhost:5000/admin/login
