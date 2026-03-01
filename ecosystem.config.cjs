module.exports = {
  apps: [
    {
      name: 'alarm',
      script: './src/server.ts',
      interpreter: 'bun',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
