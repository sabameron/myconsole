import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Terminal, FileUp, Home, Power, Activity, Command, Notebook, Settings, LogOut, MonitorDot } from 'lucide-react';
import SSHTerminal from './components/SSHTerminal';
import FileTransfer from './components/FileTransfer';
import CommandManager from './components/CommandManager';
import Notepad from './components/Notepad';
import LocalTerminal from './components/LocalTerminal';
import SettingsPage from './components/SettingsPage';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen cyber-gradient text-gray-300 flex">
        {/* Sidebar */}
        <div className="w-72 bg-gray-900/50 backdrop-blur-sm p-6 border-r border-[#00ff9d]/20">
          <div className="mb-12">
            <div className="flex items-center justify-center mb-4">
              <Power className="w-8 h-8 text-[#00ff9d] mr-3" />
              <h1 className="text-2xl font-bold cyber-text text-[#00ff9d]">HOME CONSOLE</h1>
            </div>
            <div className="flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#00ff9d] mr-2" />
              <p className="text-sm text-[#00ff9d]/70">SYSTEM ONLINE</p>
            </div>
          </div>
          
          <nav className="space-y-3">
            <NavLink to="/" icon={<Home className="w-5 h-5" />} text="ホーム" />
            <NavLink to="/terminal" icon={<Terminal className="w-5 h-5" />} text="SSH ターミナル" />
            <NavLink to="/local-terminal" icon={<MonitorDot className="w-5 h-5" />} text="ローカルターミナル" />
            <NavLink to="/file-transfer" icon={<FileUp className="w-5 h-5" />} text="ファイル転送" />
            <NavLink to="/commands" icon={<Command className="w-5 h-5" />} text="コマンド管理" />
            <NavLink to="/notepad" icon={<Notebook className="w-5 h-5" />} text="メモ帳" />
            <NavLink to="/settings" icon={<Settings className="w-5 h-5" />} text="設定" />
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center space-x-3 p-4 rounded-lg cyber-border transition-all duration-300 w-full hover:bg-red-900/20 hover:text-red-400 hover:border-red-400/30"
            >
              <LogOut className="w-5 h-5" />
              <span>ログアウト</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/terminal" element={<SSHTerminal />} />
            <Route path="/local-terminal" element={<LocalTerminal />} />
            <Route path="/file-transfer" element={<FileTransfer />} />
            <Route path="/commands" element={<CommandManager />} />
            <Route path="/notepad" element={<Notepad />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 p-4 rounded-lg cyber-border transition-all duration-300 ${
        isActive 
          ? 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/50' 
          : 'hover:bg-[#00ff9d]/5 hover:text-[#00ff9d] hover:border-[#00ff9d]/30'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-8 text-center cyber-text text-[#00ff9d]">システムコントロール</h2>
      <p className="text-gray-400 text-center mb-12 text-lg">
        セキュアな接続でシステムを管理します。
        必要な操作を選択してください。
      </p>
      
      <div className="grid grid-cols-2 gap-8">
        <Link
          to="/terminal"
          className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-[#00ff9d]/5 transition-all duration-300 group"
        >
          <Terminal className="w-16 h-16 mx-auto mb-6 text-[#00ff9d] group-hover:animate-pulse" />
          <h3 className="text-2xl font-semibold mb-4 text-center text-[#00ff9d]">SSHターミナル</h3>
          <p className="text-gray-400 text-center">
            リモートサーバーへのセキュアな接続と
            コマンドラインインターフェース
          </p>
        </Link>

        <Link
          to="/local-terminal"
          className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-[#00ff9d]/5 transition-all duration-300 group"
        >
          <MonitorDot className="w-16 h-16 mx-auto mb-6 text-[#00ff9d] group-hover:animate-pulse" />
          <h3 className="text-2xl font-semibold mb-4 text-center text-[#00ff9d]">ローカルターミナル</h3>
          <p className="text-gray-400 text-center">
            マイコンソールサーバーの
            ターミナルアクセス
          </p>
        </Link>
        
        <Link
          to="/file-transfer"
          className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-[#00ff9d]/5 transition-all duration-300 group"
        >
          <FileUp className="w-16 h-16 mx-auto mb-6 text-[#00ff9d] group-hover:animate-pulse" />
          <h3 className="text-2xl font-semibold mb-4 text-center text-[#00ff9d]">ファイル転送</h3>
          <p className="text-gray-400 text-center">
            SSHプロトコルを使用した
            安全なファイル転送システム
          </p>
        </Link>

        <Link
          to="/commands"
          className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-[#00ff9d]/5 transition-all duration-300 group"
        >
          <Command className="w-16 h-16 mx-auto mb-6 text-[#00ff9d] group-hover:animate-pulse" />
          <h3 className="text-2xl font-semibold mb-4 text-center text-[#00ff9d]">コマンド管理</h3>
          <p className="text-gray-400 text-center">
            よく使うコマンドを保存して
            簡単に実行
          </p>
        </Link>

        <Link
          to="/notepad"
          className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-[#00ff9d]/5 transition-all duration-300 group"
        >
          <Notebook className="w-16 h-16 mx-auto mb-6 text-[#00ff9d] group-hover:animate-pulse" />
          <h3 className="text-2xl font-semibold mb-4 text-center text-[#00ff9d]">メモ帳</h3>
          <p className="text-gray-400 text-center">
            システム管理に必要な
            メモを保存
          </p>
        </Link>

        <Link
          to="/settings"
          className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 hover:bg-[#00ff9d]/5 transition-all duration-300 group"
        >
          <Settings className="w-16 h-16 mx-auto mb-6 text-[#00ff9d] group-hover:animate-pulse" />
          <h3 className="text-2xl font-semibold mb-4 text-center text-[#00ff9d]">設定</h3>
          <p className="text-gray-400 text-center">
            システム設定の
            カスタマイズ
          </p>
        </Link>
      </div>
    </div>
  );
}

export default App;