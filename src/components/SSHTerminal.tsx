// SSHTerminal.tsx の xterm 直接使用バージョン
import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Plus, Trash2, Power } from 'lucide-react';
import 'xterm/css/xterm.css';

interface Server {
  id: string;
  name: string;
  host: string;
}

function SSHTerminal() {
  const [servers, setServers] = useState<Server[]>(() => {
    try {
      const saved = localStorage.getItem('sshServers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading servers from localStorage:', e);
      return [];
    }
  });
  
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', host: '' });
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sshServers', JSON.stringify(servers));
    } catch (e) {
      console.error('Error saving servers to localStorage:', e);
    }
  }, [servers]);

  useEffect(() => {
    // ターミナルのDOM要素が準備できているか確認
    if (terminalRef.current && !xtermRef.current) {
      // 少し遅延させてDOMの準備を待つ
      setTimeout(() => {
        try {
          // ターミナルの初期化
          const term = new Terminal({
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
          
          term.loadAddon(fitAddon);
          term.loadAddon(webLinksAddon);
          
          xtermRef.current = term;
          fitAddonRef.current = fitAddon;
          
          term.open(terminalRef.current);
          
          // ターミナルが開かれた後、十分な遅延を入れてからfit実行
          setTimeout(() => {
            if (fitAddonRef.current) {
              try {
                fitAddonRef.current.fit();
              } catch (e) {
                console.error('Error fitting terminal:', e);
              }
            }
          }, 300);

          term.writeln('\x1b[32m╔════════════════════════════════════╗\x1b[0m');
          term.writeln('\x1b[32m║      HOME CONSOLE - SSH TERMINAL    ║\x1b[0m');
          term.writeln('\x1b[32m╚════════════════════════════════════╝\x1b[0m');
          term.writeln('');
          term.writeln('\x1b[36m接続待機中...\x1b[0m');
          term.writeln('\x1b[33mサーバーを選択してください\x1b[0m');

          const handleResize = () => {
            if (fitAddonRef.current) {
              try {
                fitAddonRef.current.fit();
              } catch (e) {
                console.error('Error fitting terminal on resize:', e);
              }
            }
          };

          window.addEventListener('resize', handleResize);

          return () => {
            window.removeEventListener('resize', handleResize);
            
            // 接続を閉じる
            if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
            }
            
            // ターミナルの破棄
            if (xtermRef.current) {
              try {
                xtermRef.current.dispose();
              } catch (e) {
                console.error('Error disposing terminal:', e);
              }
              xtermRef.current = null;
            }
          };
        } catch (error) {
          console.error('Terminal initialization error:', error);
        }
      }, 100);
    }
  }, []);

  const handleAddServer = () => {
    if (newServer.name && newServer.host) {
      setServers([...servers, { ...newServer, id: Date.now().toString() }]);
      setNewServer({ name: '', host: '' });
      setIsAddingServer(false);
    }
  };

  const handleDeleteServer = (id: string) => {
    setServers(servers.filter(server => server.id !== id));
    if (selectedServer?.id === id) {
      setSelectedServer(null);
    }
  };

  const handleConnect = async (server: Server) => {
    setSelectedServer(server);
    
    if (xtermRef.current) {
      // 既存の接続を閉じる
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // ターミナルをクリアして接続メッセージを表示
      xtermRef.current.clear();
      xtermRef.current.writeln(`\x1b[36m${server.name} (${server.host}) に接続中...\x1b[0m`);
      
      try {
        // WebSocketのURLを修正 - /ws プロキシを使用する
        const socket = new WebSocket(`ws://${window.location.host}/ws?host=${server.host}&username=nishio`);
        wsRef.current = socket;
        
        // WebSocketの接続が開いたときの処理
        socket.onopen = () => {
          console.log('WebSocket接続が開きました');
          if (xtermRef.current) {
            xtermRef.current.writeln('\x1b[32mWebSocket接続が確立されました\x1b[0m');
          }
        };
        
        // WebSocketからメッセージを受信したときの処理
        socket.onmessage = (event) => {
          if (xtermRef.current) {
            xtermRef.current.write(event.data);
          }
        };
        
        // エラー発生時の処理
        socket.onerror = (error) => {
          console.error('WebSocket Error:', error);
          if (xtermRef.current) {
            xtermRef.current.writeln('\x1b[31mエラー: 接続に失敗しました\x1b[0m');
          }
        };
        
        // 接続が閉じられたときの処理
        socket.onclose = () => {
          if (xtermRef.current) {
            xtermRef.current.writeln('\x1b[31m接続が閉じられました\x1b[0m');
          }
        };
        
        // ユーザー入力をWebSocketに送信
        if (xtermRef.current) {
          xtermRef.current.onData((data) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(data);
            }
          });
        }
      } catch (error) {
        console.error('Connection error:', error);
        if (xtermRef.current) {
          xtermRef.current.writeln('\x1b[31mエラー: サーバーに接続できません\x1b[0m');
        }
      }
    }
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 cyber-text text-[#00ff9d]">SSHターミナル</h2>
        <p className="text-gray-400">セキュアなリモート接続インターフェース</p>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-1 space-y-4">
          <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#00ff9d] font-semibold">サーバー一覧</h3>
              <button
                onClick={() => setIsAddingServer(true)}
                className="p-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
              >
                <Plus className="w-4 h-4 text-[#00ff9d]" />
              </button>
            </div>

            {isAddingServer && (
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="サーバー名"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  className="w-full bg-gray-900/80 p-2 rounded cyber-border border-[#00ff9d]/30 text-gray-300"
                />
                <input
                  type="text"
                  placeholder="ホスト名/IP"
                  value={newServer.host}
                  onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                  className="w-full bg-gray-900/80 p-2 rounded cyber-border border-[#00ff9d]/30 text-gray-300"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddServer}
                    className="flex-1 p-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300 text-[#00ff9d]"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingServer(false);
                      setNewServer({ name: '', host: '' });
                    }}
                    className="p-2 cyber-border bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all duration-300 text-gray-400"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {servers.map(server => (
                <div
                  key={server.id}
                  className={`p-3 rounded-lg cyber-border transition-all duration-300 ${
                    selectedServer?.id === server.id
                      ? 'bg-[#00ff9d]/10 border-[#00ff9d]/50'
                      : 'hover:bg-[#00ff9d]/5'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-[#00ff9d] font-medium">{server.name}</h4>
                      <p className="text-gray-400 text-sm">{server.host}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleConnect(server)}
                        className="p-1.5 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
                      >
                        <Power className="w-4 h-4 text-[#00ff9d]" />
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="p-1.5 cyber-border bg-red-900/20 rounded-lg hover:bg-red-900/40 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 h-[calc(100vh-12rem)] relative terminal-container">
            <div ref={terminalRef} className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SSHTerminal;