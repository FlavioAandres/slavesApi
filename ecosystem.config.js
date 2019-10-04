module.exports = {
  apps: [{
    name: 'API MASTER',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      port: 3000,
      masterPort: 3000,
      sclavePort: 4000,
    },

  }, {
    name: 'API SCLAVE',
    script: 'index.js',
    instances: 2,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      port: 4000,
      masterPort: 3000
    },

  },],
};
