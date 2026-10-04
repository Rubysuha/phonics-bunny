import type { CommunityCategoryId } from "./data";

/*
  Community 하위 페이지가 함께 쓰는 카테고리 색
  (메인 Community 화면과 같은 값)

  color : 아이콘 · 배지 글자
  tint  : 아주 연한 배경
*/
export const categoryColor: Record<CommunityCategoryId, string> = {
  "study-proof": "#ff6b57",
  "english-tip": "#d49a2a",
  question: "#3576b8",
  "bunny-proud": "#d65496",
  "local-recommend": "#2f8b78",
};

export const categoryTint: Record<CommunityCategoryId, string> = {
  "study-proof": "#fff0ed",
  "english-tip": "#fff6df",
  question: "#eaf4ff",
  "bunny-proud": "#fff0f7",
  "local-recommend": "#eaf7f4",
};

/* 카테고리를 알 수 없을 때 */
export const DEFAULT_CATEGORY_COLOR = "#3576b8";
export const DEFAULT_CATEGORY_TINT = "#eef4fa";

/* 프로필 사진이 없을 때 이름 첫 글자 뒤에 까는 색 */
export const avatarColors = [
  "#285c91",
  "#4a86b8",
  "#5f7f9c",
  "#3f8f82",
  "#c9708c",
];
