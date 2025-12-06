# Admin Dashboard - Quick Reference Guide

## Dashboard Features Overview

### 🔐 Authentication & Logout
- **Logout Button**: Red destructive button in the top-right corner
- **Confirmation**: You'll be asked to confirm before logging out
- **Action**: Clears your session and returns you to the login page

---

## 📋 Menu Management Buttons (Top Header Bar)

### 1. ➕ Add Category
Creates a new main category for organizing menu items.

**Steps**:
1. Click "Add Category" button
2. Enter the category name (e.g., "Beverages", "Appetizers")
3. Optionally upload a category image
4. Click "Save Category"
5. You'll see a success message

**Example Categories**:
- Beverages
- Main Courses
- Desserts
- Appetizers
- Sides

---

### 2. ➕ Add SubCategory
Creates a subcategory under an existing category.

**Steps**:
1. Click "Add SubCategory" button
2. Select a parent category from the dropdown
3. Enter the subcategory name (e.g., "Cold Drinks", "Hot Drinks")
4. Optionally upload a subcategory image
5. Click "Save SubCategory"
6. Success message appears

**Why SubCategories?**
- Organize items within categories
- Example: Category "Beverages" → SubCategories: "Cold Drinks", "Hot Drinks", "Smoothies"

---

### 3. ➕ Add Item
Adds a new dish/item to the menu.

**Steps**:
1. Click "Add Item" button
2. Fill in all fields:
   - Item Name (required)
   - Price in $ (required)
   - Subcategory (required - select from dropdown)
   - Description (required)
   - Image (optional)
3. Click "Save Item"

**Note**: Items must be assigned to a subcategory. Add categories/subcategories first!

---

### 4. 🔄 Reset to Default
Resets all menu items to the default state.

⚠️ **Warning**: This action cannot be undone!

---

## 📊 Real-Time Dashboard

### Live Charts (Updated Every 30 Seconds)

#### Revenue Overview (Bar Chart)
- Shows daily revenue trends
- Updates with simulated real-world data every 30 seconds
- Shows realistic fluctuations in sales

#### Orders Timeline (Line Chart)
- Shows order volume throughout the day
- Updates with simulated order data every 30 seconds
- Helps identify peak hours

### Statistics Cards
- **Total Revenue**: Cumulative revenue with monthly change
- **Total Items**: Current number of menu items
- **Active Orders**: Current pending orders
- **New Customers**: New customer count with monthly change

---

## 📝 Menu Items Management Table

### Columns
| Column | Description |
|--------|-------------|
| Image | Item thumbnail |
| Name | Item name |
| Subcategory | Which subcategory the item belongs to |
| Price | Item price in dollars |
| Actions | Edit/Delete buttons |

### Actions
- **Edit Icon (✏️)**: Click to modify item details (opens dialog)
- **Delete Icon (🗑️)**: Click to remove item from menu

---

## 💡 Tips & Best Practices

### Workflow for New Menu
1. **First**: Create main categories (Beverages, Food, Desserts, etc.)
2. **Second**: Create subcategories under each category
3. **Third**: Add items to subcategories
4. **Finally**: Upload images for each item

### Image Guidelines
- Use clear, appetizing images
- Recommended: PNG or JPG format
- Recommended size: 500x500px or larger
- Smaller files upload faster

### Category Organization Example
```
Categories (Main)
├── Beverages
│   ├── Cold Drinks
│   │   ├── Iced Coffee
│   │   ├── Smoothie
│   │   └── Iced Tea
│   └── Hot Drinks
│       ├── Coffee
│       └── Tea
└── Food
    ├── Appetizers
    │   └── Spring Rolls
    └── Main Courses
        └── Pasta
```

---

## ⚠️ Important Notes

1. **Token/Session**: Your session expires after a certain period. Log out and log back in if needed.
2. **Images**: Keep image file sizes reasonable for faster uploads
3. **Prices**: Prices are in your currency (shown as $ by default)
4. **Subcategories Required**: You cannot add items without a subcategory
5. **Real-Time Charts**: Charts update automatically every 30 seconds while dashboard is open

---

## 🆘 Troubleshooting

### "Failed to save category"
- Check internet connection
- Ensure you're logged in (valid token)
- Try refreshing the page

### Charts not updating
- Charts update every 30 seconds
- Keep the dashboard open to see updates
- Check browser console for errors (F12)

### Item not appearing after creation
- Refresh the page
- Check if subcategory was selected correctly
- Verify image upload wasn't too large

### Logout not working
- Check if you're already logged out
- Try clearing browser cookies
- Refresh and log in again

---

## 🎯 Common Tasks

### Task: Add a New Beverage Category
1. Click "Add Category"
2. Enter "Beverages"
3. Upload a beverage image (optional)
4. Save

### Task: Add Cold Drinks SubCategory
1. Click "Add SubCategory"
2. Select "Beverages" as parent category
3. Enter "Cold Drinks"
4. Upload image (optional)
5. Save

### Task: Add a Cold Drink Item
1. Click "Add Item"
2. Enter "Iced Coffee"
3. Enter price "$4.99"
4. Select "Cold Drinks" subcategory
5. Enter description "Chilled espresso with milk and ice"
6. Upload coffee image
7. Save

---

## 📞 Support
For issues or questions, contact your system administrator or development team.
