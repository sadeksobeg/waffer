// emptyModule.js - stub for browser-only dependencies
module.exports = {
  // Basic IDB functions that Firebase might try to use
  openDB: () => Promise.resolve({}),
  deleteDB: () => Promise.resolve(),
  unwrap: (x) => x,
  wrap: (x) => x,
  // Add any other methods that might be needed
  default: {
    openDB: () => Promise.resolve({}),
    deleteDB: () => Promise.resolve(),
    unwrap: (x) => x,
    wrap: (x) => x
  }
};
