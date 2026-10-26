import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import ParticleText from './components/ParticleText'
import ParticlePortrait from './components/ParticlePortrait'
import Starfield from './components/Starfield'
import LandingPage from './components/LandingPage'
import { glyphs } from './lib/glyphs'
import { FONT } from './lib/timeline'

export default function App() {
  const [assets, setAssets] = useState(null) // { g: text glyph samples, portrait: ArrayBuffer }
  const [show, setShow] = useState(false)
  const t0 = useRef(null) // shared timeline start; null = (re)start on next frame

  useEffect(() => {
    let live = true
    ;(async () => {
      const [portrait] = await Promise.all([
        fetch('/portrait.bin').then((r) => r.arrayBuffer()),
        document.fonts.load(FONT).catch(() => {}), // canvas text needs Montserrat loaded first
      ])
      if (live) setAssets({ portrait, g: { A: glyphs('BHANUTEJA'), B: glyphs('PORTFOLIO') } })
    })()
    return () => { live = false }
  }, [])

  const replay = () => { t0.current = null; setShow(false) }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0A0A0A' }}>
      {assets && (
        <Canvas camera={{ position: [0, 0, 14], fov: 50, near: 0.1, far: 120 }} dpr={[1, 2]} style={{ position: 'absolute', inset: 0 }}>
          <color attach="background" args={['#0A0A0A']} />
          <Starfield t0={t0} />
          <ParticleText g={assets.g} t0={t0} onReveal={() => setShow(true)} />
          <ParticlePortrait data={assets.portrait} t0={t0} />
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
          </EffectComposer>
        </Canvas>
      )}
      <LandingPage show={show} onReplay={replay} />
    </div>
  )
}
