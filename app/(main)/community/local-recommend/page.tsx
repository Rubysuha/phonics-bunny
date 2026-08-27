"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  MagnifyingGlass,
  MapPin,
  PencilSimple,
  Sparkle,
  GraduationCap,
  BookOpen,
  Books,
  Coffee,
} from "@phosphor-icons/react";
import styles from "./local-recommend.module.css";

type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

type KakaoMap = {
  setBounds: (bounds: KakaoLatLngBounds) => void;
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  panTo: (latlng: KakaoLatLng) => void;
};

type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
};

type KakaoLatLngBounds = {
  extend: (latlng: KakaoLatLng) => void;
};

type KakaoPlacesSearchOptions = {
  location?: KakaoLatLng;
  radius?: number;
};

type KakaoPlacesService = {
  keywordSearch: (
    keyword: string,
    callback: (data: KakaoPlace[], status: string) => void,
    options?: KakaoPlacesSearchOptions
  ) => void;
};

type KakaoMapsNamespace = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number | string, lng: number | string) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number }
  ) => KakaoMap;
  Marker: new (options: {
    map: KakaoMap;
    position: KakaoLatLng;
  }) => KakaoMarker;
  event: {
    addListener: (
      target: KakaoMarker,
      type: string,
      handler: () => void
    ) => void;
  };
  services: {
    Places: new () => KakaoPlacesService;
    Status: { OK: string };
  };
};

declare global {
  interface Window {
    kakao: {
      maps: KakaoMapsNamespace;
    };
  }
}

type PlaceCategory =
  | "all"
  | "kindergarten"
  | "academy"
  | "library"
  | "bookcafe";

type KakaoPlace = {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  distance: string;
  x: string;
  y: string;
};

const categories: {
  id: PlaceCategory;
  label: string;
  icon: React.ElementType;
  keyword: string;
}[] = [
  { id: "all", label: "전체", icon: Sparkle, keyword: "영어학원" },
  { id: "kindergarten", label: "영어유치원", icon: GraduationCap, keyword: "영어유치원" },
  { id: "academy", label: "영어학원", icon: BookOpen, keyword: "영어학원" },
  { id: "library", label: "도서관", icon: Books, keyword: "영어 도서관" },
  { id: "bookcafe", label: "영어북카페", icon: Coffee, keyword: "영어 북카페" },
];

