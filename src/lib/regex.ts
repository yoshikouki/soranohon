export const regex = {
  html: {
    ruby: {
        captureBase:
          /<ruby>(?:<rb>)?([^<]*?)(?:<\/rb>)?(?:.|\n)*?<\/ruby>/g,
      },
    allTags: /<[^>]*>/g,
  },
  illustrationPlan: /<plan>[\s\S]*?<\/plan>/,
};
