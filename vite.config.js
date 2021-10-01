import react from '@vitejs/plugin-react'

/**
 * @type {import('vite').UserConfig}
 */
export default {
  root: 'examples',
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
}
