export const getAuth = jest.fn(() => ({ currentUser: null }));

export const onAuthStateChanged = jest.fn((auth, callback) => {
  setTimeout(() => callback(null), 0);
  return () => {}; // Return empty function for unsubscribe
});

export const signInWithEmailAndPassword = jest.fn(() => Promise.resolve({ user: {} }));
export const signInWithPopup = jest.fn(() => Promise.resolve({ user: {} }));
export const signOut = jest.fn(() => Promise.resolve());
export const setPersistence = jest.fn(() => Promise.resolve());
export const browserLocalPersistence = {};
export const GoogleAuthProvider = jest.fn();
export const RecaptchaVerifier = jest.fn(() => ({
  verify: jest.fn(() => Promise.resolve('token'))
}));
export const signInWithPhoneNumber = jest.fn(() => Promise.resolve({
  confirm: jest.fn(() => Promise.resolve({ user: {} }))
}));
