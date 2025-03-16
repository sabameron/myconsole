// SSHTerminal.tsx - 入力問題修正版
import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Plus, Trash2, Power, Shield, ShieldOff } from 'lucide-react';
import 'xterm/css/xterm.css';

interface Server {
  id: string;
  name: string;
  host: string;
  usePassword?: boolean;
  password?: string;
}

// myconsoleユーザー名（固定）
const DEFAULT_USERNAME = 'myconsole';

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
  const [newServer, setNewServer] = useState({ 
    name: '', 
    host: '',
    usePassword: false,
    password: ''
  });
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [terminalReady, setTerminalReady] = useState(false);

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
      initializeTerminal();
    }
    
    // コンポーネントのアンマウント時にクリーンアップ
    return () => {
      cleanupTerminal();
    };
  }, []);
  
  // ターミナルを初期化する関数
  const initializeTerminal = () => {
    // 少し遅延させてDOMの準備を待つ
    setTimeout(() => {
      try {
        console.log('ターミナル初期化開始');
        
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
          allowTransparency: true,
          convertEol: true, // 改行コードを適切に変換
          disableStdin: false, // 入力を有効化（デフォルトでtrueだが念のため）
          scrollback: 1000, // スクロールバック行数
        });
        
        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        
        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        
        xtermRef.current = term;
        fitAddonRef.current = fitAddon;
        
        if (terminalRef.current) {
          console.log('ターミナルDOMに接続');
          // DOM要素をクリアしてから開く
          terminalRef.current.innerHTML = '';
          term.open(terminalRef.current);
          
          // ターミナルが開かれた後、十分な遅延を入れてからfit実行
          setTimeout(() => {
            if (fitAddonRef.current) {
              try {
                console.log('ターミナルサイズ調整');
                fitAddonRef.current.fit();
                term.focus(); // 初期化直後にフォーカスを当てる
                setTerminalReady(true);
                console.log('ターミナル準備完了');
              } catch (e) {
                console.error('Error fitting terminal:', e);
              }
            }
          }, 500);  // 遅延時間を長めに

          term.writeln('\x1b[32m╔════════════════════════════════════╗\x1b[0m');
          term.writeln('\x1b[32m║      HOME CONSOLE - SSH TERMINAL    ║\x1b[0m');
          term.writeln('\x1b[32m╚════════════════════════════════════╝\x1b[0m');
          term.writeln('');
          term.writeln('\x1b[36m接続待機中...\x1b[0m');
          term.writeln('\x1b[33mサーバーを選択してください\x1b[0m');
          term.writeln('\x1b[32m※ デフォルトでは公開鍵認証を使用します (ユーザー名: myconsole)\x1b[0m');

          // ターミナルコンテナにクリックイベントを追加（フォーカス対策）
          const terminalContainer = terminalRef.current;
          terminalContainer.addEventListener('click', () => {
            if (term) {
              term.focus();
              console.log('ターミナルコンテナクリックでフォーカス');
            }
          });

          const handleResize = () => {
            if (fitAddonRef.current && terminalReady) {
              try {
                fitAddonRef.current.fit();
                term.focus(); // リサイズ後にフォーカスを当て直す
              } catch (e) {
                console.error('Error fitting terminal on resize:', e);
              }
            }
          };

          window.addEventListener('resize', handleResize);
        } else {
          console.error('ターミナルDOM要素がnullです');
        }
      } catch (error) {
        console.error('Terminal initialization error:', error);
      }
    }, 300); // 初期化時の遅延を長くする
  };
  
  // ターミナルとWebSocketのクリーンアップ
  const cleanupTerminal = () => {
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
    
    setConnected(false);
    setConnecting(false);
  };

  const handleAddServer = () => {
    if (newServer.name && newServer.host) {
      // パスワードを使用しない場合は、パスワードフィールドをクリア
      const serverToAdd = { 
        ...newServer,
        password: newServer.usePassword ? newServer.password : '',
        id: Date.now().toString() 
      };
      
      setServers([...servers, serverToAdd]);
      setNewServer({ 
        name: '', 
        host: '',
        usePassword: false,
        password: ''
      });
      setIsAddingServer(false);
    }
  };

  const handleDeleteServer = (id: string) => {
    setServers(servers.filter(server => server.id !== id));
    if (selectedServer?.id === id) {
      setSelectedServer(null);
      
      // 接続中だった場合は切断
      if (connected || connecting) {
        cleanupTerminal();
        if (xtermRef.current) {
          xtermRef.current.writeln('\x1b[31m接続が切断されました\x1b[0m');
          xtermRef.current.writeln('\x1b[33mサーバーを選択してください\x1b[0m');
        }
      }
    }
  };

  const handleConnect = async (server: Server) => {
    setSelectedServer(server);
    setConnecting(true);
    setConnected(false);
    
    console.log('接続開始:', server.name, server.host);
    
    if (xtermRef.current && terminalReady) {
      // 既存の接続を閉じる
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // ターミナルをクリアして接続メッセージを表示
      xtermRef.current.clear();
      xtermRef.current.writeln(`\x1b[36m${server.name} (${server.host}) に接続中...\x1b[0m`);
      xtermRef.current.writeln(`\x1b[36mユーザー名: ${DEFAULT_USERNAME}\x1b[0m`);
      xtermRef.current.writeln(`\x1b[36m認証方式: ${server.usePassword ? 'パスワード' : '公開鍵'}\x1b[0m`);
      
      try {
        // WebSocketのURLを構築
        let wsUrl = `ws://${window.location.host}/ws?host=${server.host}&username=${DEFAULT_USERNAME}`;
        
        // パスワード認証の場合はパスワードを追加
        if (server.usePassword && server.password) {
          wsUrl += `&usePassword=true&password=${encodeURIComponent(server.password)}`;
        }
        
        console.log('WebSocket接続URL:', wsUrl.replace(/password=.*/, 'password=***'));
        
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;
        
        // WebSocketの接続が開いたときの処理
        socket.onopen = () => {
          console.log('WebSocket接続が開きました');
          if (xtermRef.current) {
            xtermRef.current.writeln('\x1b[32mWebSocket接続が確立されました\x1b[0m');
            xtermRef.current.writeln('\x1b[33mサーバーからの応答を待っています...\x1b[0m');

          // 明示的にターミナルにフォーカスを当てる
          setTimeout(() => {
            if (xtermRef.current) {
              xtermRef.current.focus();
              console.log('ターミナルにフォーカスを当てました');
            }
          }, 500);
          }
        };
        
        // WebSocketからメッセージを受信したときの処理
        socket.onmessage = (event) => {
          console.log('データ受信:', event.data.length > 100 ? 
            event.data.substring(0, 50) + '...' + event.data.substring(event.data.length - 50) : 
            event.data);
            
          if (xtermRef.current) {
            // 最初のデータを受信したら接続状態を更新
            if (!connected) {
              setConnected(true);
              setConnecting(false);
              console.log('接続完了！データ受信開始');
            
            // 再度フォーカスを当てる
            setTimeout(() => {
              if (xtermRef.current) {
                xtermRef.current.focus();
                console.log('接続完了後、ターミナルにフォーカスを当てました');
              }
            }, 300);
          }
            
            xtermRef.current.write(event.data);
          } else {
            console.error('ターミナルがnullです:', event.data);
          }
        };
        
        // エラー発生時の処理
        socket.onerror = (error) => {
          console.error('WebSocket Error:', error);
          setConnecting(false);
          if (xtermRef.current) {
            xtermRef.current.writeln('\x1b[31mエラー: 接続に失敗しました\x1b[0m');
          }
        };
        
        // 接続が閉じられたときの処理
        socket.onclose = () => {
          console.log('WebSocket接続が閉じられました');
          setConnecting(false);
          setConnected(false);
          if (xtermRef.current) {
            xtermRef.current.writeln('\x1b[31m接続が閉じられました\x1b[0m');
          }
        };
        
        // ユーザー入力をWebSocketに送信
        if (xtermRef.current) {
          // 既存のすべてのリスナーを削除
          xtermRef.current.onData(() => {});
        
          // 新しいリスナーを設定
          xtermRef.current.onData((data) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              console.log('入力送信:', data.split('').map(c => c.charCodeAt(0)));
              socket.send(data);
            } else {
              console.warn('WebSocketが開いていません。データ送信スキップ:', data);
            }
          });
          
          console.log('ターミナル入力リスナー設定');
          
          // フォーカスを当てる
          xtermRef.current.focus();
        }
      } catch (error) {
        console.error('Connection error:', error);
        setConnecting(false);
        if (xtermRef.current) {
          xtermRef.current.writeln('\x1b[31mエラー: サーバーに接続できません\x1b[0m');
        }
      }
    } else {
      console.error('Terminal not ready yet');
      setConnecting(false);
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
                
                {/* 認証方式の切り替え */}
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="usePassword"
                    checked={newServer.usePassword}
                    onChange={(e) => setNewServer({ ...newServer, usePassword: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="usePassword" className="text-gray-300">
                    パスワード認証を使用
                  </label>
                </div>
                
                {/* パスワード認証が選択されている場合のみパスワード入力欄を表示 */}
                {newServer.usePassword && (
                  <input
                    type="password"
                    placeholder="パスワード"
                    value={newServer.password}
                    onChange={(e) => setNewServer({ ...newServer, password: e.target.value })}
                    className="w-full bg-gray-900/80 p-2 rounded cyber-border border-[#00ff9d]/30 text-gray-300"
                  />
                )}
                
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
                      setNewServer({ 
                        name: '', 
                        host: '',
                        usePassword: false,
                        password: ''
                      });
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
                      {/* 認証方式のアイコン表示 */}
                      <div className="flex items-center mt-1">
                        {server.usePassword ? (
                          <div className="flex items-center text-yellow-500">
                            <ShieldOff className="w-3 h-3 mr-1" />
                            <span className="text-xs">パスワード</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-500">
                            <Shield className="w-3 h-3 mr-1" />
                            <span className="text-xs">公開鍵</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 接続状態表示 */}
                      {selectedServer?.id === server.id && (
                        <div className="mt-1">
                          {connecting && (
                            <div className="text-yellow-500 text-xs flex items-center">
                              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span>
                              接続中...
                            </div>
                          )}
                          {connected && (
                            <div className="text-green-500 text-xs flex items-center">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              接続済み
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleConnect(server)}
                        className="p-1.5 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
                        disabled={!terminalReady || connecting}
                      >
                        <Power className={`w-4 h-4 ${connected && selectedServer?.id === server.id ? 'text-green-500' : 'text-[#00ff9d]'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="p-1.5 cyber-border bg-red-900/20 rounded-lg hover:bg-red-900/40 transition-all duration-300"
                        disabled={connecting && selectedServer?.id === server.id}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {servers.length === 0 && (
                <div className="text-center p-4 text-gray-400">
                  <p>サーバーが登録されていません</p>
                  <p className="text-sm mt-2">「+」ボタンをクリックして追加してください</p>
                </div>
              )}
            </div>
          </div>
          
          {/* 接続情報表示パネル */}
          {selectedServer && (connected || connecting) && (
            <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-[#00ff9d] font-semibold mb-2">接続情報</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-400">ホスト:</span> <span className="text-[#00ff9d]">{selectedServer.host}</span></p>
                <p><span className="text-gray-400">ユーザー:</span> <span className="text-[#00ff9d]">{DEFAULT_USERNAME}</span></p>
                <p>
                  <span className="text-gray-400">認証:</span> 
                  <span className={selectedServer.usePassword ? 'text-yellow-500' : 'text-green-500'}>
                    {selectedServer.usePassword ? ' パスワード' : ' 公開鍵'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">状態:</span> 
                  <span className={connecting ? 'text-yellow-500' : 'text-green-500'}>
                    {connecting ? ' 接続中...' : ' 接続済み'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-3">
          <div 
            className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 h-[calc(100vh-12rem)] relative terminal-container"
            onClick={() => {
              if (xtermRef.current) {
                xtermRef.current.focus();
                console.log('ターミナルコンテナクリックでフォーカス');
              }
            }}
          >
            <div 
              ref={terminalRef}
              className="h-full w-full focus-within:outline-none"
              tabIndex={0} // タブナビゲーション可能に
            />
            
            {/* 未接続時の説明オーバーレイ */}
            {!connected && !connecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 pointer-events-none">
                <div className="text-center p-6">
                  <div className="text-[#00ff9d] text-xl mb-4">接続準備完了</div>
                  <p className="text-gray-300 mb-2">左側のパネルからサーバーを選択してください</p>
                  <p className="text-gray-400 text-sm">
                    Power ボタン <Power className="w-4 h-4 text-[#00ff9d] inline-block" /> をクリックすると接続が開始されます
                  </p>
                </div>
              </div>
            )}
            
            {/* 接続中インジケーター */}
            {connecting && !connected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 pointer-events-none">
                <div className="text-center p-6">
                  <div className="text-yellow-500 text-xl mb-4 flex items-center justify-center">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                    接続中...
                  </div>
                  <p className="text-gray-300">サーバーへ接続しています</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SSHTerminal;