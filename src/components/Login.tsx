import React, { useState } from 'react';
import { Power } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic authentication check - in a real app, this would be more secure
    if (username === 'admin' && password === 'password') {
      onLogin();
    } else {
      setError('ユーザー名またはパスワードが正しくありません');
    }
  };

  return (
    <div className="min-h-screen cyber-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Power className="w-12 h-12 text-[#00ff9d] mr-4" />
              <h1 className="text-3xl font-bold cyber-text text-[#00ff9d]">HOME CONSOLE</h1>
            </div>
            <p className="text-gray-400">システムにログインしてください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="cyber-border bg-red-900/20 text-red-400 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#00ff9d] mb-2" htmlFor="username">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/80 p-3 rounded-lg cyber-border border-[#00ff9d]/30 text-gray-300 focus:border-[#00ff9d] transition-colors outline-none"
                placeholder="ユーザー名を入力"
              />
            </div>

            <div>
              <label className="block text-[#00ff9d] mb-2" htmlFor="password">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/80 p-3 rounded-lg cyber-border border-[#00ff9d]/30 text-gray-300 focus:border-[#00ff9d] transition-colors outline-none"
                placeholder="パスワードを入力"
              />
            </div>

            <button
              type="submit"
              className="w-full cyber-border bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20 text-[#00ff9d] p-3 rounded-lg transition-all duration-300"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;