import * as cheerio from "cheerio";
import * as path from "path";

export function extractBookMeta(htmlPath: string, html: string) {
  const $ = cheerio.load(html);
  const id = path.basename(htmlPath, ".html");
  const title = $("h1.title").text() || $('meta[name="DC.Title"]').attr("content") || "";
  const creator = $("h2.author").text() || $('meta[name="DC.Creator"]').attr("content") || "";
  const translator = $("h2.translator").text() || undefined;
  const bibliographyRaw = $(".bibliographical_information")
    .text()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .join("\\n")
    .replace(/^(\\n)+/, "")
    .replace(/(\\n)+$/, "");
  return {
    id,
    title,
    creator,
    translator,
    bibliographyRaw,
  };
}