export default function LocalRecommendPage() {
  const router = useRouter();

  const mapRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);

  const [activeCategory, setActiveCategory] = useState<PlaceCategory>("academy");
  const [keyword, setKeyword] = useState("광진구 영어학원");
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPlace =
    places.find((place) => place.id === selectedPlaceId) || places[0];

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const searchPlaces = (searchKeyword: string, center?: KakaoLatLng) => {
    if (!window.kakao || !kakaoMapRef.current) return;

    const kakaoMap = kakaoMapRef.current;
    const trimmedKeyword = searchKeyword.trim();

    if (!trimmedKeyword) {
      alert("검색어를 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    const placesService = new window.kakao.maps.services.Places();

    const searchOptions = center
      ? {
          location: center,
          radius: 3000,
        }
      : {};

    placesService.keywordSearch(
      trimmedKeyword,
      (data: KakaoPlace[], status: string) => {
        setIsLoading(false);

        if (status !== window.kakao.maps.services.Status.OK) {
          clearMarkers();
          setPlaces([]);
          setSelectedPlaceId("");
          return;
        }

        clearMarkers();

        const bounds = new window.kakao.maps.LatLngBounds();

        data.forEach((place) => {
          const position = new window.kakao.maps.LatLng(place.y, place.x);

          const marker = new window.kakao.maps.Marker({
            map: kakaoMap,
            position,
          });

          window.kakao.maps.event.addListener(marker, "click", () => {
            setSelectedPlaceId(place.id);
            kakaoMap.panTo(position);
          });

          markersRef.current.push(marker);
          bounds.extend(position);
        });

        setPlaces(data);
        setSelectedPlaceId(data[0]?.id ?? "");
        kakaoMap.setBounds(bounds);
      },
      searchOptions
    );
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const scriptId = "kakao-map-script";

    const loadMap = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const center = new window.kakao.maps.LatLng(37.5385, 127.0823);

        const map = new window.kakao.maps.Map(mapRef.current, {
          center,
          level: 5,
        });

        kakaoMapRef.current = map;
        setIsMapReady(true);
      });
    };

    if (window.kakao && window.kakao.maps) {
      loadMap();
      return;
    }

    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener("load", loadMap);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = loadMap;
    script.onerror = () => {
      alert("카카오맵 스크립트를 불러오지 못했어요.");
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isMapReady) return;
    searchPlaces(keyword);
  }, [isMapReady]);

  useEffect(() => {
    if (!selectedPlace || !kakaoMapRef.current || !window.kakao) return;

    const moveLatLng = new window.kakao.maps.LatLng(
      selectedPlace.y,
      selectedPlace.x
    );

    kakaoMapRef.current.panTo(moveLatLng);
  }, [selectedPlace]);

  const handleCategoryClick = (category: (typeof categories)[number]) => {
    setActiveCategory(category.id);

    const nextKeyword = `광진구 ${category.keyword}`;

    setKeyword(nextKeyword);
    searchPlaces(nextKeyword);
  };

  const handleSearch = () => {
    searchPlaces(keyword);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("현재 위치를 사용할 수 없는 브라우저예요.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!window.kakao || !kakaoMapRef.current) return;

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const currentPosition = new window.kakao.maps.LatLng(lat, lng);

        kakaoMapRef.current.setCenter(currentPosition);
        kakaoMapRef.current.setLevel(4);

        const selectedCategory =
          categories.find((category) => category.id === activeCategory) ||
          categories[2];

        const nextKeyword = selectedCategory.keyword;

        setKeyword(nextKeyword);
        searchPlaces(nextKeyword, currentPosition);
      },
      () => {
        alert("현재 위치 권한을 허용해야 사용할 수 있어요.");
      }
    );
  };

  const handleWriteQuestion = () => {
    if (!selectedPlace) {
      router.push("/community/write?category=local-recommended");
      return;
    }

    router.push(
      `/community/write?category=local-recommended&place=${encodeURIComponent(
        selectedPlace.place_name
      )}&address=${encodeURIComponent(
        selectedPlace.road_address_name || selectedPlace.address_name
      )}`
    );
  };

  return (
    <section className={styles.page}>
      <button
        className={styles.backButton}
        onClick={() => router.push("/community")}
      >
        <CaretLeft size={20} weight="bold" />
      </button>

      <div className={styles.headerCard}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>
            <MapPin size={24} weight="bold" />
          </div>

          <div>
            <span className={styles.eyebrow}>KAKAO MAP COMMUNITY</span>
            <h1>우리 동네 영어 추천</h1>
            <p>
              카카오 지도에서 주변 영어학원, 영어유치원, 영어 프로그램을 확인해요.
            </p>
          </div>
        </div>

        <button className={styles.writeButton} onClick={handleWriteQuestion}>
          <PencilSimple size={16} weight="bold" />
          질문 남기기
        </button>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <MagnifyingGlass size={17} weight="bold" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="영어학원, 영어유치원, 지역명을 검색해 보세요."
          />
        </div>

        <button className={styles.locationButton} onClick={handleCurrentLocation}>
          <MapPin size={16} weight="bold" />
          현재 위치 기준
        </button>
      </div>

      <div className={styles.categoryRow}>
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${
                activeCategory === category.id ? styles.activeCategory : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              <Icon size={14} weight="bold" />
              {category.label}
            </button>
          );
        })}
      </div>

      <div className={styles.content}>
        <aside className={styles.listPanel}>
          <div className={styles.panelHeader}>
            <h2>주변 영어 장소</h2>
            <span>{places.length}곳</span>
          </div>

          <div className={styles.placeList}>
            {isLoading ? (
              <div className={styles.emptyBox}>검색 중...</div>
            ) : places.length === 0 ? (
              <div className={styles.emptyBox}>검색 결과가 없어요.</div>
            ) : (
              places.map((place) => (
                <button
                  key={place.id}
                  className={`${styles.placeCard} ${
                    selectedPlace?.id === place.id ? styles.selectedCard : ""
                  }`}
                  onClick={() => setSelectedPlaceId(place.id)}
                >
                  <div className={styles.placeTop}>
                    <div>
                      <strong>{place.place_name}</strong>
                      <p>{place.road_address_name || place.address_name}</p>
                    </div>

                    {place.distance && <em>{place.distance}m</em>}
                  </div>

                  <div className={styles.ratingRow}>
                    <span>카카오맵 장소</span>
                    {place.phone && <span>{place.phone}</span>}
                  </div>

                  <p className={styles.description}>
                    {place.category_name || "영어 관련 장소"}
                  </p>

                  <div className={styles.tagRow}>
                    <span>학부모 후기 연결 예정</span>
                    <span>질문 가능</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className={styles.mapPanel}>
          <div className={styles.mapBox}>
            <div ref={mapRef} className={styles.realMap} />
          </div>

          {selectedPlace && (
            <section className={styles.detailBox}>
              <div>
                <h2>{selectedPlace.place_name}</h2>
                <p>
                  {selectedPlace.road_address_name || selectedPlace.address_name}
                </p>
              </div>

              <div className={styles.detailStats}>
                <span>카카오맵</span>
                {selectedPlace.phone && <span>{selectedPlace.phone}</span>}
                {selectedPlace.distance && <span>{selectedPlace.distance}m</span>}
              </div>

              <div className={styles.actionRow}>
                <button
                  onClick={() => window.open(selectedPlace.place_url, "_blank")}
                >
                  상세 보기
                </button>

                <button onClick={handleWriteQuestion}>관심 질문</button>

                <button
                  onClick={() => window.open(selectedPlace.place_url, "_blank")}
                >
                  길찾기
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </section>
  );
}