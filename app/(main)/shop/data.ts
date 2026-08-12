export type CategoryId =
  | "royal"
  | "job"
  | "student"
  | "family"
  | "battle"
  | "fantasy";

export type Category = {
  id: CategoryId;
  label: string;
  icon: string;
};

export type BunnySkin = {
  id: string;
  category: CategoryId;
  name: string;
  price: number;
  image: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  description: string;
};

export type BackgroundSkin = {
  id: string;
  category: CategoryId;
  name: string;
  price: number;
  image: string;
  description: string;
};

export const categories: Category[] = [
  { id: "student", label: "학생", icon: "🎒" },
  { id: "royal", label: "왕실", icon: "👑" },
  { id: "job", label: "직업", icon: "💼" },
  { id: "family", label: "가족", icon: "🏡" },
  { id: "battle", label: "전투", icon: "⚔️" },
  { id: "fantasy", label: "판타지", icon: "✨" },
];

// 가격 인상 기준 (rarity별로 다르게 적용)
// Common +20 / Rare +25 / Epic +30 / Legendary +35
export const bunnySkins: BunnySkin[] = [
  {
    id: "basic_bunny",
    category: "student",
    name: "Basic Bunny",
    price: 0,
    image: "/shop/bunny.png",
    rarity: "Common",
    description: "처음부터 함께하는 기본 토끼",
  },

  {
    id: "princess_bunny",
    category: "royal",
    name: "Princess Bunny",
    price: 75,
    image: "/shop/bunnies/royal/princess_bunny.png",
    rarity: "Rare",
    description: "분홍 드레스를 입은 공주 토끼",
  },
  {
    id: "prince_bunny",
    category: "royal",
    name: "Prince Bunny",
    price: 75,
    image: "/shop/bunnies/royal/prince_bunny.png",
    rarity: "Rare",
    description: "작은 왕관을 쓴 왕자 토끼",
  },
  {
    id: "queen_bunny",
    category: "royal",
    name: "Queen Bunny",
    price: 100,
    image: "/shop/bunnies/royal/queen_bunny.png",
    rarity: "Epic",
    description: "우아한 망토를 두른 여왕 토끼",
  },
  {
    id: "king_bunny",
    category: "royal",
    name: "King Bunny",
    price: 100,
    image: "/shop/bunnies/royal/king_bunny.png",
    rarity: "Epic",
    description: "황금 왕관을 쓴 왕 토끼",
  },
  {
    id: "tea_party_bunny",
    category: "royal",
    name: "Tea Party Bunny",
    price: 85,
    image: "/shop/bunnies/royal/tea_party_bunny.png",
    rarity: "Rare",
    description: "왕실 티파티에 초대된 토끼",
  },
  {
    id: "royal_guard_bunny",
    category: "royal",
    name: "Royal Guard Bunny",
    price: 110,
    image: "/shop/bunnies/royal/royal_guard_bunny.png",
    rarity: "Epic",
    description: "궁전을 지키는 근위병 토끼",
  },

  {
    id: "chef_bunny",
    category: "job",
    name: "Chef Bunny",
    price: 65,
    image: "/shop/bunnies/job/chef_bunny.png",
    rarity: "Common",
    description: "맛있는 당근 요리를 만드는 토끼",
  },
  {
    id: "doctor_bunny",
    category: "job",
    name: "Doctor Bunny",
    price: 80,
    image: "/shop/bunnies/job/doctor_bunny.png",
    rarity: "Rare",
    description: "친구들을 돌봐주는 의사 토끼",
  },
  {
    id: "teacher_bunny",
    category: "job",
    name: "Teacher Bunny",
    price: 75,
    image: "/shop/bunnies/job/teacher_bunny.png",
    rarity: "Rare",
    description: "알파벳을 알려주는 선생님 토끼",
  },
  {
    id: "police_bunny",
    category: "job",
    name: "Police Bunny",
    price: 80,
    image: "/shop/bunnies/job/police_bunny.png",
    rarity: "Rare",
    description: "마을의 안전을 지키는 경찰 토끼",
  },
  {
    id: "artist_bunny",
    category: "job",
    name: "Artist Bunny",
    price: 75,
    image: "/shop/bunnies/job/artist_bunny.png",
    rarity: "Rare",
    description: "색연필과 붓을 든 예술가 토끼",
  },
  {
    id: "pilot_bunny",
    category: "job",
    name: "Pilot Bunny",
    price: 105,
    image: "/shop/bunnies/job/pilot_bunny.png",
    rarity: "Epic",
    description: "하늘을 나는 조종사 토끼",
  },

  {
    id: "university_bunny",
    category: "student",
    name: "University Bunny",
    price: 60,
    image: "/shop/bunnies/student/university_bunny.png",
    rarity: "Common",
    description: "멋진 대학생 토끼",
  },
  {
    id: "kindergarten_bunny",
    category: "student",
    name: "Kindergarten Bunny",
    price: 55,
    image: "/shop/bunnies/student/kindergarten_bunny.png",
    rarity: "Common",
    description: "노란 모자를 쓴 유치원 토끼",
  },
  {
    id: "athlete_bunny",
    category: "student",
    name: "Athlete Bunny",
    price: 65,
    image: "/shop/bunnies/student/athlete_bunny.png",
    rarity: "Common",
    description: "늘 활기찬 운동부 토끼",
  },
  {
    id: "library_bunny",
    category: "student",
    name: "Library Bunny",
    price: 75,
    image: "/shop/bunnies/student/library_bunny.png",
    rarity: "Rare",
    description: "조용히 책을 읽는 도서관 토끼",
  },
  {
    id: "music_bunny",
    category: "student",
    name: "Music Bunny",
    price: 80,
    image: "/shop/bunnies/student/music_bunny.png",
    rarity: "Rare",
    description: "음악 시간에 노래하는 토끼",
  },
  {
    id: "graduation_bunny",
    category: "student",
    name: "Graduation Bunny",
    price: 110,
    image: "/shop/bunnies/student/graduation_bunny.png",
    rarity: "Epic",
    description: "졸업 가운을 입은 토끼",
  },

  {
    id: "mom_bunny",
    category: "family",
    name: "Mom Bunny",
    price: 65,
    image: "/shop/bunnies/family/mom_bunny.png",
    rarity: "Common",
    description: "앞치마를 입은 따뜻한 엄마 토끼",
  },
  {
    id: "dad_bunny",
    category: "family",
    name: "Dad Bunny",
    price: 65,
    image: "/shop/bunnies/family/dad_bunny.png",
    rarity: "Common",
    description: "넥타이를 맨 아빠 토끼",
  },
  {
    id: "baby_bunny",
    category: "family",
    name: "Baby Bunny",
    price: 60,
    image: "/shop/bunnies/family/baby_bunny.png",
    rarity: "Common",
    description: "턱받이를 한 아기 토끼",
  },
  {
    id: "sibling_bunny",
    category: "family",
    name: "Sibling Bunny",
    price: 75,
    image: "/shop/bunnies/family/sibling_bunny.png",
    rarity: "Rare",
    description: "친구 같은 형제 토끼",
  },
  {
    id: "grandma_bunny",
    category: "family",
    name: "Grandma Bunny",
    price: 80,
    image: "/shop/bunnies/family/grandma_bunny.png",
    rarity: "Rare",
    description: "언제나 다정한 할머니 토끼",
  },
  {
    id: "grandpa_bunny",
    category: "family",
    name: "Grandpa Bunny",
    price: 85,
    image: "/shop/bunnies/family/grandpa_bunny.png",
    rarity: "Rare",
    description: "따스한 눈빛의 할아버지 토끼",
  },

  {
    id: "knight_bunny",
    category: "battle",
    name: "Knight Bunny",
    price: 100,
    image: "/shop/bunnies/battle/knight_bunny.png",
    rarity: "Epic",
    description: "은빛 갑옷을 입은 기사 토끼",
  },
  {
    id: "archer_bunny",
    category: "battle",
    name: "Archer Bunny",
    price: 90,
    image: "/shop/bunnies/battle/archer_bunny.png",
    rarity: "Rare",
    description: "활을 든 숲속 궁수 토끼",
  },
  {
    id: "hero_bunny",
    category: "battle",
    name: "Hero Bunny",
    price: 110,
    image: "/shop/bunnies/battle/hero_bunny.png",
    rarity: "Epic",
    description: "망토를 두른 용감한 히어로 토끼",
  },
  {
    id: "ninja_bunny",
    category: "battle",
    name: "Ninja Bunny",
    price: 105,
    image: "/shop/bunnies/battle/ninja_bunny.png",
    rarity: "Epic",
    description: "조용히 움직이는 닌자 토끼",
  },
  {
    id: "cavalry_bunny",
    category: "battle",
    name: "Cavalry Bunny",
    price: 95,
    image: "/shop/bunnies/battle/cavalry_bunny.png",
    rarity: "Rare",
    description: "용맹하게 싸우는 기마 토끼",
  },
  {
    id: "dragon_bunny",
    category: "battle",
    name: "Dragon Bunny",
    price: 135,
    image: "/shop/bunnies/battle/dragon_bunny.png",
    rarity: "Legendary",
    description: "용의 기운을 가진 전설 토끼",
  },

  {
    id: "wizard_bunny",
    category: "fantasy",
    name: "Wizard Bunny",
    price: 100,
    image: "/shop/bunnies/fantasy/wizard_bunny.png",
    rarity: "Epic",
    description: "별빛 지팡이를 든 마법사 토끼",
  },
  {
    id: "fairy_bunny",
    category: "fantasy",
    name: "Fairy Bunny",
    price: 105,
    image: "/shop/bunnies/fantasy/fairy_bunny.png",
    rarity: "Epic",
    description: "투명 날개를 가진 요정 토끼",
  },
  {
    id: "dwarf_bunny",
    category: "fantasy",
    name: "Dwarf Bunny",
    price: 125,
    image: "/shop/bunnies/fantasy/dwarf_bunny.png",
    rarity: "Legendary",
    description: "무엇이든 고칠 수 있는 드워프 토끼",
  },
  {
    id: "elf_bunny",
    category: "fantasy",
    name: "Elf Bunny",
    price: 110,
    image: "/shop/bunnies/fantasy/elf_bunny.png",
    rarity: "Epic",
    description: "모든 것을 사랑하는 엘프 토끼",
  },
  {
    id: "angel_bunny",
    category: "fantasy",
    name: "Angel Bunny",
    price: 115,
    image: "/shop/bunnies/fantasy/angel_bunny.png",
    rarity: "Epic",
    description: "작은 천사 날개를 가진 토끼",
  },
  {
    id: "dark_bunny",
    category: "fantasy",
    name: "Dark Bunny",
    price: 90,
    image: "/shop/bunnies/fantasy/dark_bunny.png",
    rarity: "Rare",
    description: "어둠의 마법을 사용하는 다크 토끼",
  },
];

