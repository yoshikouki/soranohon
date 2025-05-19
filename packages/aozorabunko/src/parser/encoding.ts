/**
 * 文字エンコーディング検出・デコード
 */

// @ts-expect-error: no type definitions for encoding-japanese
import Encoding from "encoding-japanese";

/**
 * バイナリデータから文字コード判定＆デコードしたテキストと判定結果を返す
 */
export function detectAndDecode(buffer: Buffer): { text: string; encoding: string } {
  const uint8array = new Uint8Array(buffer);
  const encoding = Encoding.detect(uint8array);
  if (!encoding) {
    throw new Error("Failed to detect encoding");
  }
  const text = Encoding.convert(uint8array, {
    to: "UNICODE",
    from: encoding,
    type: "string",
  }) as string;
  return { text, encoding };
}
