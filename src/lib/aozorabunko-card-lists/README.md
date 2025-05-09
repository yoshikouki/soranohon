# カラム

## `list_person_all_extended_utf8.csv`

1. 作品ID
2. 作品名
3. 作品名読み
4. ソート用読み
5. 副題
6. 副題読み
7. 原題
8. 初出
9. 分類番号
10. 文字遣い種別
11. 作品著作権フラグ
12. 公開日
13. 最終更新日
14. 図書カードURL
15. 人物ID
16. 姓
17. 名
18. 姓読み
19. 名読み
20. 姓読みソート用
21. 名読みソート用
22. 姓ローマ字
23. 名ローマ字
24. 役割フラグ
25. 生年月日
26. 没年月日
27. 人物著作権フラグ
28. 底本名1
29. 底本出版社名1
30. 底本初版発行年1
31. 入力に使用した版1
32. 校正に使用した版1
33. 底本の親本名1
34. 底本の親本出版社名1
35. 底本の親本初版発行年1
36. 底本名2
37. 底本出版社名2
38. 底本初版発行年2
39. 入力に使用した版2
40. 校正に使用した版2
41. 底本の親本名2
42. 底本の親本出版社名2
43. 底本の親本初版発行年2
44. 入力者
45. 校正者
46. テキストファイルURL
47. テキストファイル最終更新日
48. テキストファイル符号化方式
49. テキストファイル文字集合
50. テキストファイル修正回数
51. XHTML/HTMLファイルURL
52. XHTML/HTMLファイル最終更新日
53. XHTML/HTMLファイル符号化方式
54. XHTML/HTMLファイル文字集合
55. XHTML/HTMLファイル修正回数

# 児童書かつ著作権なしのデータ抽出

児童書かつ著作権なしの書籍を抽出するための条件：

1. 分類番号（9列目）が「NDC K」で始まる（児童書を示す）
2. 作品著作権フラグ（11列目）が「なし」である

抽出スクリプトを作成しました。実行方法：

```bash
bun run ./src/lib/aozorabunko-card-lists/extract-childrens-books.ts
```

# 文字数の計算

## ファイル

`~/src/github.com/aozorabunko/aozorabunko` に青空文庫のデータがあります。

CSV の各URL列のホスト以降のパスは、`~/src/github.com/aozorabunko/aozorabunko` 配下のパスに対応しています。
以下に一例を示します。

| 列番号 | 列名 | URL | 対応するパス |
| --- | --- | --- | --- |
| 14 | 図書カードURL | https://www.aozora.gr.jp/cards/001091/card59835.html | ~/src/github.com/aozorabunko/aozorabunko/cards/001091/card59835.html |
| 46 | テキストファイルURL | https://www.aozora.gr.jp/cards/001091/files/59835_ruby_72426.zip | ~/src/github.com/aozorabunko/aozorabunko/cards/001091/files/59835_ruby_72426.zip |
| 51 | XHTML/HTMLファイルURL | https://www.aozora.gr.jp/cards/001091/files/59835_72466.html | ~/src/github.com/aozorabunko/aozorabunko/cards/001091/files/59835_72466.html |

ファイル符号化方式は `ShiftJIS` で、ファイル文字集合は `JIS X 0208` です。

## 前処理

1. 物語のHTMLファイル (例: `51. XHTML/HTMLファイルURL`) をパースします
2. `<div class="main_text">` 内のコンテンツを取得します（物語の本文）
3. ルビタグから本文のみを抽出します
   - 例: `<ruby><rb>姫</rb><rp>（</rp><rt>ひめ</rt><rp>）</rp></ruby>` から `姫` のみを残します
4. すべての HTML タグを削除します
5. 整形されたテキストの文字数を計算します
6. 文字数を CSV ファイルの新しい列として追加します

# 補足情報

## 同名ファイルが存在する

```bash
$ find ~/src/github.com/aozorabunko/aozorabunko -name "list_person_all_extended_*"
~/src/github.com/aozorabunko/aozorabunko/soramoyou/list_person_all_extended_utf8.zip
~/src/github.com/aozorabunko/aozorabunko/index_pages/list_person_all_extended_utf8.zip
```

⏺ Bash(unzip -v tmp/soramoyou.zip | head -n 5 && echo "---" && unzip -v tmp/index_pages.zip | head -n 5)…
  ⎿  Archive:  tmp/soramoyou.zip
      Length   Method    Size  Cmpr    Date    Time   CRC-32   Name
     --------  ------  ------- ---- ---------- ----- --------  ----
     10717778  Defl:N  1269379  88% 12-26-2012 05:01 4d5f9900  list_person_all_extended_utf8.csv
     --------          -------  ---                            -------
     ---
     Archive:  tmp/index_pages.zip
      Length   Method    Size  Cmpr    Date    Time   CRC-32   Name
     --------  ------  ------- ---- ---------- ----- --------  ----
     17015095  Defl:N  2074235  88% 05-01-2025 02:51 b1b3ff95  list_person_all_extended_utf8.csv
     --------          -------  ---                            -------

1. ファイルサイズの違い：
  - soramoyou.zip: 1,269,577 バイト（約1.2MB）
  - index_pages.zip: 2,074,451 バイト（約2.0MB）
2. 内容の違い：
  - 両方とも同じ名前のCSVファイル list_person_all_extended_utf8.csv を含んでいます
  - しかし圧縮前のサイズが大きく異なります：
      - soramoyou: 10,717,778 バイト（約10.2MB）
    - index_pages: 17,015,095 バイト（約16.2MB）
3. 作成日時の違い：
  - soramoyou: 2012年12月26日 05:01
  - index_pages: 2025年5月1日 02:51（最近更新されています）
4. CRC-32チェックサムも異なります：
  - soramoyou: 4d5f9900
  - index_pages: b1b3ff95

これらの違いから、index_pagesのファイルはsoramoyouより新しく、内容も大幅に増えていることがわかります。おそらく青空文
庫の作家リスト（著者データベース）の異なるバージョンで、index_pagesの方が最新の情報を含んでいると考えられます。
