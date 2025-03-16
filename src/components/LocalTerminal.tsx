import React, { useRef } from 'react';
import Terminal from 'react-console-emulator';

function LocalTerminal() {
  const terminalRef = useRef<any>(null);

  const commands = {
    echo: {
      description: 'Echo a passed string.',
      usage: 'echo <string>',
      fn: (...args: string[]) => args.join(' ')
    },
    ls: {
      description: 'List directory contents',
      usage: 'ls [directory]',
      fn: (dir: string) => {
        const dirs = {
          '': ['Documents', 'Downloads', 'Pictures', 'projects', '.bashrc', '.vimrc'],
          '/': ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'media', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var'],
          'Documents': ['report.txt', 'notes.md', 'project-ideas.txt'],
          'Downloads': ['image.jpg', 'archive.zip', 'ubuntu-22.04.iso'],
          'projects': ['home-console', 'blog', 'api-server']
        };
        
        return (dirs as any)[dir || '']?.join('  ') || `ls: cannot access '${dir}': No such file or directory`;
      }
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
    cat: {
      description: 'Show file contents',
      usage: 'cat <file>',
      fn: (file: string) => {
        const files: Record<string, string> = {
          '.bashrc': '# .bashrc configuration\nalias ll="ls -la"\nalias python=python3\nexport PATH=$PATH:~/bin',
          '.vimrc': 'syntax on\nset number\nset expandtab\nset tabstop=2\nset shiftwidth=2\nset autoindent',
          'report.txt': 'This is a sample report file.\nIt contains multiple lines of text.\nThis is just for demonstration.',
          'notes.md': '# Project Notes\n\n## Ideas\n- Create home console\n- Improve terminal interface\n- Add SSH functionality',
        };
        
        return files[file] || `cat: ${file}: No such file or directory`;
      }
    },
    vim: {
      description: 'Open file in Vim editor',
      usage: 'vim <filename>',
      fn: (filename: string) => `vimエディタで${filename || '新規ファイル'}を編集中...\n(これはシミュレーションです)`
    },
    mkdir: {
      description: 'Create directory',
      usage: 'mkdir <directory>',
      fn: (dir: string) => dir ? `ディレクトリ '${dir}' を作成しました` : 'ディレクトリ名を指定してください'
    },
    rm: {
      description: 'Remove files or directories',
      usage: 'rm [options] <file>',
      fn: (options: string, file: string) => file ? `'${file}' を削除しました` : 'ファイル名を指定してください'
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
    },
    uname: {
      description: 'Print system information',
      usage: 'uname [options]',
      fn: (options: string) => options === '-a' 
        ? 'Linux myconsole 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:32:51 UTC 2023 x86_64 GNU/Linux' 
        : 'Linux'
    }
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 cyber-text text-[#00ff9d]">ローカルターミナル</h2>
        <p className="text-gray-400">マイコンソールサーバーのターミナル</p>
      </div>
      
      <div className="cyber-border bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 h-[calc(100vh-12rem)] relative terminal-container">
        <Terminal
          ref={terminalRef}
          commands={commands}
          welcomeMessage={`
╔════════════════════════════════════╗
║    HOME CONSOLE - LOCAL TERMINAL   ║
╚════════════════════════════════════╝

ローカルターミナルに接続しました
「help」と入力してコマンド一覧を表示できます`}
          promptLabel="nishio@myconsole:~$ "
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
  );
}

export default LocalTerminal;