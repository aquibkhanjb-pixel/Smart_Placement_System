// PM2 Ecosystem Configuration for Smart Placement System
module.exports = {
  apps: [{
    name: 'smart-placement',
    script: 'npm',
    args: 'start',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=2048',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,

    // Process management
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,

    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu', // Change to your server user
      host: 'your-server-ip', // Change to your server IP/domain
      ref: 'origin/main',
      repo: 'your-git-repository', // Change to your git repository
      path: '/var/www/smart-placement',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build:production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};