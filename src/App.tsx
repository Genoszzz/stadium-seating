import { useState } from 'react'
import { PanelRightClose, PanelRight } from 'lucide-react'
import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import HelpModal from './components/HelpModal'

export default function App() {
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-cyber-bg">
      <header className="h-11 flex items-center px-3 gap-4 border-b border-cyber-border/40 bg-cyber-panel/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-2 h-2 rounded-full bg-cyber-blue animate-glow-pulse" />
          <span className="font-display font-bold text-sm text-cyber-blue tracking-wider">STADIUM</span>
          <span className="text-[10px] text-[#445] font-body">排座系统</span>
        </div>
        <div className="w-px h-5 bg-cyber-border/30" />
        <Toolbar onOpenHelp={() => setHelpModalOpen(true)} />
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 text-[#556] hover:text-cyber-blue transition-colors"
          >
            {rightCollapsed ? <PanelRight size={15} /> : <PanelRightClose size={15} />}
          </button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg" />
          <Canvas />
        </main>
        <aside className="cyber-panel border-l border-cyber-border/30 shrink-0 transition-all duration-300 overflow-hidden flex flex-col"
          style={{ width: rightCollapsed ? 0 : 260 }}>
          {!rightCollapsed && <PropertiesPanel />}
        </aside>
      </div>
      <footer className="h-6 flex items-center justify-between px-3 text-[10px] text-[#334] border-t border-cyber-border/20 bg-cyber-panel/50 shrink-0 font-display tracking-wider">
        <span>SYS.ONLINE</span>
        <span className="text-cyber-blue">v2.0</span>
      </footer>
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </div>
  )
}
