export const getFirestore = jest.fn(() => ({}));
export const collection = jest.fn(() => ({}));
export const doc = jest.fn(() => ({}));
export const getDoc = jest.fn(() => Promise.resolve({ exists: () => false, data: () => null }));
export const getDocs = jest.fn(() => Promise.resolve({ docs: [] }));
export const setDoc = jest.fn(() => Promise.resolve());
export const updateDoc = jest.fn(() => Promise.resolve());
export const deleteDoc = jest.fn(() => Promise.resolve());
export const query = jest.fn(() => ({}));
export const where = jest.fn(() => ({}));
export const orderBy = jest.fn(() => ({}));
export const limit = jest.fn(() => ({}));
export const addDoc = jest.fn(() => Promise.resolve({ id: 'mock-id' }));
export const writeBatch = jest.fn(() => ({
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  commit: jest.fn(() => Promise.resolve())
}));
export const serverTimestamp = jest.fn(() => new Date());
export const Timestamp = {
  now: jest.fn(() => new Date()),
  fromDate: jest.fn((date) => date)
};
