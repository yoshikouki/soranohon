import { z } from "zod";
import { Book } from "@/books";
import { BookForIllustrationPlan, IllustrationPlan, IllustrationPlanJSON } from "./types";

const characterSchema = z.object({
  name: z.string(),
  age: z.string(),
  sex: z.string(),
  appearance: z.string(),
  description: z.string(),
});

const sceneCharacterSchema = z.object({
  name: z.string(),
  appearance: z.string(),
  description: z.string(),
  emotion: z.string(),
});

const sceneSchema = z.object({
  index: z.number(),
  title: z.string(),
  location: z.string(),
  time: z.string(),
  characters: z.array(sceneCharacterSchema),
  situation: z.string(),
  camera: z.string(),
  colorLighting: z.string(),
  notes: z.string(),
});

const keyVisualCharacterSchema = z.object({
  name: z.string(),
  appearance: z.string(),
  description: z.string(),
  emotion: z.string(),
});

const keyVisualSchema = z.object({
  title: z.string(),
  location: z.string(),
  time: z.string(),
  characters: z.array(keyVisualCharacterSchema),
  situation: z.string(),
  camera: z.string(),
  colorLighting: z.string(),
  notes: z.string(),
});

export const illustrationPlanSchema = z.object({
  theme: z.string(),
  style: z.string(),
  characters: z.array(characterSchema),
  characterCount: z.number(),
  scenes: z.array(sceneSchema),
  sceneCount: z.number(),
  keyVisual: keyVisualSchema,
});

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
挿絵計画は以下のJSON フォーマットを厳守してください。
\`\`\`json
{
  "theme": "{物語の主要テーマ}",
  "style": "{視覚的な特徴}",
  "characters": [
    {
      "name": "{名前}",
      "age": "{年齢}",
      "sex": "{性別}",
      "appearance": "{外見}",
      "description": "{キャラメモ}"
    }
  ],
  "characterCount": {登場人物の数},
  "scenes": [
    {
      "index": {n},
      "title": "{短いタイトル}",
      "location": "{場所}",
      "time": "{時間}",
      "characters": [
        {
          "name": "{名前}",
          "appearance": "{外見}",
          "description": "{キャラメモ}",
          "emotion": "{感情・トーン}"
        }
      ],
      "situation": "{シチュエーション}",
      "camera": "{カメラ視点・構図}",
      "colorLighting": "{カラーパレット・ライティング}",
      "notes": "{演出上の注意点・AI 生成プロンプトのヒント等}"
    }
  ],
  "sceneCount": {挿絵の枚数},
  "keyVisual": {
    "title": "{短いタイトル}",
    "location": "{場所}",
    "time": "{時間}",
    "characters": [
      {
        "name": "{名前}",
        "appearance": "{外見}",
        "description": "{キャラメモ}",
        "emotion": "{感情・トーン}"
      }
    ],
    "situation": "{シチュエーション}",
    "camera": "{カメラ視点・構図}",
    "colorLighting": "{カラーパレット・ライティング}",
    "notes": "{演出上の注意点・AI 生成プロンプトのヒント等}"
  }
}
\`\`\`

## 物語「${book.title}」
"""
${book.contentWithTags}
"""

# 挿絵計画
`.trim(),

  /**
   * キャラクターデザイン生成プロンプト
   *
   * illustrationPlan の theme, style, および characters を抜粋して
   * モデルに渡す。キャラクターデザインはストーリーに登場する主要キャラクターの
   * 全身像を描画するための補助として使用する。
   */
  characterDesign: ({
    plan: _plan,
    book,
  }: {
    plan: IllustrationPlan;
    book: Book;
  }): Array<{ type: "text"; text: string }> => {
    const plan = _plan.plan;
    if (!plan) {
      throw new Error("plan が見つかりません");
    }

    const prompt = `
# 青空文庫 児童文学 キャラクターデザイン制作依頼
あなたは **熟練の絵本キャラクターデザイナー** です。
絵本『${book.title}』の登場人物のキャラクターデザインを描いてください。

## 作品トーン
- テーマ : ${plan.theme ?? "児童文学"}
- スタイル: ${plan.style ?? "やわらかな手描き風"}

## 出力目的
この画像はキャラクターデザインの参照用で、今後のシーン画像制作の際に一貫性のあるキャラクター表現を実現するために使用します。
全身が見える立ち姿で、キャラクターの特徴がわかりやすいポーズにしてください。

## 登場キャラクター
${
  plan.characters
    .map(
      (c) =>
        `- **${c.name}**｜年齢: ${c.age}｜性別: ${c.sex}｜外見: ${c.appearance}｜詳細: ${c.description}`,
    )
    .join("\n") || "- （キャラクター情報なし）"
}

## 出力仕様
- ビジュアルスタイル : ${plan.style}
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

    return [{ type: "text", text: prompt }];
  },

  /**
   * キービジュアル生成プロンプト
   *
   * illustrationPlan の theme, style, および keyVisual を抜粋して
   * モデルに渡す。
   */
  keyVisual: ({
    plan: _plan,
    book,
    characterDesignImageUrl,
  }: {
    plan: IllustrationPlan;
    book: Book;
    characterDesignImageUrl?: string;
  }): Array<
    { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
  > => {
    const plan = _plan.plan;
    if (!plan) {
      throw new Error("plan が見つかりません");
    }

    const prompt = `
# 青空文庫 児童文学 キービジュアル制作依頼
あなたは **熟練の絵本イラストレーター** です。
絵本『${book.title}』を象徴する 1 枚絵（正方形）を描いてください。
添付したキャラクターデザイン画像を参照してキャラクターを描いてください。

## 作品トーン
- テーマ : ${plan.theme ?? "児童文学"}
- スタイル: ${plan.style ?? "やわらかな手描き風"}

## シーン概要
- タイトル  : ${plan.keyVisual.title ?? "キービジュアル"}
- 場所      : ${plan.keyVisual.location ?? "舞台"}
- 時間帯    : ${plan.keyVisual.time ?? "時間帯不明"}
- シチュエーション: ${plan.keyVisual.situation ?? "象徴的シーン"}
- カメラ／構囲    : ${plan.keyVisual.camera ?? "標準構囲"}
- カラー／光源    : ${plan.keyVisual.colorLighting ?? "柔らかい色彩"}

## 登場キャラクター
キャラクターデザイン画像を添付しています。
この画像のキャラクターデザインを忠実に参照して、キャラクターの外見・衣装・スタイルを一貫して維持してください。
${plan.keyVisual.characters
  .map((c) => `- **${c.name}**｜外見: ${c.appearance}｜感情: ${c.emotion}`)
  .join("\n")}

## 出力仕様
- アスペクト比 : 1:1（正方形）
- ビジュアルスタイル : ${plan.style}
- 年齢層       : 5〜8 歳児向け、優しいタッチ
- 安全性       : 暴力的表現、過激な感情/動作、ネガティブ表現を避ける
- NegativePrompt: "no text, no watermark, no extreme shadow, no weapon, no blood, no violence, no extreme emotion, no fear"

## 演出メモ
${plan.keyVisual.notes}
`.trim();

    const content: Array<
      { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
    > = [{ type: "text", text: prompt }];

    if (characterDesignImageUrl) {
      content.push({
        type: "image_url",
        image_url: { url: characterDesignImageUrl },
      });
    }

    return content;
  },

  /**
   * シーン画像生成プロンプト
   *
   * JSON形式のシーンデータから描画プロンプトを生成。
   * ※ characters は最大 3 人想定。
   */
  scene: (
    scene: IllustrationPlanJSON["scenes"][0],
    style: string,
    keyVisualImageUrl?: string,
    characterDesignImageUrl?: string,
  ): Array<
    { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
  > => {
    const prompt = `
# 青空文庫 児童文学 シーン${scene.index} イラスト制作依頼
あなたは **熟練の絵本イラストレーター** です。
以下の要件を満たすシーン「${scene.title}」のイラストを描いてください。
${characterDesignImageUrl ? "このイラストでは、添付のキャラクターデザイン画像を参照して登場キャラクターを一貫したデザインで描いてください。" : ""}

## シーン概要
- 場所          : ${scene.location}
- 時間帯        : ${scene.time}
- シチュエーション: ${scene.situation}
- カメラ／構図  : ${scene.camera}
- カラー／光源  : ${scene.colorLighting}

## 登場キャラクター
添付のキャラクターデザイン画像を忠実に参照して、キャラクターの外見・衣装・スタイルを一貫して維持してください。
${scene.characters
  .map((c) => `- **${c.name}**｜外見: ${c.appearance}｜感情: ${c.emotion}`)
  .join("\n")}

## 出力仕様
- アスペクト比 : 1:1（正方形）
- ビジュアルスタイル : ${style}
- キャラ造形   : 統一感のあるデザイン${characterDesignImageUrl ? `\n- キャラ参照   : 添付のキャラクターデザイン画像を参照して、同じデザインを忠実に維持` : ""}${keyVisualImageUrl ? `\n- キービジュアル参照 : 添付のキービジュアル画像も参照して、同じスタイルを維持` : ""}
- 年齢層       : 5〜8 歳児向け、優しいタッチ
- 安全性       : 暴力的表現、過激な感情/動作、ネガティブ表現を避ける
- NegativePrompt: "no text, no watermark, no extreme shadow, no weapon, no blood, no violence, no extreme emotion, no fear"

## 演出メモ
${scene.notes}
`.trim();

    const content: Array<
      { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
    > = [{ type: "text", text: prompt }];

    if (characterDesignImageUrl) {
      content.push({
        type: "image_url",
        image_url: { url: characterDesignImageUrl },
      });
    }

    if (keyVisualImageUrl) {
      content.push({
        type: "image_url",
        image_url: { url: keyVisualImageUrl },
      });
    }

    return content;
  },
} as const;
