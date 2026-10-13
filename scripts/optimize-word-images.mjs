// scripts/optimize-word-images.mjs
//
// 실행: npm run images
//
// public 의 Phonics 단어 그림(short-vowels · long-vowels · blend-sounds)을
// 1) 파일 이름을 소문자 단어로 맞추고 ("Pray,.png" → "pray")
// 2) 그림 둘레의 빈 여백을 잘라 내서 주인공이 크게 보이게 하고
// 3) 가벼운 WebP 로 바꿔 줌 (장당 약 1.5MB → 0.1MB)
//
// 원본 PNG 는 지우지 않고 image-originals/ 폴더로 옮겨 둠 (git 에는 올라가지 않음).
// 새 그림을 public 에 넣은 뒤 이 스크립트를 한 번 실행하면 됨.
//
// node scripts/optimize-word-images.mjs --redo
//   image-originals/ 의 원본으로 전부 다시 만듦 (변환 방식을 바꿨을 때)

import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const CATEGORIES = ["short-vowels", "long-vowels", "blend-sounds"];
const REDO = process.argv.includes("--redo");

/* 여백을 자른 뒤 다시 붙이는 테두리 여백 (그림 긴 변 기준 비율) */
const PADDING = 0.06;

async function convert(from, to) {
  const source = sharp(from).removeAlpha();

  /* 왼쪽 위 픽셀 = 배경색 */
  const { data } = await source
    .clone()
    .extract({ left: 2, top: 2, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const background = { r: data[0], g: data[1], b: data[2] };

  const trimmed = await source
    .clone()
    .trim({ background, threshold: 18 })
    .toBuffer({ resolveWithObject: true });

  const { width, height } = trimmed.info;

  /* 정사각형으로 맞추고 사방에 조금 여백 */
  const side = Math.round(Math.max(width, height) * (1 + PADDING * 2));
  const padX = Math.round((side - width) / 2);
  const padY = Math.round((side - height) / 2);

  await sharp(trimmed.data)
    .extend({
      top: padY,
      bottom: side - height - padY,
      left: padX,
      right: side - width - padX,
      background,
    })
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(to);
}

let converted = 0;
const skipped = [];

for (const category of CATEGORIES) {
  const categoryDir = path.join(ROOT, "public", category);

  for (const group of fs.readdirSync(categoryDir)) {
    const dir = path.join(categoryDir, group);

    /* menu 폴더(메뉴 카드 그림)는 단어 그림이 아니므로 건드리지 않음 */
    if (!fs.statSync(dir).isDirectory() || group === "menu") continue;

    const backupDir = path.join(ROOT, "image-originals", category, group);

    fs.mkdirSync(backupDir, { recursive: true });

    /* 새로 넣은 그림 → 원본 폴더로 옮김 */
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(png|jpe?g)$/i.test(file)) continue;

      fs.renameSync(path.join(dir, file), path.join(backupDir, file));
    }

    for (const file of fs.readdirSync(backupDir)) {
      if (!/\.(png|jpe?g)$/i.test(file)) continue;

      const name = path.parse(file).name;
      const slug = name.toLowerCase().replace(/[^a-z]/g, "");

      /* 단어 이름으로 볼 수 없는 파일(예: "ChatGPT 이미지 …")은 건너뜀 */
      if (!slug || /[^a-zA-Z,. ]/.test(name)) {
        skipped.push(`${category}/${group}/${file}`);
        continue;
      }

      const to = path.join(dir, `${slug}.webp`);

      if (!REDO && fs.existsSync(to)) continue;

      await convert(path.join(backupDir, file), to);

      converted += 1;
    }
  }
}

console.log(`변환 ${converted}장`);

if (skipped.length) {
  console.log("단어 이름이 아니라서 건너뛴 파일 (image-originals 에 있음):");
  skipped.forEach((file) => console.log("  " + file));
}
