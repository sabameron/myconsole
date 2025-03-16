# v02.01
import os
import codecs

# 収集するファイルの拡張子リスト
# TARGET_EXTENSIONS = ['.py', '.html', '.css', '.js']
# TARGET_EXTENSIONS = ['.py', '.js','.html']
# TARGET_EXTENSIONS = ['.py', '.js']
# TARGET_EXTENSIONS = ['.py', '.html']
# TARGET_EXTENSIONS = ['.php', '.html']
# TARGET_EXTENSIONS = ['.js']
# TARGET_EXTENSIONS = ['.py']
# TARGET_EXTENSIONS = [".js",".css",".json",".tsx",".html",".ts"]
TARGET_EXTENSIONS = [".js",".tsx",".html",".ts"]

# 除外するディレクトリのリスト
EXCLUDE_DIRS = ['.git','logs','old','venv','__pycache__', 'venv', 'migrations', 'static','assets','node_modules']
# EXCLUDE_DIRS = ['.git','logs','old','venv','__pycache__', 'venv', 'migrations'] #staticフォルダを除外しない

# ファイル階層を表示するファイルの拡張子リスト
TARGET_EXTENSIONS2 = ['.py', '.html', '.css', '.js']

# ファイル階層を表示する際に除外するディレクトリのリスト
EXCLUDE_DIRS2 = ['.git','logs','old','venv','__pycache__', 'venv', 'migrations', 'static', 'node_modules']

print(f"{TARGET_EXTENSIONS}のファイルを収集します。（{EXCLUDE_DIRS}を除く）")
def collect_files(root_dir):
    collected_files = []
    for root, dirs, files in os.walk(root_dir):
        # 除外するディレクトリを dirs から削除して走査対象から外す
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in TARGET_EXTENSIONS):
                collected_files.append(os.path.join(root, file))
    return collected_files

def read_file_content(file_path):
    with codecs.open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def write_output(collected_files, output_file):
    with codecs.open(output_file, 'w', encoding='utf-8') as out_file:
        for file_path in collected_files:
            out_file.write(f"<ファイルパス>{file_path}</ファイルパス>\n")
            out_file.write("<ファイル中身>\n")
            out_file.write(read_file_content(file_path))
            out_file.write("\n</ファイル中身>\n\n")

def display_directory_tree(directory, prefix="", output_file=None):
    """ディレクトリ構造をツリー形式で表示/ファイル出力する"""
    # ディレクトリ内のファイルとフォルダを取得
    entries = os.listdir(directory)
    entries = sorted([e for e in entries if e not in EXCLUDE_DIRS2])
    
    for i, entry in enumerate(entries):
        path = os.path.join(directory, entry)
        is_last = i == len(entries) - 1
        
        # 現在の項目のプレフィックスを作成
        current_prefix = "└── " if is_last else "├── "
        # 次の階層のプレフィックスを作成
        next_prefix = "    " if is_last else "│   "
        
        # ファイル/ディレクトリ行を作成
        line = f"{prefix}{current_prefix}{entry}"
        
        # 出力先に応じて処理
        if output_file:
            output_file.write(line + "\n")
        else:
            print(line)
        
        # ディレクトリの場合は再帰的に処理
        if os.path.isdir(path):
            display_directory_tree(path, prefix + next_prefix, output_file)

def main():
    root_directory = os.getcwd()  # 現在のディレクトリを使用
    output_file = "./現在の開発状況.txt"
    
    # ファイル収集と内容出力
    collected_files = collect_files(root_directory)
    with codecs.open(output_file, 'w', encoding='utf-8') as out_file:
        # まずディレクトリ構造を出力
        out_file.write("<ディレクトリ構造>\n")
        display_directory_tree(root_directory, output_file=out_file)
        out_file.write("</ディレクトリ構造>\n\n")
        
        # 次にファイル内容を出力
        for file_path in collected_files:
            out_file.write(f"<ファイルパス>{file_path}</ファイルパス>\n")
            out_file.write("<ファイル中身>\n")
            out_file.write(read_file_content(file_path))
            out_file.write("\n</ファイル中身>\n\n")
    
    print(f"{len(collected_files)}個のファイルが{output_file}にまとめられました。")

if __name__ == "__main__":
    main()

