import { N, FONT } from './timeline'
/* Text → N sampled pixel coords, sorted left→right so letters morph into letters */
export function glyphs(str) {
  const w = 1600, h = 360, c = document.createElement('canvas')
  c.width = w; c.height = h
  const x = c.getContext('2d')
  x.fillStyle = '#000'; x.fillRect(0, 0, w, h)
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = FONT
  const m = x.measureText(str).width
  if (m > w * 0.94) x.font = FONT.replace('220px', Math.floor((220 * w * 0.94) / m) + 'px')
  x.fillText(str, w / 2, h / 2)
  const d = x.getImageData(0, 0, w, h).data, p = []
  for (let j = 0; j < h; j += 2) for (let i = 0; i < w; i += 2) if (d[(j * w + i) * 4] > 128) p.push(i, j)
  const n = p.length / 2, ix = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [ix[i], ix[j]] = [ix[j], ix[i]] }
  const pick = Array.from({ length: N }, (_, k) => ix[k % n]).sort((a, b) => p[a * 2] - p[b * 2] || p[a * 2 + 1] - p[b * 2 + 1])
  let x0 = 1e9, x1 = 0, y0 = 1e9, y1 = 0
  for (const j of pick) { x0 = Math.min(x0, p[j * 2]); x1 = Math.max(x1, p[j * 2]); y0 = Math.min(y0, p[j * 2 + 1]); y1 = Math.max(y1, p[j * 2 + 1]) }
  return { p, pick, x0, x1, y0, y1 }
}
