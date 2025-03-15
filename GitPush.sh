#!/bin/bash
# バージョン：v003.00

# 日付と時刻を取得
current_date=$(date +%Y-%m-%d)
current_time=$(date +%H-%M-%S)
commit_message="AutomaticPush_${current_date}_${current_time}"

# .servertype ファイルの内容をチェック
server_type=$(cat .servertype 2>/dev/null)

# サーバータイプが 'dev' でなければスクリプトを終了
if [ "$server_type" != "dev" ]; then
    echo "検証用サーバーではありません、実行を中止します。"
    exit 1
fi

# 現在のブランチ名を取得
current_branch=$(git rev-parse --abbrev-ref HEAD)

# masterブランチでない場合の確認
if [ "$current_branch" != "master" ]; then
    echo "警告: masterブランチではありません。現在のブランチ: $current_branch"
    echo "masterへの切り替え：git checkout master"
    echo "masterへの反映：git merge master $current_branch"
    read -p "続行しますか？ (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "操作を中止しました。"
        exit 1
    fi
fi

# Gitの状態を確認し、変更をステージング
git status
git add .

# コマンドラインオプションを処理
while getopts ":m" opt; do
    case $opt in
        m)
            # コミットメッセージをユーザーから取得
            read -p "Enter commit message: " user_message
            commit_message="$user_message"
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            ;;
    esac
done

# コミットとプッシュ
git commit -m "$commit_message"
sleep 2
git push origin "$current_branch"  # masterの代わりに現在のブランチ名を使用
