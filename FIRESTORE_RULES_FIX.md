# URGENT: Firestore Security Rules for User Authentication

## Issue: Missing or insufficient permissions

You're getting this error because users don't have permission to write to the `users` collection in Firestore.

## Solution: Update Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the current rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin collection - Allow authenticated users to read
    match /admin/{email} {
      allow read: if request.auth != null;
      allow write: if false; // Only manage via Firebase Console
    }
    
    // Users collection - Allow users to manage their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection - Read for all, write for admins only
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      allow write: if request.auth != null; // For now, any authenticated user can write
      // TODO: Restrict to admins only once admin check is implemented in rules
    }
    
    // Orders collection (for future use)
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid || isAdmin());
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admin/$(request.auth.token.email));
    }
  }
}
```

6. Click **Publish** to save the rules

## What These Rules Do

### Users Collection
- **Read**: Any authenticated user can read user profiles
- **Create**: Users can only create their own profile (userId must match their auth.uid)
- **Update/Delete**: Users can only modify their own profile

### Admin Collection
- **Read**: Any authenticated user can read (needed for admin verification)
- **Write**: Disabled (admins are added manually via Firebase Console)

### Products Collection
- **Read**: Public access (anyone can browse products)
- **Write**: Any authenticated user (will be restricted to admins later)

### Orders Collection (future)
- Users can only see and manage their own orders
- Admins can see all orders

## After Publishing Rules

The errors should disappear and:
- ✅ Google sign-in will work smoothly
- ✅ User profiles will be created automatically
- ✅ Phone OTP will work (once billing is enabled)

---

# Phone Authentication Billing Issue

## Error: `auth/billing-not-enabled`

This error occurs because Firebase requires a billing account to send SMS for phone authentication.

## Options:

### Option 1: Enable Firebase Billing (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on **⚙️ Settings** (gear icon) → **Usage and billing**
3. Click **Details & settings** under your current plan
4. Select **Blaze (Pay as you go)** plan
5. Add payment method (credit card)

**Cost Details:**
- First 10,000 verifications/month: **FREE**
- Beyond that: Very minimal cost per SMS
- For development/testing, you likely won't exceed free tier

### Option 2: Use Test Phone Numbers (For Development Only)

If you don't want to enable billing yet for testing:

1. Go to Firebase Console → Authentication → Sign-in method
2. Scroll down to **Phone numbers for testing**
3. Click **Add phone number**
4. Add: `+911234567890` with OTP: `123456`
5. Click **Add**

Now you can test with:
- Phone: `+911234567890`
- OTP: `123456`
- No SMS will be sent, and it won't require billing

### Option 3: Temporarily Disable Phone Auth

If you want to launch with just Google sign-in for now:

Just use Google OAuth and add phone authentication later when you're ready to enable billing.

---

## Summary Checklist

- [ ] Update Firestore security rules (copy-paste rules above)
- [ ] Publish rules in Firebase Console
- [ ] Choose phone auth option:
  - [ ] Enable billing for production, OR
  - [ ] Add test phone number for development, OR
  - [ ] Use Google OAuth only for now

After completing these steps, your authentication system will work perfectly! 🚀
