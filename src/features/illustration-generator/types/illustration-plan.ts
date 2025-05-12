export interface IllustrationPlanRequest {
  bookId: string;
  sceneCount?: number;
  prompt?: string;
  stylePreference?: string;
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
