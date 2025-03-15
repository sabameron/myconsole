import React, { useState, useEffect } from 'react';
import { Play, Trash2, Edit2, Save, Plus, X } from 'lucide-react';

interface Command {
  id: string;
  name: string;
  command: string;
}

function CommandManager() {
  const [commands, setCommands] = useState<Command[]>(() => {
    const saved = localStorage.getItem('savedCommands');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCommand, setNewCommand] = useState({ name: '', command: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem('savedCommands', JSON.stringify(commands));
  }, [commands]);

  const handleSave = (command: Command) => {
    if (editingId) {
      setCommands(commands.map(c => c.id === editingId ? command : c));
      setEditingId(null);
    } else {
      setCommands([...commands, { ...command, id: Date.now().toString() }]);
      setIsAdding(false);
    }
    setNewCommand({ name: '', command: '' });
  };

  const handleDelete = (id: string) => {
    setCommands(commands.filter(c => c.id !== id));
  };

  const handleExecute = async (command: string) => {
    try {
      // Here you would implement the actual command execution
      console.log('Executing command:', command);
      // For demonstration purposes, we'll just show an alert
      alert(`コマンドを実行: ${command}`);
    } catch (error) {
      console.error('Command execution failed:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 cyber-text text-[#00ff9d]">コマンド管理</h2>
        <p className="text-gray-400">よく使うコマンドを保存して実行</p>
      </div>

      <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-[#00ff9d]">保存されたコマンド</h3>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
          >
            <Plus className="w-4 h-4 text-[#00ff9d]" />
            <span className="text-[#00ff9d]">新規作成</span>
          </button>
        </div>

        {isAdding && (
          <div className="mb-6 cyber-border bg-gray-900/80 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[#00ff9d]">新規コマンド</h4>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewCommand({ name: '', command: '' });
                }}
                className="text-gray-400 hover:text-[#00ff9d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="コマンド名"
                value={newCommand.name}
                onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
                className="w-full bg-gray-900/80 p-2 rounded cyber-border border-[#00ff9d]/30 text-gray-300"
              />
              <input
                type="text"
                placeholder="コマンド"
                value={newCommand.command}
                onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
                className="w-full bg-gray-900/80 p-2 rounded cyber-border border-[#00ff9d]/30 text-gray-300"
              />
              <button
                onClick={() => handleSave(newCommand as Command)}
                className="flex items-center space-x-2 px-4 py-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
              >
                <Save className="w-4 h-4 text-[#00ff9d]" />
                <span className="text-[#00ff9d]">保存</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {commands.map((cmd) => (
            <div key={cmd.id} className="cyber-border bg-gray-900/80 p-4 rounded-lg">
              {editingId === cmd.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newCommand.name}
                    onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
                    className="w-full bg-gray-900/80 p-2 rounded cyber-border border-[#00ff9d]/30 text-gray-300"
                  />
                  <input
                    type="text"
                    value={newCommand.command}
                    onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
                    className="w-full bg-gray-900/80 p-2 rounded cyber-border border-[#00ff9d]/30 text-gray-300"
                  />
                  <button
                    onClick={() => handleSave({ ...newCommand, id: cmd.id })}
                    className="flex items-center space-x-2 px-4 py-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
                  >
                    <Save className="w-4 h-4 text-[#00ff9d]" />
                    <span className="text-[#00ff9d]">保存</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[#00ff9d] font-medium mb-1">{cmd.name}</h4>
                    <code className="text-gray-400 text-sm">{cmd.command}</code>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExecute(cmd.command)}
                      className="p-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
                    >
                      <Play className="w-4 h-4 text-[#00ff9d]" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(cmd.id);
                        setNewCommand({ name: cmd.name, command: cmd.command });
                      }}
                      className="p-2 cyber-border bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all duration-300"
                    >
                      <Edit2 className="w-4 h-4 text-[#00ff9d]" />
                    </button>
                    <button
                      onClick={() => handleDelete(cmd.id)}
                      className="p-2 cyber-border bg-red-900/20 rounded-lg hover:bg-red-900/40 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CommandManager;