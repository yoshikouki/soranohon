import { Book } from "@/books";
import { BookForIllustrationPlan, IllustrationPlan, SceneSchema } from "./types";

export const prompts = {
  /**
   * 挿絵計画生成プロンプト
   */
  illustrationPlan: (book: BookForIllustrationPlan): string =>
    `
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
- 安全性のために以下の表現は避けてください：
  - 暴力的な描写（刀剣・武器で切る/刺す・血など）
  - 過激な感情表現（激しい怒り、極度の恐怖など）
  - 過激な動作表現（切り開く、突き刺すなど）

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
<scene-index>{n}</scene-index>
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
`.trim(),

  /**
   * キャラクターデザイン生成プロンプト
   *
   * illustrationPlan の <theme>, <style>, および <characters> 要素を抜粋して
   * モデルに渡す。キャラクターデザインはストーリーに登場する主要キャラクターの
   * 全身像を描画するための補助として使用する。
   */
  characterDesign: ({ plan: _plan, book }: { plan: IllustrationPlan; book: Book }): string => {
    const plan = _plan.plan?.plan;
    if (!plan) {
      throw new Error("plan が見つかりません");
    }

    return `
# 青空文庫 児童文学 キャラクターデザイン制作依頼
あなたは **熟練の絵本キャラクターデザイナー** です。
絵本『${book.title}』の登場人物のキャラクターデザインを描いてください。

## 作品トーン
- テーマ : ${plan.theme.value ?? "児童文学"}
- スタイル: ${plan.style.value ?? "やわらかな手描き風"}

## 出力目的
この画像はキャラクターデザインの参照用で、今後のシーン画像制作の際に一貫性のあるキャラクター表現を実現するために使用します。
全身が見える立ち姿で、キャラクターの特徴がわかりやすいポーズにしてください。

## 登場キャラクター
${
  plan.characters.children
    .map(
      (c) =>
        `- **${c.charaName.value}**｜年齢: ${c.charaAge.value}｜性別: ${c.charaSex.value}｜外見: ${c.charaAppearance.value}｜詳細: ${c.charaDescription.value}`,
    )
    .join("\n") || "- （キャラクター情報なし）"
}

## 出力仕様
- ビジュアルスタイル : ${plan.style.value}
- 表現内容   : 全身像、表情がわかる顔アップ、特徴的な衣装の詳細など
- 背景    : シンプルな背景（キャラクターが見やすい無地や薄いグラデーション）
- 年齢層  : 5〜8 歳児向け、優しいタッチ
- 安全性  : 暴力的表現、過激な感情/動作、ネガティブ表現を避ける
- NegativePrompt: "no text, no watermark, no extreme shadow, no weapon, no blood, no violence, no extreme emotion, no fear"

## 演出メモ
- キャラクターの個性や特徴を視覚的に表現してください
- 今後のシーン画像制作の参照として使用するため、キャラクターの特徴を忠実に表現してください
- 複数のキャラクターがいる場合は、それぞれを並べて表示し、関係性がわかるように配置してください
`.trim();
  },

  /**
   * キービジュアル生成プロンプト
   *
   * illustrationPlan の <theme>, <style>, および <key-visual> 要素を抜粋して
   * モデルに渡す。raw XML 全体は渡さないことで安全システムのリジェクトを回避する。
   */
  keyVisual: ({ plan: _plan, book }: { plan: IllustrationPlan; book: Book }): string => {
    const plan = _plan.plan?.plan;
    if (!plan) {
      throw new Error("plan が見つかりません");
    }

    return `
# 青空文庫 児童文学 キービジュアル制作依頼
あなたは **熟練の絵本イラストレーター** です。
絵本『${book.title}』を象徴する 1 枚絵（正方形）を描いてください。

## 作品トーン
- テーマ : ${plan.theme.value ?? "児童文学"}
- スタイル: ${plan.style.value ?? "やわらかな手描き風"}

## シーン概要
- タイトル  : ${plan.keyVisual.keyVisualTitle.value ?? "キービジュアル"}
- 場所      : ${plan.keyVisual.keyVisualLocation.value ?? "舞台"}
- 時間帯    : ${plan.keyVisual.keyVisualTime.value ?? "時間帯不明"}
- シチュエーション: ${plan.keyVisual.keyVisualSituation.value ?? "象徴的シーン"}
- カメラ／構図    : ${plan.keyVisual.keyVisualCamera.value ?? "標準構図"}
- カラー／光源    : ${plan.keyVisual.keyVisualColorLighting.value ?? "柔らかい色彩"}

## 登場キャラクター
${
  plan.keyVisual.keyVisualCharacters.children
    .map(
      (c) =>
        `- **${c.keyVisualCharaName.value}**｜外見: ${c.keyVisualCharaAppearance.value}｜感情: ${c.keyVisualCharaEmotion.value}`,
    )
    .join("\n") ?? "- （キャラクター情報なし）"
}

## 出力仕様
- アスペクト比 : 1:1（正方形）
- ビジュアルスタイル : ${plan.style.value}
- 年齢層       : 5〜8 歳児向け、優しいタッチ
- 安全性       : 暴力的表現、過激な感情/動作、ネガティブ表現を避ける
- NegativePrompt: "no text, no watermark, no extreme shadow, no weapon, no blood, no violence, no extreme emotion, no fear"

## 演出メモ
${plan.keyVisual.keyVisualNotes.value ?? ""}
`.trim();
  },

  /**
   * シーン画像生成プロンプト
   *
   * `style` には illustrationPlan の <style> 値をそのまま渡す想定。
   * SceneSchema は XML パース結果なので `.value` を介して取り出す。
   * ※ `.sceneCharacters.children` は最大 3 人想定。
   */
  scene: (
    scene: SceneSchema,
    style: string,
    keyVisualImageUrl?: string,
    characterDesignImageUrl?: string,
  ): string =>
    `
# 青空文庫 児童文学 シーン${scene.sceneIndex.value} イラスト制作依頼
あなたは **熟練の絵本イラストレーター** です。
以下の要件を満たすシーン「${scene.sceneTitle.value}」のイラストを描いてください。

## シーン概要
- 場所          : ${scene.sceneLocation.value}
- 時間帯        : ${scene.sceneTime.value}
- シチュエーション: ${scene.sceneSituation.value}
- カメラ／構図  : ${scene.sceneCamera.value}
- カラー／光源  : ${scene.sceneColorLighting.value}

## 登場キャラクター
${scene.sceneCharacters.children
  .map(
    (c) =>
      `- **${c.sceneCharaName.value}**｜外見: ${c.sceneCharaAppearance.value}｜感情: ${c.sceneCharaEmotion.value}`,
  )
  .join("\n")}

## 出力仕様
- アスペクト比 : 1:1（正方形）
- ビジュアルスタイル : ${style}
- キャラ造形   : 統一感のあるデザイン${characterDesignImageUrl ? `\n- キャラ参照   : 添付のキャラクターデザイン画像を参照して同じキャラクターデザインを維持する` : ""}${keyVisualImageUrl ? `\n- キービジュアル参照 : 添付のキービジュアル画像も参照して同じビジュアルスタイルを維持する` : ""}
- 年齢層       : 5〜8 歳児向け、優しいタッチ
- 安全性       : 暴力的表現、過激な感情/動作、ネガティブ表現を避ける
- NegativePrompt: "no text, no watermark, no extreme shadow, no weapon, no blood, no violence, no extreme emotion, no fear"

## 演出メモ
${scene.sceneNotes.value}${characterDesignImageUrl ? `\n\n## 重要: 添付のキャラクターデザイン画像を参照して、キャラクターの外見・衣装・スタイルを一貫させてください` : ""}${keyVisualImageUrl ? `\n\n## 重要: 添付のキービジュアル画像も参照して、ビジュアルスタイルを一貫させてください` : ""}
`.trim(),
} as const;
