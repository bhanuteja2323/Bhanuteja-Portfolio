import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { T, clamp, getT } from '../lib/timeline'

/* 500 small stars, fade in with the landing page, slow parallax on mouse move */
export default function Starfield({ t0 }) {
  const grp = useRef(), mat = useRef()
  const pos = useMemo(() => {
    const a = new Float32Array(1500)
    for (let i = 0; i < 500; i++) { a[i * 3] = (Math.random() - 0.5) * 90; a[i * 3 + 1] = (Math.random() - 0.5) * 54; a[i * 3 + 2] = -4 - Math.random() * 30 }
    return a
  }, [])
  useFrame((st) => {
    const t = getT(t0, st)
    mat.current.opacity = clamp((t - T.reveal) / 2.5) * 0.9
    grp.current.position.x += (-st.pointer.x * 1.4 - grp.current.position.x) * 0.03
    grp.current.position.y += (-st.pointer.y * 0.9 - grp.current.position.y) * 0.03
    grp.current.rotation.y = t * 0.003
  })
  return (
    <group ref={grp}>
      <points frustumCulled={false}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
        <pointsMaterial ref={mat} size={0.16} color="#cfd8ff" transparent opacity={0} depthWrite={false} />
      </points>
    </group>
  )
}
