import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, X } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

function Notepad() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('savedNotes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem('savedNotes', JSON.stringify(notes));
  }, [notes]);

  const handleSave = () => {
    if (currentNote) {
      if (currentNote.id) {
        setNotes(notes.map(note => 
          note.id === currentNote.id ? currentNote : note
        ));
      } else {
        setNotes([...notes, {
          ...currentNote,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }]);
      }
      setIsEditing(false);
      setCurrentNote(null);
    }
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (currentNote?.id === id) {
      setCurrentNote(null);
      setIsEditing(false);
    }
  };

  const createNewNote = () => {
    setCurrentNote({
      id: '',
      title: '',
      content: '',
      createdAt: new Date().toISOString()
    });
    setIsEditing(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 cyber-text text-[#00ff9d]">メモ帳</h2>
        <p className="text-gray-400">システム管理用メモを保存</p>
      </div>

      <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-8">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-[#00ff9d]">保存されたメモ</h3>
          <button
            onClick={createNewNote}
            className="flex items-center space-x-2 px-4 py-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
          >
            <Plus className="w-4 h-4 text-[#00ff9d]" />
            <span className="text-[#00ff9d]">新規作成</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 space-y-4 cyber-border bg-gray-900/80 p-4 rounded-lg h-[calc(100vh-20rem)] overflow-y-auto">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => {
                  setCurrentNote(note);
                  setIsEditing(false);
                }}
                className={`cursor-pointer p-4 rounded-lg transition-all duration-300 ${
                  currentNote?.id === note.id
                    ? 'cyber-border bg-[#00ff9d]/10'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <h4 className="text-[#00ff9d] font-medium mb-2 truncate">{note.title}</h4>
                <p className="text-gray-400 text-sm truncate">{note.content}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {new Date(note.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            ))}
          </div>

          <div className="col-span-2">
            {currentNote && (
              <div className="cyber-border bg-gray-900/80 p-6 rounded-lg h-[calc(100vh-20rem)]">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={currentNote.title}
                      onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                      disabled={!isEditing}
                      placeholder="タイトルを入力"
                      className="w-full bg-transparent text-xl font-semibold text-[#00ff9d] border-b border-[#00ff9d]/30 pb-2 focus:outline-none focus:border-[#00ff9d]"
                    />
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="flex items-center space-x-2 px-4 py-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300"
                        >
                          <Save className="w-4 h-4 text-[#00ff9d]" />
                          <span className="text-[#00ff9d]">保存</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            if (!currentNote.id) {
                              setCurrentNote(null);
                            }
                          }}
                          className="p-2 cyber-border bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all duration-300"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 cyber-border bg-[#00ff9d]/10 rounded-lg hover:bg-[#00ff9d]/20 transition-all duration-300 text-[#00ff9d]"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(currentNote.id)}
                          className="p-2 cyber-border bg-red-900/20 rounded-lg hover:bg-red-900/40 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <textarea
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  disabled={!isEditing}
                  placeholder="メモを入力"
                  className="w-full h-[calc(100%-5rem)] bg-transparent text-gray-300 resize-none focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notepad;