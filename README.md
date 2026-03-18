# VERA by Kamakshi

A luxury leather bags e-commerce platform built with React and Firebase.

## 🌟 Features

- **Product Catalog**: Browse luxury leather bags with advanced filtering and search
- **Shopping Cart**: Full cart management with persistent storage
- **Wishlist**: Save favorite products for later
- **User Authentication**: Phone-based authentication with Firebase
- **Product Reviews**: Customer reviews and ratings system
- **Admin Dashboard**: Complete product, inventory, and analytics management
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Payment Integration**: Ready for Razorpay/Stripe integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AnmolKSrivastava/vera-by-kamakshi.git
cd vera-by-kamakshi
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project
   - Add your Firebase configuration to `src/config/firebase.js`
   - Enable Authentication (Phone) and Firestore Database

4. Run the development server:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📦 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `firebase deploy`
Deploys the app to Firebase Hosting (requires Firebase CLI)

## 🚀 Deployment

This project uses automated CI/CD deployment to Firebase Hosting via GitHub Actions.

### Automatic Deployment
- **Push to `main` branch** → Deploys to production
- **Create Pull Request** → Creates preview deployment

### Manual Deployment
```bash
npm run build
firebase deploy --only hosting
```

For complete CI/CD setup instructions, see [CICD_SETUP.md](CICD_SETUP.md)

**Live Site:** https://vera-by-kamakshi.web.app

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Styling**: CSS3 with custom design system
- **Charts**: Recharts for analytics visualization
- **State Management**: Context API

## 📊 Project Status

Current completion: **~75%**

See [progressReport.md](progressReport.md) for detailed feature status.

## 📝 License

This project is private and proprietary.

## 👤 Author

VERA by Kamakshi - Luxury Leather Bags
