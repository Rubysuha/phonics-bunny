import { supabase } from "@/lib/supabase";

/*
  Home(대시보드)에 적용한 토끼와 배경

  profiles 테이블의 home_bunny_id / home_background_id 에 저장.
  아직 그 컬럼이 없으면 저장이 실패하므로, 같은 값을 이 기기의
  localStorage 에도 넣어 두고 불러올 때 대신 사용한다.
*/
export type HomeLook = {
  bunnyId: string;
  backgroundId: string;
};

/* Home 적용이 바뀌었을 때 window 에 보내는 이벤트 이름 */
export const HOME_LOOK_EVENT = "home-look-updated";

const storageKey = (userId: string) =>
  `phonics-bunny-home-look:${userId}`;

function readLocal(userId: string): HomeLook | null {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      typeof parsed?.bunnyId === "string" &&
      typeof parsed?.backgroundId === "string"
    ) {
      return parsed;
    }
  } catch {
    /* 저장소를 쓸 수 없는 환경이면 없는 것으로 취급 */
  }

  return null;
}

function writeLocal(userId: string, look: HomeLook | null) {
  try {
    if (look) {
      window.localStorage.setItem(
        storageKey(userId),
        JSON.stringify(look)
      );
    } else {
      window.localStorage.removeItem(storageKey(userId));
    }
  } catch {
    /* 무시 */
  }
}

/* 적용한 것이 없으면 null */
export async function loadHomeLook(
  userId: string
): Promise<HomeLook | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("home_bunny_id, home_background_id")
    .eq("id", userId)
    .single();

  /* 컬럼이 없거나 조회 실패 → 이 기기에 저장된 값 */
  if (error) {
    return readLocal(userId);
  }

  if (data?.home_bunny_id && data?.home_background_id) {
    return {
      bunnyId: data.home_bunny_id,
      backgroundId: data.home_background_id,
    };
  }

  return null;
}

/*
  look 이 null 이면 적용 해제 (기본 Home 으로)
  반환값: 계정(DB)에 저장됐는지 여부. false 면 이 기기에만 저장된 것
*/
export async function saveHomeLook(
  userId: string,
  look: HomeLook | null
): Promise<boolean> {
  writeLocal(userId, look);

  /* 바깥 배경(AppShell)이 바로 바뀌도록 알림 */
  window.dispatchEvent(new Event(HOME_LOOK_EVENT));

  const { error } = await supabase
    .from("profiles")
    .update({
      home_bunny_id: look?.bunnyId ?? null,
      home_background_id: look?.backgroundId ?? null,
    })
    .eq("id", userId);

  if (error) {
    console.warn(
      "Home 적용을 계정에 저장하지 못해 이 기기에만 저장했어요:",
      error.message
    );

    return false;
  }

  return true;
}
