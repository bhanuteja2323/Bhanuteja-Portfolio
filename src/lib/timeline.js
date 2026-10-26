export const N = 2500 // text particles
export const FONT = '800 220px Montserrat, "Arial Black", Impact, sans-serif'
export const TAN = Math.tan((25 * Math.PI) / 180) // camera fov = 50
// seconds: sphere → burst → BHANUTEJA (hold 1.8s) → morph 1.2s → logo → reveal → portrait
export const T = { burst: 0.8, form: 2.0, morph: 5.4, logo: 7.2, reveal: 9.0, portrait: 9.6, portraitDone: 12.4 }
export const clamp = (v) => Math.min(1, Math.max(0, v))
export const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
export const out3 = (p) => 1 - Math.pow(1 - p, 3)
// shared timeline clock: first caller after (re)start sets t0
export function getT(t0, st) {
  if (t0.current == null) t0.current = st.clock.elapsedTime
  return st.clock.elapsedTime - t0.current
}
