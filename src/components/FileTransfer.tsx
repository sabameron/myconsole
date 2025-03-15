import React, { useState } from 'react';
import { Upload, Download, Server, HardDrive } from 'lucide-react';

function FileTransfer() {
  const [host, setHost] = useState('');
  const [path, setPath] = useState('');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 cyber-text text-[#00ff9d]">ファイル転送</h2>
        <p className="text-gray-400">セキュアなファイル転送システム</p>
      </div>

      <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <label className="block">
              <span className="text-[#00ff9d] mb-2 block">ホスト名</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Server className="h-5 w-5 text-[#00ff9d]" />
                </div>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="bg-gray-900/80 block w-full pl-10 pr-3 py-2 rounded-lg cyber-border border-[#00ff9d]/30 focus:border-[#00ff9d] transition-colors outline-none text-gray-300"
                  placeholder="例: ssh.example.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[#00ff9d] mb-2 block">リモートパス</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HardDrive className="h-5 w-5 text-[#00ff9d]" />
                </div>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="bg-gray-900/80 block w-full pl-10 pr-3 py-2 rounded-lg cyber-border border-[#00ff9d]/30 focus:border-[#00ff9d] transition-colors outline-none text-gray-300"
                  placeholder="/home/user/files"
                />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-center space-x-6">
            <button className="flex flex-col items-center p-6 cyber-border bg-gray-900/80 rounded-lg hover:bg-[#00ff9d]/10 transition-all duration-300 group">
              <Upload className="w-12 h-12 mb-3 text-[#00ff9d] group-hover:animate-pulse" />
              <span className="text-[#00ff9d]">アップロード</span>
            </button>
            <button className="flex flex-col items-center p-6 cyber-border bg-gray-900/80 rounded-lg hover:bg-[#00ff9d]/10 transition-all duration-300 group">
              <Download className="w-12 h-12 mb-3 text-[#00ff9d] group-hover:animate-pulse" />
              <span className="text-[#00ff9d]">ダウンロード</span>
            </button>
          </div>
        </div>

        <div className="border-t border-[#00ff9d]/20 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-[#00ff9d]">転送履歴</h3>
          <div className="bg-gray-900/80 cyber-border rounded-lg p-4 h-64 overflow-y-auto">
            <p className="text-gray-400 text-center">転送履歴はありません</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileTransfer;