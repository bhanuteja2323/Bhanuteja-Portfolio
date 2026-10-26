import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { TAN, T, clamp, inOut, getT } from '../lib/timeline'

const VS = `attribute vec3 aColor;attribute float aSize;uniform float uPx,uSz;varying vec3 vC;
void main(){vC=aColor;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uSz*uPx/-mv.z;}`
const FS = `uniform float uAlpha;varying vec3 vC;
void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float f=smoothstep(.5,.04,r);gl_FragColor=vec4(vC,f*uAlpha);}`

/* Photo → point cloud. `data` = public/portrait.bin: [x,y uint16 ×N][r,g,b uint8 ×N] (50,000 points).
   Dissolves in on the right side of the landing page. */
export default function ParticlePortrait({ data, t0 }) {
  const { size, gl } = useThree()
  const ref = useRef(), settled = useRef(false)
  const P = useMemo(() => {
    const n = (data.byteLength / 7) | 0
    const xy = new Uint16Array(data, 0, n * 2), rgb = new Uint8Array(data, n * 4)
    const col = new Float32Array(n * 3), sz = new Float32Array(n), dl = new Float32Array(n), jit = new Float32Array(n * 3), from = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 3; k++) { col[i * 3 + k] = rgb[i * 3 + k] / 255; jit[i * 3 + k] = Math.random() - 0.5 }
      sz[i] = 0.032 + Math.random() * 0.016; dl[i] = Math.random()
      from[i * 3] = (Math.random() - 0.5) * 26; from[i * 3 + 1] = (Math.random() - 0.5) * 16; from[i * 3 + 2] = -6 - Math.random() * 10
    }
    return { n, xy, rgb, col, sz, dl, jit, from, pos: new Float32Array(n * 3) }
  }, [data])
  // final positions, laid out for the camera's final distance (z = 29)
  const target = useMemo(() => {
    const asp = size.width / size.height, whole = 2 * 29 * TAN, wholeW = whole * asp, mob = asp < 0.95
    const ph = mob ? whole * 0.38 : whole * 0.72, pw = ph * 0.8, cx = mob ? 0 : wholeW * 0.23, cy = mob ? whole * 0.16 : 0
    const a = new Float32Array(P.n * 3)
    for (let i = 0; i < P.n; i++) {
      const lum = (P.rgb[i * 3] + P.rgb[i * 3 + 1] + P.rgb[i * 3 + 2]) / 765
      a[i * 3] = cx + (P.xy[i * 2] / 65535 - 0.5) * pw
      a[i * 3 + 1] = cy - (P.xy[i * 2 + 1] / 65535 - 0.5) * ph
      a[i * 3 + 2] = (lum - 0.4) * 1.1 + P.jit[i * 3 + 2] * 0.2
    }
    return a
  }, [P, size.width, size.height])
  useEffect(() => { settled.current = false }, [target])
  const uni = useMemo(() => ({ uPx: { value: 1 }, uSz: { value: 2.2 }, uAlpha: { value: 0 } }), [])

  useFrame((st) => {
    const t = getT(t0, st)
    uni.uPx.value = (size.height * gl.getPixelRatio()) / (2 * TAN)
    if (t < T.portrait) { uni.uAlpha.value = 0; settled.current = false; return }
    const base = clamp((t - T.portrait) / (T.portraitDone - T.portrait))
    uni.uAlpha.value = Math.min(0.95, base * 1.3)
    if (!settled.current) {
      const { pos, from, jit, dl, n } = P
      for (let i = 0; i < n; i++) {
        const i3 = i * 3, e = inOut(clamp((base - dl[i] * 0.5) / 0.5)), sw = (1 - e) * 2
        pos[i3] = from[i3] + (target[i3] - from[i3]) * e + jit[i3] * sw
        pos[i3 + 1] = from[i3 + 1] + (target[i3 + 1] - from[i3 + 1]) * e + jit[i3 + 1] * sw
        pos[i3 + 2] = from[i3 + 2] + (target[i3 + 2] - from[i3 + 2]) * e + jit[i3 + 2] * sw
      }
      ref.current.geometry.attributes.position.needsUpdate = true
      if (base >= 1) settled.current = true
    }
    ref.current.rotation.y = st.pointer.x * 0.08
    ref.current.rotation.x = -st.pointer.y * 0.05
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[P.pos, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[P.col, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[P.sz, 1]} />
      </bufferGeometry>
      <shaderMaterial uniforms={uni} vertexShader={VS} fragmentShader={FS} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
