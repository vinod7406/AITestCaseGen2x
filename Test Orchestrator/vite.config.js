import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/jira': {
        target: 'https://placeholder.atlassian.net', // Will be dynamic
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jira/, ''),
      },
    },
  },
});
