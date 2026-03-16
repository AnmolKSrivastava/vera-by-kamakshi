# Admin Collection Setup Guide

## Firestore Structure

To grant admin access, you need to create an `admin` collection in your Firebase Firestore database.

### Structure:

```
admin (collection)
  ├─ your-email@gmail.com (document)
  │   └─ { email: "your-email@gmail.com", addedAt: <timestamp>, name: "Your Name" }
  ├─ another-admin@gmail.com (document)
  │   └─ { email: "another-admin@gmail.com", addedAt: <timestamp>, name: "Admin 2" }
```

## How to Set Up (Firebase Console):

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project: **vera-by-kamakshi**
3. Click on **Firestore Database** in the left sidebar

### Step 2: Create Admin Collection
1. Click **Start collection**
2. Collection ID: `admin`
3. Click **Next**

### Step 3: Add Your First Admin
1. **Document ID**: Enter your email (e.g., `youremail@gmail.com`)
2. Add fields:
   - Field: `email` | Type: `string` | Value: `youremail@gmail.com`
   - Field: `name` | Type: `string` | Value: `Your Name`
   - Field: `addedAt` | Type: `timestamp` | Value: (current time)
3. Click **Save**

### Step 4: Add More Admins (Optional)
1. Click **Add document**
2. **Document ID**: New admin's email
3. Add the same fields as above
4. Click **Save**

## How It Works:

- The app fetches all document IDs from the `admin` collection
- Each document ID should be an admin's email address
- When a user logs in with Google, their email is checked against these document IDs
- If their email matches a document ID, they get admin access

## Security:

Make sure to set proper Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin collection - only authenticated users can read
    match /admin/{email} {
      allow read: if request.auth != null;
      allow write: if false; // Manage admins only through Firebase Console
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      allow write: if request.auth != null && 
                      exists(/databases/$(database)/documents/admin/$(request.auth.token.email));
    }
  }
}
```

## Testing:

1. Add your Google account email to the `admin` collection
2. Visit your website
3. Click **Admin** in the footer
4. Sign in with Google
5. You should see the Admin Dashboard

## Troubleshooting:

- Check browser console for logs: `[Firestore] Admin emails fetched from "admin" collection: [...]`
- Verify collection name is exactly `admin` (lowercase)
- Verify document IDs match your Google account email exactly
- Check Firebase Authentication is enabled for Google provider
