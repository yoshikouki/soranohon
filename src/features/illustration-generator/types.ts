// 使用される本データの型定義
export interface BookForIllustrationPlan {
  bookId: string;
  title: string;
  contentWithTags: string;
}

export interface IllustrationScene {
  sceneId: string;
  title: string;
  description: string;
  mdxStart: number;
  mdxEnd: number;
}

export interface IllustrationPlan {
  bookId: string;
  scenes: IllustrationScene[];
  rawPlan: string;
}
