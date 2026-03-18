// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.scrollTo which is not implemented in jsdom
window.scrollTo = jest.fn();

// Mock Firebase modules - manual mocks in __mocks__ directory will be used
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('firebase/storage');

// Mock Firebase config
jest.mock('./config/firebase', () => {
  const mockAuth = {
    currentUser: null
  };

  return {
    app: {},
    auth: mockAuth,
    db: {},
    storage: {},
    googleProvider: {}
  };
});
