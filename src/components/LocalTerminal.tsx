import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from 'xterm-addon-webgl';
import 'xterm/css/xterm.css';

function LocalTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new XTerm({
        theme: {
          background: '#0a0b14',
          foreground: '#00ff9d',
          cursor: '#00ff9d',
          selection: 'rgba(0, 255, 157, 0.3)',
          black: '#1a1b26',
          blue: '#7aa2f7',
          cyan: '#7dcfff',
          green: '#00ff9d',
          magenta: '#bb9af7',
          red: '#f7768e',
          white: '#c0caf5',
          yellow: '#e0af68'
        },
        fontSize: 14,
        fontFamily: 'monospace',
        cursorBlink: true,
        allowTransparency: true
      });
      
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const webglAddon = new WebglAddon();
      
      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      term.loadAddon(webglAddon);
      
      xtermRef.current = term;
      fitAddonRef.current = fitAddon;
      
      term.open(terminalRef.current);
      
      setTimeout(() => {
        fitAddon.fit();
      }, 0);

      term.writeln('\x1b[32m╔════════════════════════════════════╗\x1b[0m');
      term.writeln('\x1b[32m║    HOME CONSOLE - LOCAL TERMINAL   ║\x1b[0m');
      term.writeln('\x1b[32m╚════════════════════════════════════╝\x1b[0m');
      term.writeln('');
      term.writeln('\x1b[36mローカルターミナルに接続しました\x1b[0m');
      term.writeln('\x1b[33m$ \x1b[0m');

      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (xtermRef.current) {
          xtermRef.current.dispose();
        }
      };
    }
  }, []);

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 cyber-text text-[#00ff9d]">ローカルターミナル</h2>
        <p className="text-gray-400">マイコンソールサーバーのターミナル</p>
      </div>
      
      <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 h-[calc(100vh-12rem)] relative terminal-container">
        <div ref={terminalRef} className="h-full" />
      </div>
    </div>
  );
}

export default LocalTerminal;