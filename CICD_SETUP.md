# CI/CD Pipeline Setup Guide

## 📋 Overview
This project now has automated CI/CD deployment to Firebase Hosting using GitHub Actions.

## ✅ Files Created

### Firebase Configuration
- `firebase.json` - Firebase hosting and services configuration
- `.firebaserc` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore database indexes
- `storage.rules` - Firebase Storage security rules

### GitHub Actions Workflows
- `.github/workflows/firebase-deploy.yml` - Main deployment workflow
- `.github/workflows/firebase-preview.yml` - Preview deployment for PRs

## 🔧 Setup Instructions

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Project (Optional - Already configured)
```bash
firebase use vera-by-kamakshi
```

### 4. Generate Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **vera-by-kamakshi**
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file (keep it secure!)

### 5. Configure GitHub Secrets

Go to your GitHub repository: **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

#### Required Secret:
- `FIREBASE_SERVICE_ACCOUNT`
  - Paste the entire content of the service account JSON file

#### Optional Secrets (if you want to use environment variables):
- `REACT_APP_FIREBASE_API_KEY` = `AIzaSyCP4U1gRuMeblfghFoY-KVkBXY6h9ozFnk`
- `REACT_APP_FIREBASE_AUTH_DOMAIN` = `vera-by-kamakshi.firebaseapp.com`
- `REACT_APP_FIREBASE_PROJECT_ID` = `vera-by-kamakshi`
- `REACT_APP_FIREBASE_STORAGE_BUCKET` = `vera-by-kamakshi.firebasestorage.app`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` = `627256412925`
- `REACT_APP_FIREBASE_APP_ID` = `1:627256412925:web:6f4bdb71762b8d3a294c94`
- `REACT_APP_FIREBASE_MEASUREMENT_ID` = `G-LLMS8RF5LH`

**Note:** The `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### 6. Deploy Firestore Rules and Indexes
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

## 🚀 How It Works

### Automatic Deployments

#### Main Branch (Production)
- **Trigger:** Push to `main` branch
- **Action:** Runs tests, builds app, deploys to live Firebase Hosting
- **URL:** `https://vera-by-kamakshi.web.app`

#### Pull Requests (Preview)
- **Trigger:** PR created/updated to `main` branch
- **Action:** Builds app, creates preview channel
- **URL:** GitHub bot comments with preview URL

### Workflow Steps
1. ✅ Checkout code
2. ✅ Setup Node.js 18
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run tests
5. ✅ Build React app
6. ✅ Deploy to Firebase Hosting

## 📦 Manual Deployment

If you need to deploy manually:

```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

## 🔒 Security Rules

### Firestore Rules
- Products: Public read, admin write
- Users: Owner or admin access
- Carts/Wishlists: Owner only
- Orders: Owner read, admin write
- Reviews: Public read, authenticated write

### Storage Rules
- Product images: Public read, admin write
- User uploads: Public read, owner write

## 🌐 Firebase Hosting URLs

- **Production:** https://vera-by-kamakshi.web.app
- **Production (alternate):** https://vera-by-kamakshi.firebaseapp.com
- **Preview:** Created automatically for each PR

## 📊 Monitoring

Monitor your deployments:
- **Firebase Console:** https://console.firebase.google.com/project/vera-by-kamakshi/hosting
- **GitHub Actions:** https://github.com/AnmolKSrivastava/vera-by-kamakshi/actions

## 🐛 Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Verify all dependencies are in `package.json`
- Ensure tests pass locally: `npm test`

### Deployment Fails
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is set correctly
- Check Firebase project permissions
- Ensure Firebase CLI is up to date: `npm i -g firebase-tools@latest`

### Rules Deployment Issues
```bash
# Test rules locally
firebase emulators:start --only firestore

# Deploy rules separately
firebase deploy --only firestore:rules
```

## 📝 Next Steps

1. ✅ Push code to GitHub
2. ✅ Watch GitHub Actions run automatically
3. ✅ Check deployment at Firebase Console
4. ✅ Visit your live site!

## 🔄 Continuous Integration Features

- ✅ Automated testing on every PR
- ✅ Build verification before merge
- ✅ Preview deployments for PRs
- ✅ Production deployment on main branch
- ✅ Cache optimization for faster builds
- ✅ Security rules deployment

---

**Created:** March 18, 2026  
**Project:** VERA by Kamakshi  
**Status:** Ready for deployment 🚀
