// @ts-check
// use https://github.com/midudev/canirun.ai/blob/main/astro.config.mjs as reference for adding fonts
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { defineConfig, fontProviders } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],

	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Geist Mono',
			cssVariable: '--font-geist-mono',
			display: 'swap',
			weights: ['100 900'],
			styles: ['normal'],
			fallbacks: ['ui-monospace', 'monospace']
		}
	],

	vite: {
		plugins: [tailwindcss()]
	}
})
