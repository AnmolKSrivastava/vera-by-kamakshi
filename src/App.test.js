import { render } from '@testing-library/react';
import App from './App';

// Use the manual mock for react-router-dom
jest.mock('react-router-dom');

// Mock the auth context to avoid Firebase initialization
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    isAdmin: false,
    loading: false,
    signInWithGoogle: jest.fn(),
    signInWithEmail: jest.fn(),
    signInWithPhone: jest.fn(),
    signOut: jest.fn()
  })
}));

// Mock cart context
jest.mock('./context/CartContext', () => ({
  CartProvider: ({ children }) => children,
  useCart: () => ({
    cart: [],
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getCartTotal: () => 0,
    getItemCount: () => 0
  })
}));

// Mock wishlist context
jest.mock('./context/WishlistContext', () => ({
  WishlistProvider: ({ children }) => children,
  useWishlist: () => ({
    wishlist: [],
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: () => false
  })
}));

// Mock admin context
jest.mock('./context/AdminContext', () => ({
  AdminProvider: ({ children }) => children,
  useAdmin: () => ({
    products: [],
    loading: false,
    addProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn()
  })
}));

// Simple smoke test to verify App renders without crashing
test('renders without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
