import { BookForIllustrationPlan } from "./types";

export const prompts = {
  illustrationPlan: (book: BookForIllustrationPlan): string => `
# 青空文庫 児童文学 挿絵計画作成依頼
あなたは**熟練の絵本アートディレクター**です。これから渡す青空文庫の絵本 **「${book.title}」** を読み、
物語をもっとも魅力的に伝える挿絵を設計してください。

## 指示
1. まず物語全体を分析し、物語構造を把握してください（導入、展開、クライマックス、結末など）
2. 同じ人物は**外見・衣装が一貫**するよう「キャラメモ」を短く添える
3. 物語の長さと複雑さに応じて、適切な挿絵の枚数を提案してください
4. **カメラ視点・構図**と**カラーパレット／ライティング**で感情を補強する提案を入れる
5. 歴史・文化背景が不明な場合は想像を用いてもよいが、その旨を "<scene-notes>" に明示
6. すべてテンプレートを厳守して出力する

## 挿絵選択の基準
以下のような場面を優先的に選んでください：
- 物語の転換点となる重要な瞬間
- 登場人物の感情や性格が明確に表れるシーン
- 物語の世界観や設定が伝わる場面
- 視覚的に印象的になると思われるアクションシーン
- 物語のテーマや教訓が象徴的に表現されている瞬間
- 一枚目は物語の導入のために先頭に位置します

## 注意点
- 物語の長さや内容に応じて柔軟に挿絵の数を調整してください
- すべてのキャラクターを描画する必要はありません。物語の展開に必要なキャラクターを描画してください
- 挿絵のアスペクト比は正方形です
- 挿絵は紙ではなく Web アプリケーションで表示されます
- 文化的背景や時代設定を尊重する挿絵を心がけてください
- 子どもの想像力を刺激しつつ、テキストを補完する挿絵を目指してください
- 各挿絵は物語を進める上で意味のある瞬間を捉えるようにしてください

## 回答フォーマット
挿絵計画は以下のフォーマットを厳守してください。
"""
<plan>
<theme>{物語の主要テーマ}</theme>
<style>{視覚的な特徴}</style>
<characters>
<chara>
<chara-name>{名前}</chara-name>
<chara-age>{年齢}</chara-age>
<chara-sex>{性別}</chara-sex>
<chara-appearance>{外見}</chara-appearance>
<chara-description>{キャラメモ}</chara-description>
</chara>
(<chara>{複数登場するなら追加}</chara>)
</characters>
<character-count>{登場人物の数}</character-count>
<scenes>
<scene>
<scene-no>{n}</scene-no>
<scene-title>{短いタイトル}</scene-title>
<scene-location>{場所}</scene-location>
<scene-time>{時間}</scene-time>
<scene-characters>
<scene-chara>
<scene-chara-name>{名前}</scene-chara-name>
<scene-chara-appearance>{外見}</scene-chara-appearance>
<scene-chara-description>{キャラメモ}</scene-chara-description>
<scene-chara-emotion>{感情・トーン}</scene-chara-emotion>
</scene-chara>
(<scene-chara>{複数登場するなら追加。最大3人まで}</scene-chara>)
</scene-characters>
<scene-situation>{シチュエーション}</scene-situation>
<scene-camera>{カメラ視点・構図}</scene-camera>
<scene-color-lighting>{カラーパレット・ライティング}</scene-color-lighting>
<scene-notes>{演出上の注意点・AI 生成プロンプトのヒント等}</scene-notes>
</scene>
(<scene>{挿絵の枚数分追加}</scene>)
</scenes>
<scene-count>{挿絵の枚数}</scene-count>
<key-visual>
<key-visual-title>{短いタイトル}</key-visual-title>
<key-visual-location>{場所}</key-visual-location>
<key-visual-time>{時間}</key-visual-time>
<key-visual-characters>
<key-visual-chara>
<key-visual-chara-name>{名前}</key-visual-chara-name>
<key-visual-chara-appearance>{外見}</key-visual-chara-appearance>
<key-visual-chara-description>{キャラメモ}</key-visual-chara-description>
<key-visual-chara-emotion>{感情・トーン}</key-visual-chara-emotion>
<key-visual-characters>
<key-visual-chara>
<key-visual-chara-name>{名前}</key-visual-chara-name>
<key-visual-chara-appearance>{外見}</key-visual-chara-appearance>
<key-visual-chara-description>{キャラメモ}</key-visual-chara-description>
<key-visual-chara-emotion>{感情・トーン}</key-visual-chara-emotion>
</key-visual-chara>
(<key-visual-chara>{複数登場するなら追加。最大3人まで}</key-visual-chara>)
</key-visual-characters>
<key-visual-situation>{シチュエーション}</key-visual-situation>
<key-visual-camera>{カメラ視点・構図}</key-visual-camera>
<key-visual-color-lighting>{カラーパレット・ライティング}</key-visual-color-lighting>
<key-visual-notes>{演出上の注意点・AI 生成プロンプトのヒント等}</key-visual-notes>
</key-visual>
</plan>
"""

## 物語「${book.title}」
"""
${book.contentWithTags}
"""

# 挿絵計画
`,
} as const;
