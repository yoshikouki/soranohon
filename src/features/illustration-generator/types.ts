// 使用される本データの型定義
export interface BookForIllustrationPlan {
  bookId: string;
  title: string;
  contentWithTags: string;
}

export interface IllustrationScene {
  index: string;
  title: string;
  location: string;
  time: string;
  characters: IllustrationCharacter[];
  situation: string;
  camera: string;
  colorLighting: string;
  notes: string;
}

export interface IllustrationCharacter {
  name: string;
  age: number;
  sex: string;
  appearance: string;
}

export interface IllustrationPlan {
  bookId: string;
  rawPlan: string;
  plan: IllustrationPlanSchema | null;
}

export type IllustrationPlanSchema = {
  plan: {
    name: "plan";
    theme: { name: "theme"; value: string };
    style: { name: "style"; value: string };
    characters: {
      name: "characters";
      children: CharacterSchema[];
    };
    characterCount: { name: "character-count"; value: number };
    scenes: {
      name: "scenes";
      children: SceneSchema[];
    };
    sceneCount: { name: "scene-count"; value: number };
    keyVisual: KeyVisualSchema;
  };
};

export type CharacterSchema = {
  name: "chara";
  charaName: { name: "chara-name"; value: string };
  charaAge: { name: "chara-age"; value: number };
  charaSex: { name: "chara-sex"; value: string };
  charaAppearance: { name: "chara-appearance"; value: string };
  charaDescription: { name: "chara-description"; value: string };
};

export type SceneSchema = {
  name: "scene";
  sceneIndex: { name: "scene-index"; value: number };
  sceneTitle: { name: "scene-title"; value: string };
  sceneLocation: { name: "scene-location"; value: string };
  sceneTime: { name: "scene-time"; value: string };
  sceneCharacters: {
    name: "scene-characters";
    children: SceneCharaSchema[];
  };
  sceneSituation: { name: "scene-situation"; value: string };
  sceneCamera: { name: "scene-camera"; value: string };
  sceneColorLighting: { name: "scene-color-lighting"; value: string };
  sceneNotes: { name: "scene-notes"; value: string };
};

export type SceneCharaSchema = {
  name: "scene-chara";
  sceneCharaName: { name: "scene-chara-name"; value: string };
  sceneCharaAppearance: { name: "scene-chara-appearance"; value: string };
  sceneCharaDescription: { name: "scene-chara-description"; value: string };
  sceneCharaEmotion: { name: "scene-chara-emotion"; value: string };
};

export type KeyVisualSchema = {
  name: "key-visual";
  keyVisualTitle: { name: "key-visual-title"; value: string };
  keyVisualLocation: { name: "key-visual-location"; value: string };
  keyVisualTime: { name: "key-visual-time"; value: string };
  keyVisualCharacters: {
    name: "key-visual-characters";
    children: KeyVisualCharaSchema[];
  };
  keyVisualSituation: { name: "key-visual-situation"; value: string };
  keyVisualCamera: { name: "key-visual-camera"; value: string };
  keyVisualColorLighting: { name: "key-visual-color-lighting"; value: string };
  keyVisualNotes: { name: "key-visual-notes"; value: string };
};

export type KeyVisualCharaSchema = {
  name: "key-visual-chara";
  keyVisualCharaName: { name: "key-visual-chara-name"; value: string };
  keyVisualCharaAppearance: { name: "key-visual-chara-appearance"; value: string };
  keyVisualCharaDescription: { name: "key-visual-chara-description"; value: string };
  keyVisualCharaEmotion: { name: "key-visual-chara-emotion"; value: string };
};
