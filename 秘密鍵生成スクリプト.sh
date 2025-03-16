#!/bin/bash
# generate-ssh-keys.sh - HOME CONSOLE用SSH鍵生成スクリプト

# カレントディレクトリ取得
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
KEYS_DIR="$DIR/server/keys"

# keysディレクトリ作成
mkdir -p "$KEYS_DIR"

# 既存の鍵がある場合は警告
if [ -f "$KEYS_DIR/id_rsa" ]; then
  echo "警告: 既存の秘密鍵が存在します: $KEYS_DIR/id_rsa"
  read -p "上書きしますか？ (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作をキャンセルしました。"
    exit 1
  fi
fi

# 鍵の生成
echo "HOME CONSOLE用のSSH鍵を生成しています..."
ssh-keygen -t rsa -b 4096 -f "$KEYS_DIR/id_rsa" -N "" -C "home-console@myconsole"

# パーミッション設定
chmod 600 "$KEYS_DIR/id_rsa"
chmod 644 "$KEYS_DIR/id_rsa.pub"

echo 
echo "鍵の生成が完了しました！"
echo "秘密鍵: $KEYS_DIR/id_rsa"
echo "公開鍵: $KEYS_DIR/id_rsa.pub"
echo
echo "公開鍵の内容:"
echo "============="
cat "$KEYS_DIR/id_rsa.pub"
echo "============="
echo
echo "この公開鍵を接続先サーバーの /home/myconsole/.ssh/authorized_keys に追加してください。"
echo "例:"
echo "  ssh user@remote-server 'mkdir -p /home/myconsole/.ssh'"
echo "  cat $KEYS_DIR/id_rsa.pub | ssh user@remote-server 'cat >> /home/myconsole/.ssh/authorized_keys'"
echo "  ssh user@remote-server 'chmod 700 /home/myconsole/.ssh && chmod 600 /home/myconsole/.ssh/authorized_keys'"