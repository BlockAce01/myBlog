const { disconnectDB } = require('./src/utils/db');

module.exports = async () => {
  await disconnectDB();
  await global.mongod.stop();
};
