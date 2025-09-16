// Connection status module for sharing MongoDB connection state
let isConnected = false;

const setConnected = (connected) => {
  isConnected = connected;
};

const getConnected = () => {
  return isConnected;
};

module.exports = {
  setConnected,
  getConnected
};
