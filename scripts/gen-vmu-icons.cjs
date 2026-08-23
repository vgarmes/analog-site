/**
 * Generates the monochrome game icons shown on the <VmuDisplay> dot-matrix screen.
 *
 * Each icon is a 32x32 bitmap (the Dreamcast VMU save-icon format), drawn here
 * procedurally from simple primitives (rect / circle / poly). The script prints
 * an ASCII preview of every icon so you can eyeball the art, then writes the bit
 * rows to src/data/vmu-games.ts, which the component reads at build time.
 *
 * Edit the drawing calls below, then re-run:  node scripts/gen-vmu-icons.cjs
 * ("#" = lit pixel, " " = dark. Icons are centred in the 48x32 LCD by the component.)
 */
const fs = require('fs')
const path = require('path')

const N = 32
const mk = () => Array.from({ length: N }, () => new Array(N).fill(0))
const inb = (x, y) => x >= 0 && x < N && y >= 0 && y < N
const set = (g, x, y, v) => {
	if (inb(x, y)) g[y][x] = v
}
const rect = (g, x0, y0, x1, y1, v = 1) => {
	for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(g, x, y, v)
}
const circle = (g, cx, cy, r, v = 1) => {
	for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
		for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
			if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) set(g, x, y, v)
}
const poly = (g, pts, v = 1) => {
	const ys = pts.map(p => p[1])
	const ymin = Math.floor(Math.min(...ys)),
		ymax = Math.ceil(Math.max(...ys))
	for (let y = ymin; y <= ymax; y++) {
		const xs = []
		for (let i = 0; i < pts.length; i++) {
			const [ax, ay] = pts[i],
				[bx, by] = pts[(i + 1) % pts.length]
			if ((ay <= y && by > y) || (by <= y && ay > y)) {
				const t = (y - ay) / (by - ay)
				xs.push(ax + t * (bx - ax))
			}
		}
		xs.sort((a, b) => a - b)
		for (let k = 0; k + 1 < xs.length; k += 2) {
			const xL = Math.round(xs[k]),
				xR = Math.round(xs[k + 1])
			for (let x = xL; x < xR; x++) set(g, x, y, v)
		}
	}
}

const icons = {}

// 1. SOUL CALIBUR — vertical sword
{
	const g = mk()
	poly(g, [[16, 2], [18, 8], [18, 21], [14, 21], [14, 8]]) // tapered blade
	set(g, 16, 2, 1)
	set(g, 15, 3, 1)
	set(g, 17, 3, 1)
	rect(g, 7, 21, 24, 23) // crossguard
	poly(g, [[7, 23], [5, 25], [8, 24]])
	poly(g, [[24, 23], [26, 25], [23, 24]])
	rect(g, 15, 24, 17, 28) // grip
	circle(g, 16, 29, 2) // pommel
	icons['Soul Calibur'] = g
}

// 2. CHUCHU ROCKET — vertical rocket
{
	const g = mk()
	poly(g, [[16, 2], [21, 9], [11, 9]]) // nose
	rect(g, 11, 9, 21, 24) // body
	poly(g, [[11, 20], [6, 27], [11, 27]]) // left fin
	poly(g, [[21, 20], [26, 27], [21, 27]]) // right fin
	rect(g, 14, 24, 18, 27) // nozzle
	circle(g, 16, 14, 3, 0) // porthole ring
	circle(g, 16, 14, 3)
	circle(g, 16, 14, 2, 0)
	poly(g, [[13, 27], [16, 31], [19, 27]]) // flame
	icons['ChuChu Rocket!'] = g
}

// 3. SONIC ADVENTURE — real 48x32 VMU rip (top-left sprite of the sheet).
// Reserve the slot here; the pixels are extracted from the PNG in main().
icons['Sonic Adventure'] = null

// 4. CRAZY TAXI — side-view car
{
	const g = mk()
	rect(g, 3, 17, 29, 24) // lower body
	poly(g, [[9, 17], [12, 10], [22, 10], [25, 17]]) // cabin
	rect(g, 13, 6, 19, 9) // roof sign
	circle(g, 9, 25, 3) // wheels
	circle(g, 23, 25, 3)
	circle(g, 9, 25, 1, 0)
	circle(g, 23, 25, 1, 0)
	rect(g, 15, 11, 16, 16, 0) // window split
	icons['Crazy Taxi'] = g
}

// 5. JET SET RADIO — spray can
{
	const g = mk()
	rect(g, 14, 3, 17, 6) // nozzle
	;[[20, 5], [22, 3], [24, 4], [25, 1], [23, 6]].forEach(([x, y]) => set(g, x, y, 1)) // spray
	rect(g, 12, 6, 20, 9) // cap
	rect(g, 11, 9, 21, 29) // body
	rect(g, 11, 16, 21, 20, 0) // label band
	rect(g, 13, 17, 19, 19, 1) // label mark
	rect(g, 15, 18, 17, 18, 0)
	icons['Jet Set Radio'] = g
}

// Extract a monochrome grid from a region of a black-on-white sprite sheet.
// Black ink (luma < threshold) becomes a lit pixel.
async function extractFromSheet(file, { left, top, width, height, threshold = 128 }) {
	const sharp = require('sharp')
	const src = path.join(__dirname, '..', file)
	const { data, info } = await sharp(src)
		.extract({ left, top, width, height })
		.greyscale()
		.raw()
		.toBuffer({ resolveWithObject: true })
	return Array.from({ length: height }, (_, y) =>
		Array.from({ length: width }, (_, x) => (data[y * info.width + x] < threshold ? 1 : 0))
	)
}

const rowsOf = g => g.map(r => r.map(c => (c ? '#' : ' ')).join(''))

async function main() {
	// Real Sonic sprite: top-left 48x32 tile of the Sonic Adventure section.
	// The tile's own border lines (left column, bottom row) are part of the art.
	icons['Sonic Adventure'] = await extractFromSheet(
		'public/Dreamcast - Sonic Adventure 2 - Miscellaneous - VMU Rips.png',
		{ left: 24, top: 67, width: 48, height: 32 }
	)

	for (const [name, g] of Object.entries(icons)) {
		console.log('\n=== ' + name + ' (' + g[0].length + 'x' + g.length + ') ===')
		console.log(g.map(r => r.map(c => (c ? '#' : '·')).join('')).join('\n'))
	}

	let ts = `// Monochrome VMU icons for <VmuDisplay>. "#" = lit pixel, " " = dark.\n`
	ts += `// Icons may be up to 48x32; the component centres each one on the screen.\n`
	ts += `// Generated by scripts/gen-vmu-icons.cjs — edit the art there and re-run.\n`
	ts += `export interface VmuGame {\n\ttitle: string\n\t/** Up to 32 rows of up to 48 chars; "#" is a lit dot. */\n\trows: string[]\n}\n\n`
	ts += `export const VMU_GAMES: VmuGame[] = [\n`
	for (const [title, g] of Object.entries(icons)) {
		ts += `\t{\n\t\ttitle: ${JSON.stringify(title)},\n\t\trows: [\n`
		for (const r of rowsOf(g)) ts += `\t\t\t${JSON.stringify(r)},\n`
		ts += `\t\t],\n\t},\n`
	}
	ts += `]\n`

	const outPath = path.join(__dirname, '..', 'src/data/vmu-games.ts')
	fs.mkdirSync(path.dirname(outPath), { recursive: true })
	fs.writeFileSync(outPath, ts)
	console.log(`\nwrote ${outPath} (${Object.keys(icons).length} games)`)
}

main().catch(e => {
	console.error(e)
	process.exit(1)
})
