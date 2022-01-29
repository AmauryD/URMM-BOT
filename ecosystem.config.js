/* eslint-disable filenames/match-regex */
/* eslint-disable no-undef */
module.exports = {
  apps : [{
    name: "URMM-BOT",
    script: 'prod/index.js',
    watch: 'prod',
    autorestart : true,
    max_restarts: 5,
    max_memory_restart: "300M",
    fork: true,
    env: {
      NODE_ENV: "production",
    },
  }],
};
