export const regex = {
  html: {
    ruby: {
      captureBase: /<ruby>.*?<rb>(.*?)<\/rb>.*?<\/ruby>/g,
    },
    allTags: /<[^>]*>/g,
  },
  illustrationPlan: /<plan>[\s\S]*?<\/plan>/,
};
