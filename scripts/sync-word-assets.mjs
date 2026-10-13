// scripts/sync-word-assets.mjs
//
// 실행: node scripts/sync-word-assets.mjs   (npm run dev / build 전에 자동 실행됨)
//
// public 폴더에 실제로 들어 있는 Phonics 단어 그림 · 음성 · 한글 자료 목록을
// app/(main)/english/wordAssets.ts 로 만들어 줌.
// 단어 데이터는 이 목록을 보고 "그림이 아직 없는 단어"를 구분하므로,
// 그림이나 한글 파일을 public 에 넣기만 하면 화면에 자동으로 반영됨.

import fs from "fs";
import path from "path";

const PUBLIC = path.join(process.cwd(), "public");

const FOLDERS = [
  "short-vowels",
  "long-vowels",
  "blend-sounds",
  "sight-words/menu",
  "audio/short-vowels",
  "audio/long-vowels",
  "audio/blend-sounds",
  "audio/sight-words",
  "worksheets/short-vowels",
  "worksheets/long-vowels",
  "worksheets/blend-sounds",
  "worksheets/sight-words",
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(".")) continue;

    const full = path.join(dir, name);

    if (fs.statSync(full).isDirectory()) {
      walk(full, out);
    } else {
      out.push("/" + path.relative(PUBLIC, full).split(path.sep).join("/"));
    }
  }

  return out;
}

const files = FOLDERS.flatMap((folder) => walk(path.join(PUBLIC, folder))).sort();

const content = `// 자동으로 만들어지는 파일 (scripts/sync-word-assets.mjs) — 직접 고치지 마세요.

export const wordAssets: ReadonlySet<string> = new Set([
${files.map((file) => `  ${JSON.stringify(file)},`).join("\n")}
]);
`;

fs.writeFileSync(
  path.join(process.cwd(), "app", "(main)", "english", "wordAssets.ts"),
  content
);

console.log(`wordAssets.ts 갱신: ${files.length}개 파일`);
