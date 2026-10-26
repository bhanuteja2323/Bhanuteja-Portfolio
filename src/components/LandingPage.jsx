import { motion } from 'framer-motion'

const MENU = ['HOME', 'ABOUT', 'SERVICE', 'PROJECT', 'COMPONENTS', 'CONTACT']
const ROLE = 'React Js Developer' // change to 'React Native Developer' if you prefer

/* HTML overlay. The empty .pi-art column is where the particle portrait (in the canvas) sits. */
export default function LandingPage({ show, onReplay }) {
  return (
    <motion.div className="pi-page" initial={{ opacity: 0 }} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 1.4 }} style={{ pointerEvents: show ? 'auto' : 'none' }}>
      <header className="pi-head">
        <div className="pi-logo" />
        <nav className="pi-nav">{MENU.map((m, i) => <a key={m} href="#" className={i === 0 ? 'on' : ''}>{m}</a>)}</nav>
        <a className="pi-btn" href="#">Contact</a>
      </header>
      <main className="pi-main">
        <div className="pi-copy">
          <p className="pi-hi">Hello, I’m</p>
          <h1 className="pi-name">BHANUTEJA</h1>
          <p className="pi-role">{ROLE}</p>
          <a className="pi-btn" href="#">Contact me</a>
        </div>
        <div className="pi-art" />
      </main>
      <button className="pi-replay" onClick={onReplay}>Replay intro</button>
    </motion.div>
  )
}
