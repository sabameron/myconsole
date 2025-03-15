import React from 'react';
import { Settings } from 'lucide-react';

function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 cyber-text text-[#00ff9d]">設定</h2>
        <p className="text-gray-400">システム設定のカスタマイズ</p>
      </div>

      <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8">
        <div className="flex items-center justify-center">
          <Settings className="w-24 h-24 text-[#00ff9d] opacity-50" />
        </div>
        <p className="text-center text-gray-400 mt-6">
          設定機能は現在準備中です。
          <br />
          今後のアップデートをお待ちください。
        </p>
      </div>
    </div>
  );
}

export default SettingsPage;