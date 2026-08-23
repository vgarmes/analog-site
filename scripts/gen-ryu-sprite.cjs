/**
 * Generates the Ryu run-cycle spritesheets from the Shadow Warriors GBC sheet.
 *
 * Emits two horizontal strips (light + dark palette) of the 4 animation frames
 * (ping-pong 1,2,3,2) with a transparent gutter between frames so nothing bleeds
 * in at the window edges. The RyuSprite component swaps sheet by theme and steps
 * background-position to animate.
 *
 * Re-run after changing frames/palette:  node scripts/gen-ryu-sprite.cjs
 */
const path = require('path')
const sharp = require('sharp')

const SHEET = path.join(
	__dirname,
	'..',
	'src/assets/Game Boy _ GBC - Ninja Gaiden Shadow _ Shadow Warriors - Playable Characters - Ryu Hayabusa.png'
)
const OUTDIR = path.join(__dirname, '..', 'public/sprites')

const SRC = [
	[18, 11],
	[35, 11],
	[52, 11],
] // sheet frames = anim 1,2,3
const ORDER = [0, 1, 2, 1] // ping-pong: 1,2,3,2
const FW = 16
const FH = 23
const GAP = 2 // transparent gutter between frames
const STRIDE = FW + GAP
const STRIPW = STRIDE * ORDER.length
const SCALE = 6 // bake an integer upscale for crispness

// Per-theme palette: which colour each original tone becomes.
const THEMES = {
	light: { o: [26, 26, 26], m: [90, 90, 90], h: [255, 255, 255] }, // #1a1a1a / #5a5a5a / #fff
	dark: { o: [237, 237, 237], m: [154, 163, 178], h: [255, 255, 255] }, // #ededed / #9aa3b2 / #fff
}

const near = (a, b, t = 24) =>
	Math.abs(a[0] - b[0]) < t && Math.abs(a[1] - b[1]) < t && Math.abs(a[2] - b[2]) < t
const toneOf = p =>
	near(p, [0, 0, 8]) || near(p, [0, 0, 0])
		? 'o'
		: near(p, [96, 96, 96])
			? 'm'
			: near(p, [248, 248, 248])
				? 'h'
				: null

sharp(SHEET)
	.raw()
	.toBuffer({ resolveWithObject: true })
	.then(async ({ data, info }) => {
		const { width: W, channels: C } = info
		const px = (x, y) => {
			const i = (y * W + x) * C
			return [data[i], data[i + 1], data[i + 2]]
		}

		for (const [name, palette] of Object.entries(THEMES)) {
			const buf = Buffer.alloc(STRIPW * FH * 4, 0) // transparent
			ORDER.forEach((si, fi) => {
				const [fx, fy] = SRC[si]
				const xoff = fi * STRIDE
				for (let y = 0; y < FH; y++) {
					for (let x = 0; x < FW; x++) {
						const t = toneOf(px(fx + x, fy + y))
						if (!t) continue
						const [r, g, b] = palette[t]
						const o = (y * STRIPW + (xoff + x)) * 4
						buf[o] = r
						buf[o + 1] = g
						buf[o + 2] = b
						buf[o + 3] = 255
					}
				}
			})
			const out = path.join(OUTDIR, `ryu-run-${name}.png`)
			await sharp(buf, { raw: { width: STRIPW, height: FH, channels: 4 } })
				.resize({ width: STRIPW * SCALE, height: FH * SCALE, kernel: 'nearest' })
				.png()
				.toFile(out)
			console.log(`wrote ${out}  (${STRIPW * SCALE}x${FH * SCALE}, ${ORDER.length} frames, gap ${GAP})`)
		}
		console.log(
			`\nComponent geometry: frame ${FW}x${FH}, stride ${STRIDE}, strip ${STRIPW} units wide (${ORDER.length} frames).`
		)
	})
