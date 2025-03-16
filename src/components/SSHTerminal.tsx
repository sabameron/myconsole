import React, { useState } from 'react';
import Terminal from 'react-console-emulator';
import { Plus, Trash2, Power } from 'lucide-react';

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
  const terminalRef = React.useRef<any>(null);

  React.useEffect(() => {
    try {
      localStorage.setItem('sshServers', JSON.stringify(servers));
    } catch (e) {
      console.error('Error saving servers to localStorage:', e);
    }
  }, [servers]);

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

  const handleConnect = (server: Server) => {
    setSelectedServer(server);
    if (terminalRef.current) {
      terminalRef.current.clearStdout();
      terminalRef.current.pushToStdout(`\x1b[36m${server.name} (${server.host}) に接続中...\x1b[0m`);
    }
  };

  const commands = {
    echo: {
      description: 'Echo a passed string.',
      usage: 'echo <string>',
      fn: (...args: string[]) => args.join(' ')
    },
    ssh: {
      description: 'Connect to SSH host',
      usage: 'ssh <user@host>',
      fn: (...args: string[]) => {
        if (args.length === 0) return 'Usage: ssh username@hostname';
        return `Connecting to ${args.join(' ')}...`;
      }
    },
    ls: {
      description: 'List directory contents',
      usage: 'ls [directory]',
      fn: () => 'file1 file2 file3'
    },
    cd: {
      description: 'Change directory',
      usage: 'cd <directory>',
      fn: (dir: string) => `Changed directory to ${dir || '/'}`
    },
    pwd: {
      description: 'Print working directory',
      usage: 'pwd',
      fn: () => '/home/nishio'
    },
    vim: {
      description: 'Open file in Vim editor',
      usage: 'vim <filename>',
      fn: (filename: string) => `Opening ${filename || 'new file'} in vim...`
    },
    whoami: {
      description: 'Display current user',
      usage: 'whoami',
      fn: () => 'nishio'
    },
    date: {
      description: 'Show current date and time',
      usage: 'date',
      fn: () => new Date().toLocaleString()
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
            <Terminal
              ref={terminalRef}
              commands={commands}
              welcomeMessage={selectedServer 
                ? `${selectedServer.name} (${selectedServer.host}) に接続中...` 
                : "サーバーを選択して接続してください。接続後は「help」と入力してコマンド一覧を表示できます。"}
              promptLabel={selectedServer 
                ? `nishio@${selectedServer.host}:~$ ` 
                : "$ "}
              styleEchoBack="fullInherit"
              contentStyle={{ color: '#00ff9d' }}
              promptLabelStyle={{ color: '#00ff9d' }}
              inputTextStyle={{ color: '#00ff9d' }}
              messageStyle={{ color: '#00ff9d' }}
              scrollBehavior="auto"
              noDefaults
              autoFocus
              style={{
                maxHeight: "100%",
                minHeight: "100%",
                overflow: "auto",
                backgroundColor: 'rgba(10, 11, 20, 0.8)',
                fontFamily: 'monospace',
                fontSize: '14px',
                padding: '10px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SSHTerminal;