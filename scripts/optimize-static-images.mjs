// scripts/optimize-static-images.mjs
//
// 실행: node scripts/optimize-static-images.mjs
//
// 단어 그림이 아닌 큰 그림(Shop 배경 · 토끼, Test 메뉴 그림, Home 배경)을
// 가벼운 WebP 로 바꿔 줌 (배경 한 장 약 2.7MB → 0.2MB).
// 단어 그림과 달리 여백을 자르거나 크기를 바꾸지 않고 그대로 변환함.
//
// 원본 PNG 는 지우지 않고 image-originals/ 의 같은 경로로 옮겨 둠 (git 에는 올라가지 않음).
// 새 PNG 를 아래 폴더에 넣은 뒤 이 스크립트를 한 번 실행하고,
// 코드에서는 같은 이름의 .webp 를 가리키면 됨.

import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();

/* 변환할 폴더 (하위 폴더 포함) 또는 파일 */
const TARGETS = ["shop", "dashboard", "test"];

/* 긴 변이 이보다 크면 줄임 (앱 화면 최대 폭 1360px 의 약 1.4배) */
const MAX_WIDTH = 1920;

function collect(target) {
  const full = path.join(ROOT, "public", target);

  if (!fs.existsSync(full)) return [];

  if (fs.statSync(full).isFile()) return [target];

  return fs
    .readdirSync(full)
    .flatMap((name) => collect(path.join(target, name)));
}

let converted = 0;
let before = 0;
let after = 0;

for (const file of TARGETS.flatMap(collect)) {
  if (!/\.(png|jpe?g)$/i.test(file)) continue;

  const from = path.join(ROOT, "public", file);
  const to = from.replace(/\.(png|jpe?g)$/i, ".webp");
  const backup = path.join(ROOT, "image-originals", file);

  fs.mkdirSync(path.dirname(backup), { recursive: true });

  /* 이미 WebP 가 있으면 다시 만들지 않고 원본만 옮김 */
  if (fs.existsSync(to)) {
    fs.renameSync(from, backup);
    continue;
  }

  /* 투명한 부분이 있는 그림(토끼)은 품질을 조금 더 높게 */
  const { hasAlpha } = await sharp(from).metadata();

  await sharp(from)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: hasAlpha ? 90 : 84 })
    .toFile(to);

  before += fs.statSync(from).size;
  after += fs.statSync(to).size;

  fs.renameSync(from, backup);

  converted += 1;
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + "MB";

console.log(`변환 ${converted}장: ${mb(before)} → ${mb(after)}`);
