// server.js (デバッグ強化版)
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// デバッグログのセットアップ
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, `ssh-server-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// ログ関数
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${type}] ${message}`;
  
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

// エラーログ
function logError(message, error) {
  log(`${message}: ${error.message}`, 'ERROR');
  if (error.stack) {
    log(`Stack: ${error.stack}`, 'ERROR');
  }
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 接続中のクライアントを追跡
const activeConnections = new Map();

// 定期的な状態レポート
setInterval(() => {
  const activeCount = activeConnections.size;
  if (activeCount > 0) {
    log(`アクティブな接続: ${activeCount}`);
    activeConnections.forEach((info, id) => {
      log(`- ID: ${id}, ホスト: ${info.host}, ユーザー: ${info.username}, 確立: ${info.established}, 接続時間: ${Math.floor((Date.now() - info.connectedAt) / 1000)}秒`);
    });
  }
}, 60000); // 1分ごとにレポート

// HTTPリクエストのロギング
app.use((req, res, next) => {
  log(`HTTP ${req.method} ${req.url}`);
  next();
});

// 簡単なステータスページ
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>SSH WebSocket サーバー</title></head>
      <body>
        <h1>SSH WebSocket サーバー</h1>
        <p>サーバーは稼働中です。現在のアクティブ接続: ${activeConnections.size}</p>
      </body>
    </html>
  `);
});

// 接続統計API
app.get('/api/stats', (req, res) => {
  const stats = {
    activeConnections: activeConnections.size,
    connections: Array.from(activeConnections.entries()).map(([id, info]) => ({
      id,
      host: info.host,
      username: info.username,
      established: info.established,
      connectedAt: info.connectedAt,
      connectionDuration: Math.floor((Date.now() - info.connectedAt) / 1000)
    }))
  };
  res.json(stats);
});

wss.on('connection', (ws, req) => {
  const connectionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  log(`新しいWebSocket接続: ${connectionId} from ${clientIp}`);

  try {
    const url = new URL(`http://localhost${req.url}`);
    const host = url.searchParams.get('host');
    const username = url.searchParams.get('username');
    
    log(`接続パラメータ - ホスト: ${host}, ユーザー: ${username}`);
    
    if (!host || !username) {
      log(`パラメータ不足 - ホスト: ${host}, ユーザー: ${username}`, 'WARN');
      ws.send('\x1b[31mエラー: ホスト名またはユーザー名が指定されていません\x1b[0m\r\n');
      ws.close();
      return;
    }
    
    // 接続情報を追跡
    activeConnections.set(connectionId, {
      host,
      username,
      established: false,
      connectedAt: Date.now(),
      clientIp
    });
    
    // 接続のタイムアウト処理
    const connectionTimeout = setTimeout(() => {
      if (activeConnections.has(connectionId) && !activeConnections.get(connectionId).established) {
        log(`接続タイムアウト: ${connectionId} to ${host}`, 'WARN');
        ws.send('\x1b[31mエラー: 接続がタイムアウトしました\x1b[0m\r\n');
        ws.close();
        activeConnections.delete(connectionId);
      }
    }, 30000); // 30秒タイムアウト
    
    const ssh = new Client();
    
    ssh.on('ready', () => {
      clearTimeout(connectionTimeout);
      log(`SSH接続確立: ${connectionId} to ${host}`);
      
      activeConnections.set(connectionId, {
        ...activeConnections.get(connectionId),
        established: true
      });
      
      ws.send('\x1b[32mSSH接続が確立されました\x1b[0m\r\n');
      
      ssh.shell((err, stream) => {
        if (err) {
          logError(`シェル開始エラー: ${connectionId}`, err);
          ws.send(`\x1b[31mシェルの開始に失敗しました: ${err.message}\x1b[0m\r\n`);
          ws.close();
          return;
        }
        
        log(`シェルセッション開始: ${connectionId}`);
        
        // SSHストリームからのデータをWebSocketに送信
        stream.on('data', (data) => {
          const dataStr = data.toString('utf-8');
          // 長いデータの場合は省略表示
          const logData = dataStr.length > 100 ? 
            dataStr.substr(0, 50) + '...' + dataStr.substr(-50) : 
            dataStr;
            
          log(`SSH -> WS (${connectionId}): ${logData.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}`);
          
          try {
            ws.send(dataStr);
          } catch (err) {
            logError(`データ送信エラー: ${connectionId}`, err);
          }
        });
        
        // SSHストリームのエラーをWebSocketに送信
        stream.on('error', (err) => {
          logError(`SSHストリームエラー: ${connectionId}`, err);
          try {
            ws.send(`\x1b[31mエラー: ${err.message}\x1b[0m\r\n`);
          } catch (sendErr) {
            logError(`ストリームエラー通知失敗: ${connectionId}`, sendErr);
          }
        });
        
        // SSHストリームが閉じられたときの処理
        stream.on('close', () => {
          log(`SSHストリームクローズ: ${connectionId}`);
          try {
            ws.send('\x1b[31mSSHセッションが終了しました\x1b[0m\r\n');
            ws.close();
          } catch (err) {
            logError(`ストリームクローズ通知失敗: ${connectionId}`, err);
          }
          activeConnections.delete(connectionId);
        });
        
        // 端末サイズの調整イベントを処理
        stream.on('resize', (width, height) => {
          log(`ターミナルリサイズ: ${connectionId} to ${width}x${height}`);
        });
        
        // WebSocketからのデータをSSHストリームに送信
        ws.on('message', (message) => {
          try {
            const msgStr = message.toString();
            // 制御文字を見やすく表示
            const logMsg = msgStr.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
            log(`WS -> SSH (${connectionId}): ${logMsg}`);
            
            stream.write(message);
          } catch (err) {
            logError(`メッセージ送信エラー: ${connectionId}`, err);
          }
        });
        
        // WebSocketが閉じられたときにSSH接続も閉じる
        ws.on('close', () => {
          log(`WebSocket接続クローズ: ${connectionId}`);
          try {
            stream.close();
            ssh.end();
          } catch (err) {
            logError(`SSH切断エラー: ${connectionId}`, err);
          }
          activeConnections.delete(connectionId);
          clearTimeout(connectionTimeout);
        });
      });
    });
    
    ssh.on('error', (err) => {
      logError(`SSH接続エラー: ${connectionId} to ${host}`, err);
      clearTimeout(connectionTimeout);
      
      // クライアントへのエラー通知
      try {
        ws.send(`\x1b[31mSSH接続エラー: ${err.message}\x1b[0m\r\n`);
        ws.close();
      } catch (sendErr) {
        logError(`エラー通知失敗: ${connectionId}`, sendErr);
      }
      
      activeConnections.delete(connectionId);
    });
    
    // デバッグ用にイベントを追加
    ssh.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
      log(`キーボード対話認証: ${connectionId}`, 'DEBUG');
      // このエラーは通常はパスワード認証を要求している
      ws.send('\x1b[33m警告: サーバーがパスワード認証を要求しています\x1b[0m\r\n');
      finish(['']); // 空のパスワードで応答（失敗するはず）
    });
    
    ssh.on('banner', (message) => {
      log(`SSHバナー受信: ${connectionId}`, 'DEBUG');
      ws.send(`\x1b[36m${message}\x1b[0m`);
    });
    
    log(`SSH接続開始: ${connectionId} to ${host}:22 as ${username}`);
    
    // SSH接続の設定
    const connectConfig = {
      host: host,
      port: 22,
      username: username,
      // デバッグモードを有効化
      debug: (message) => log(`SSH Debug: ${message}`, 'DEBUG'),
      // キーボードインタラクティブ認証を許可
      tryKeyboard: true,
      // デバッグするために認証方法を無効化 (実際の接続ではコメントアウト)
      // password: 'デモパスワード',
      // 認証失敗を許容する最大試行回数
      authHandler: function(methodsLeft, partialSuccess, callback) {
        log(`認証メソッド残り: ${methodsLeft.join(', ')}`, 'DEBUG');
        callback(); // 次の認証方法を試す
      }
    };
    
    // ホストキーの確認をバイパス (開発環境のみ)
    connectConfig.hostVerifier = function() { return true; };
    
    ssh.connect(connectConfig);
    
  } catch (err) {
    logError(`WebSocket処理エラー`, err);
    try {
      ws.send(`\x1b[31mサーバーエラー: ${err.message}\x1b[0m\r\n`);
      ws.close();
    } catch (sendErr) {
      logError(`エラー通知失敗`, sendErr);
    }
    activeConnections.delete(connectionId);
  }
});

// プロセスの監視と終了処理
process.on('uncaughtException', (err) => {
  logError('未捕捉の例外', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('未処理のPromise拒否', { message: String(reason) });
});

process.on('SIGINT', () => {
  log('SIGINTを受信しました。サーバーをシャットダウンします...', 'WARN');
  
  // アクティブな接続をクリーンアップ
  activeConnections.forEach((info, id) => {
    log(`接続をクローズ: ${id}`);
  });
  
  // サーバーを正常にシャットダウン
  server.close(() => {
    log('HTTPサーバーがシャットダウンしました', 'WARN');
    logStream.end();
    process.exit(0);
  });
  
  // 5秒後に強制終了
  setTimeout(() => {
    log('強制シャットダウン', 'ERROR');
    process.exit(1);
  }, 5000);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  log(`WebSocketサーバーがポート${PORT}で起動しました`);
  log(`ログファイル: ${logFile}`);
});