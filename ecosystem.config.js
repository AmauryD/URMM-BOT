module.exports = {
  apps : [{
    name: "URMM-BOT",
    script: 'prod/index.js',
    watch: 'prod',
    autorestart : true,
    max_restarts: 5,
    max_memory_restart: "200M",
    fork: true,
    env: {
      NODE_ENV: "production",
    },
  }],
};