export const backgroundSkins: BackgroundSkin[] = [
  {
    id: "default_bg",
    category: "student",
    name: "기본 옷장 배경",
    price: 0,
    image: "/shop/closet-bg.png",
    description: "처음부터 함께하는 기본 배경",
  },

  {
    id: "student_bg",
    category: "student",
    name: "교실 배경",
    price: 80,
    image: "/shop/backgrounds/student.png",
    description: "영어를 배우는 아늑한 교실",
  },
  {
    id: "royal_bg",
    category: "royal",
    name: "왕실 배경",
    price: 90,
    image: "/shop/backgrounds/royal.png",
    description: "화려한 궁전 속 왕실 분위기",
  },
  {
    id: "job_bg",
    category: "job",
    name: "직업 마을 배경",
    price: 85,
    image: "/shop/backgrounds/job.png",
    description: "다양한 직업이 모인 Job Town",
  },
  {
    id: "family_bg",
    category: "family",
    name: "가족 거실 배경",
    price: 80,
    image: "/shop/backgrounds/family.png",
    description: "따뜻한 우리 가족의 거실",
  },
  {
    id: "battle_bg",
    category: "battle",
    name: "버니 아레나 배경",
    price: 95,
    image: "/shop/backgrounds/battle.png",
    description: "용감한 토끼들의 전투 경기장",
  },
  {
    id: "fantasy_bg",
    category: "fantasy",
    name: "마법의 성 배경",
    price: 100,
    image: "/shop/backgrounds/fantasy.png",
    description: "별빛 가득한 신비로운 마법 세계",
  },
];