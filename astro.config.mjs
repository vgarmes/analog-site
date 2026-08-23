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
			provider: fontProviders.local(),
			name: 'Geist Pixel Square',
			cssVariable: '--font-geist-pixel-square',
			display: 'swap',
			fallbacks: ['ui-monospace', 'monospace'],
			options: {
				variants: [
					{
						weight: 400,
						style: 'normal',
						src: ['./src/assets/fonts/GeistPixel-Square.woff2']
					}
				]
			}
		},
		{
			provider: fontProviders.local(),
			name: 'Geist Pixel Circle',
			cssVariable: '--font-geist-pixel-circle',
			display: 'swap',
			fallbacks: ['ui-monospace', 'monospace'],
			options: {
				variants: [
					{
						weight: 400,
						style: 'normal',
						src: ['./src/assets/fonts/GeistPixel-Circle.woff2']
					}
				]
			}
		},
		{
			provider: fontProviders.local(),
			name: 'Geist Pixel Grid',
			cssVariable: '--font-geist-pixel-grid',
			display: 'swap',
			fallbacks: ['ui-monospace', 'monospace'],
			options: {
				variants: [
					{
						weight: 400,
						style: 'normal',
						src: ['./src/assets/fonts/GeistPixel-Grid.woff2']
					}
				]
			}
		},
		{
			provider: fontProviders.local(),
			name: 'Geist Pixel Triangle',
			cssVariable: '--font-geist-pixel-triangle',
			display: 'swap',
			fallbacks: ['ui-monospace', 'monospace'],
			options: {
				variants: [
					{
						weight: 400,
						style: 'normal',
						src: ['./src/assets/fonts/GeistPixel-Triangle.woff2']
					}
				]
			}
		},
		{
			provider: fontProviders.local(),
			name: 'Geist Pixel Line',
			cssVariable: '--font-geist-pixel-line',
			display: 'swap',
			fallbacks: ['ui-monospace', 'monospace'],
			options: {
				variants: [
					{
						weight: 400,
						style: 'normal',
						src: ['./src/assets/fonts/GeistPixel-Line.woff2']
					}
				]
			}
		}
	],

	vite: {
		plugins: [tailwindcss()]
	}
})
