#!/bin/bash
set -e

# 変換対象の拡張子
EXTENSIONS="html txt"

for ext in $EXTENSIONS; do
  find ./src -type f -name "*.$ext" | while read -r file; do
    # UTF-8 ならスキップ
    if file "$file" | grep -q 'UTF-8'; then
      echo "[SKIP] Already UTF-8: $file"
      continue
    fi
    tmpfile="${file}.utf8tmp"
    if iconv -f SHIFT_JIS -t UTF-8 "$file" > "$tmpfile"; then
      mv "$tmpfile" "$file"
      echo "Converted: $file"
    else
      echo "[ERROR] Failed to convert: $file" >&2
      rm -f "$tmpfile"
    fi
  done
done
