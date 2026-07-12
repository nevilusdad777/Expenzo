import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'icons/*.png'],
			manifest: {
				name: 'Expenzo Finance Manager',
				short_name: 'Expenzo',
				description:
					'Track income, expenses, and accounts privately and securely.',
				theme_color: '#0a0a0f',
				background_color: '#0a0a0f',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				icons: [
					{
						src: 'icons/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'icons/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'icons/icon-maskable-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				runtimeCaching: [
					{
						urlPattern: ({ url, request }) =>
							url.pathname.startsWith('/api/') && request.method === 'GET',
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'api-get-cache',
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 60 * 60 * 24 * 7,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: ({ url, request }) =>
							url.pathname.startsWith('/api/') && request.method !== 'GET',
						handler: 'NetworkOnly',
					},
				],
			},
			devOptions: {
				enabled: true,
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
		},
	},
	server: {
		host: '0.0.0.0',
		port: 5173,
	},
});
