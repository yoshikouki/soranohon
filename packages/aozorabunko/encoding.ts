import Encoding from "encoding-japanese";

/**
 * バイナリデータから文字コード判定＆デコードしたテキストと判定結果を返す
 */
export function detectAndDecode(buffer: Buffer) {
  const uint8array = new Uint8Array(buffer);
  const encoding = Encoding.detect(uint8array);
  if (!encoding) {
    throw new Error("Failed to detect encoding");
  }
  const text = Encoding.convert(uint8array, {
    to: "UNICODE",
    from: encoding,
    type: "string",
  });
  return { text, encoding };
}

/**
 * バイナリデータをUTF-8にデコードする
 * 主にShiftJISエンコードされた青空文庫のHTMLファイルをデコードするのに使用
 */
export function decode(buffer: Buffer): string {
  const { text } = detectAndDecode(buffer);
  return text;
}
