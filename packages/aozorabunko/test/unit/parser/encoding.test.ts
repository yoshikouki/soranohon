// @ts-expect-error: no type definitions for encoding-japanese
import Encoding from "encoding-japanese";
import { describe, expect, it } from "vitest";
import { detectAndDecode } from "../../../src/parser/encoding";

const utf8Text = "こんにちは、世界！";
const sjisText = "こんにちは、世界！";
const utf8Buffer = Buffer.from(utf8Text, "utf-8");
const sjisBuffer = Buffer.from(
  Encoding.convert(sjisText, { to: "SJIS", from: "UNICODE", type: "arraybuffer" }),
);

describe("detectAndDecode", () => {
  it("should decode UTF-8 buffer", () => {
    const { text } = detectAndDecode(utf8Buffer);
    expect(text).toBe(utf8Text);
  });

  it("should decode Shift_JIS buffer", () => {
    const { text } = detectAndDecode(sjisBuffer);
    expect(text).toBe(sjisText);
  });
});
