export type CommunityCategoryId =
  | "study-proof"
  | "english-tip"
  | "question"
  | "bunny-proud"
  | "local-recommend";

export type CommunityCategory = {
  id: CommunityCategoryId;
  icon: string;
  title: string;
  description: string;
  color: string;
};

export type CommunityPost = {
  id: string;
  category: CommunityCategoryId;
  title: string;
  content: string;
  image?: string;
  author: string;
  avatarUrl?: string;
  date: string;
  likes: number;
  comments: string[];
};

export const communityCategories: CommunityCategory[] = [
  {
    id: "study-proof",
    icon: "📸",
    title: "학습 인증",
    description: "오늘의 학습을 인증하고 서로 응원해요!",
    color: "pink",
  },
  {
    id: "english-tip",
    icon: "📚",
    title: "영어 학습 팁",
    description: "유용한 학습 방법과 자료를 공유해요!",
    color: "yellow",
  },
  {
    id: "question",
    icon: "❓",
    title: "질문해요",
    description: "궁금한 내용을 질문하고 답변을 받아보세요!",
    color: "green",
  },
  {
    id: "bunny-proud",
    icon: "🐰",
    title: "우리 Bunny 자랑",
    description: "우리 토끼의 성장과 아이템을 자랑해요!",
    color: "purple",
  },
  {
    id: "local-recommend",
    icon: "📍",
    title: "우리 동네 영어 추천",
    description: "주변 영어 학원, 영어유치원, 영어 프로그램 정보를 나눠요!",
    color: "peach",
  },
];

export const defaultPosts: CommunityPost[] = [];