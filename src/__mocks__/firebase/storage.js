export const getStorage = jest.fn(() => ({}));
export const ref = jest.fn(() => ({}));
export const uploadBytes = jest.fn(() => Promise.resolve({ ref: {}, metadata: {} }));
export const getDownloadURL = jest.fn(() => Promise.resolve('https://example.com/mock-image.jpg'));
export const deleteObject = jest.fn(() => Promise.resolve());
export const listAll = jest.fn(() => Promise.resolve({ items: [], prefixes: [] }));
