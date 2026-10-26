import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { N, TAN, T, clamp, inOut, out3, getT } from '../lib/timeline'

const VS = `attribute float aSize;uniform float uPx;varying vec3 vP;
void main(){vP=(modelMatrix*vec4(position,1.)).xyz;vec4 mv=modelViewMatrix*vec4(position,1.);
gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uPx/-mv.z;}`
const FS = `uniform float uT,uAlpha;uniform vec2 uM;varying vec3 vP;
void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float f=smoothstep(.5,.04,r);
float sp=pow(max(sin(vP.x*.7+vP.y*.5-uT*1.3),0.),20.);
float dm=length(vP.xy-uM);sp+=exp(-dm*dm*.18)*.7;
vec3 silver=vec3(.3,.32,.36)+vec3(.85,.88,1.)*sp;
gl_FragColor=vec4(silver,f*uAlpha);}`

/* Glowing sphere → explosion → "BHANUTEJA" → morph "PORTFOLIO" → shrinks to a top-left logo */
export default function ParticleText({ g, t0, onReveal }) {
  const { size, gl, camera } = useThree()
  const pts = useRef(), sphere = useRef(), revealed = useRef(false)
  const pos = useMemo(() => new Float32Array(N * 3), [])
  const rnd = useMemo(() => {
    const E = new Float32Array(N * 3), R3 = new Float32Array(N * 3), ang = new Float32Array(N)
    const dl = new Float32Array(N), sz = new Float32Array(N), sd = new Float32Array(N), EX = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1), r = 2.5 + Math.pow(Math.random(), 0.6) * 8
      E[i * 3] = r * Math.sin(b) * Math.cos(a) * 1.5; E[i * 3 + 1] = r * Math.sin(b) * Math.sin(a); E[i * 3 + 2] = r * Math.cos(b) * 0.8
      for (let k = 0; k < 3; k++) R3[i * 3 + k] = Math.random() - 0.5
      ang[i] = (Math.random() - 0.5) * 1.4; dl[i] = Math.random(); sd[i] = Math.random(); sz[i] = 0.075 + Math.random() * 0.04
      const c = Math.cos(ang[i]), s = Math.sin(ang[i])
      EX[i * 3] = E[i * 3] * c - E[i * 3 + 1] * s; EX[i * 3 + 1] = E[i * 3] * s + E[i * 3 + 1] * c; EX[i * 3 + 2] = E[i * 3 + 2]
    }
    return { E, EX, R3, ang, dl, sz, sd }
  }, [])
  const D = useMemo(() => {
    const asp = size.width / size.height, VH0 = 2 * 14 * TAN, VW0 = VH0 * asp, Wt = Math.min(11.8, VW0 * 0.9)
    const fill = (gg) => {
      const a = new Float32Array(N * 3), s = Wt / (gg.x1 - gg.x0), cx = (gg.x0 + gg.x1) / 2, cy = (gg.y0 + gg.y1) / 2
      gg.pick.forEach((j, k) => { a[k * 3] = (gg.p[j * 2] - cx) * s; a[k * 3 + 1] = -(gg.p[j * 2 + 1] - cy) * s; a[k * 3 + 2] = rnd.R3[k * 3 + 2] * 0.5 })
      return a
    }
    // logo target: top-left, in screen px at the final camera distance (14 + 15)
    const wpp = (2 * 29 * TAN) / size.height, logoPx = Math.min(150, size.width * 0.3), pad = Math.max(24, size.width * 0.05)
    return { VW0, VH0, TA: fill(g.A), TB: fill(g.B), s: (logoPx * wpp) / Wt, lx: (-size.width / 2 + pad + logoPx / 2) * wpp, ly: (size.height / 2 - 44) * wpp }
  }, [g, size.width, size.height, rnd])
  const uni = useMemo(() => ({ uPx: { value: 1 }, uAlpha: { value: 0 }, uT: { value: 0 }, uM: { value: new THREE.Vector2(99, 99) } }), [])

  useFrame((st) => {
    const t = getT(t0, st)
    const { E, EX, R3, ang, dl, sd } = rnd, { TA, TB, s, lx, ly } = D
    const pl = inOut(clamp((t - T.logo) / 1.8))
    for (let i = 0; i < N; i++) {
      const i3 = i * 3, d = dl[i]
      let x, y, z
      if (t < T.form) {
        const e = out3(clamp((t - T.burst - d * 0.25) / 0.95)), a = ang[i] * e, c = Math.cos(a), sn = Math.sin(a)
        x = E[i3] * e * c - E[i3 + 1] * e * sn; y = E[i3] * e * sn + E[i3 + 1] * e * c; z = E[i3 + 2] * e
      } else if (t < T.morph) {
        const p = clamp((t - T.form - d * 0.6) / 1.0), e = inOut(p), w = Math.sin(Math.PI * p) * 3
        x = EX[i3] + (TA[i3] - EX[i3]) * e + R3[i3] * w; y = EX[i3 + 1] + (TA[i3 + 1] - EX[i3 + 1]) * e + R3[i3 + 1] * w; z = EX[i3 + 2] + (TA[i3 + 2] - EX[i3 + 2]) * e + R3[i3 + 2] * w
      } else if (t < T.logo) {
        const e = inOut(clamp((t - T.morph - d * 0.3) / 0.9))
        x = TA[i3] + (TB[i3] - TA[i3]) * e; y = TA[i3 + 1] + (TB[i3 + 1] - TA[i3 + 1]) * e; z = TA[i3 + 2] + (TB[i3 + 2] - TA[i3 + 2]) * e
      } else {
        x = TB[i3] * (1 + (s - 1) * pl) + lx * pl; y = TB[i3 + 1] * (1 + (s - 1) * pl) + ly * pl; z = TB[i3 + 2] * (1 - pl)
      }
      const A = t > T.form ? 0.03 * (1 - pl) : 0, q = t * 0.9 + sd[i] * 40
      pos[i3] = x + Math.sin(q) * A; pos[i3 + 1] = y + Math.cos(q * 1.1 + 1.3) * A; pos[i3 + 2] = z + Math.sin(q * 0.7 + 2.1) * A * 2
    }
    pts.current.geometry.attributes.position.needsUpdate = true
    uni.uT.value = t
    uni.uPx.value = (size.height * gl.getPixelRatio()) / (2 * TAN)
    uni.uAlpha.value = clamp((t - T.burst) / 0.3) * 0.85 * (1 - 0.7 * pl)
    uni.uM.value.set((st.pointer.x * D.VW0) / 2, (st.pointer.y * D.VH0) / 2)
    camera.position.z = 14 + 15 * pl
    const k = t < T.burst ? 1 + 0.15 * Math.sin(t * 12) : Math.max(0, 1 - (t - T.burst) / 0.25)
    sphere.current.scale.setScalar(Math.max(k, 0.001)); sphere.current.visible = k > 0.001
    if (t < T.reveal) revealed.current = false
    else if (!revealed.current) { revealed.current = true; onReveal() }
  })

  return (
    <>
      <mesh ref={sphere}><sphereGeometry args={[0.32, 32, 32]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <points ref={pts} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[rnd.sz, 1]} />
        </bufferGeometry>
        <shaderMaterial uniforms={uni} vertexShader={VS} fragmentShader={FS} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  )
}
