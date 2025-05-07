#!/bin/bash

# このスクリプトは、MDXファイルから挿絵計画を生成します

# 使用方法を表示する関数
show_usage() {
  echo "Usage: $0 <mdx-file-path>"
  echo ""
  echo "Example:"
  echo "  $0 src/books/42308_17916.mdx"
  echo "  $0 src/books/59835_72466.mdx"
  exit 1
}

# 引数チェック
if [ $# -lt 1 ]; then
  show_usage
fi

MDX_FILE=$1

# ファイルの存在確認
if [ ! -f "$MDX_FILE" ]; then
  echo "Error: ファイル '$MDX_FILE' が見つかりません"
  exit 1
fi

# .mdx拡張子の確認
if [[ "$MDX_FILE" != *.mdx ]]; then
  echo "Error: MDXファイルを指定してください"
  exit 1
fi

# 出力ファイルパスの生成
DIR_NAME=$(dirname "$MDX_FILE")
BASE_NAME=$(basename "$MDX_FILE" .mdx)
OUTPUT_FILE="${DIR_NAME}/${BASE_NAME}-illustration-plan.md"

echo "挿絵計画を生成しています: $MDX_FILE"
echo "Claudeを使用して詳細な挿絵計画を生成します..."

# MDXファイルの内容を取得
MDX_CONTENT=$(cat "$MDX_FILE")

# Claudeプロンプトテンプレートを読み込み
PROMPT_TEMPLATE=$(cat "src/tools/illustration-automation/prompt-templates.md" | grep -A 100 "## 個別ファイル用プロンプト" | tail -n +3)

# プロンプトの準備
PROMPT=$(echo "$PROMPT_TEMPLATE" | sed "s/FILE_NAME/$BASE_NAME/g")
# MDXの内容のエスケープ処理とプレースホルダ置換
# 一時ファイルを作成
TEMP_FILE=$(mktemp)
# MDXの内容をファイルに書き込み、特殊文字をエスケープ
cat "$MDX_FILE" | sed 's/[\/&]/\\&/g' > "$TEMP_FILE"
# 置換実行
PROMPT=$(echo "$PROMPT" | sed -e '/MDX_CONTENT/r '"$TEMP_FILE" -e 's/MDX_CONTENT//')
# 一時ファイルを削除
rm "$TEMP_FILE"

# Claudeコマンドを実行
echo "$PROMPT" | claude > "$OUTPUT_FILE"

# 結果の確認
if [ -f "$OUTPUT_FILE" ]; then
  echo "挿絵計画が生成されました: $OUTPUT_FILE"
else
  echo "Error: 挿絵計画の生成に失敗しました"
  exit 1
fi

echo "完了!"
exit 0