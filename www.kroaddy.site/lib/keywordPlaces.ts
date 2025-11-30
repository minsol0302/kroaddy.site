// lib/keywordPlaces.ts
import { Location } from "./types";

// 키워드별로 미리 정의된 장소 목록
// 좌표는 사용자가 직접 수정한 정확한 값으로 업데이트됨
// KakaoMap.tsx에서 이 파일의 좌표를 직접 사용합니다.
export const keywordPlaceMap: Record<string, Location[]> = {
  '근처': [
    {
      id: 'place1',
      name: '경복궁',
      address: '서울특별시 종로구 사직로 161',
      lat: 37.579617,
      lng: 126.977041
    },
    {
      id: 'place2',
      name: '청계천',
      address: '서울특별시 종로구 청계천로',
      lat: 37.569235,
      lng: 126.978653
    },
    {
      id: 'place10',
      name: '광장시장',
      address: '서울특별시 종로구 창경궁로 88',
      lat: 37.570326,
      lng: 126.999629
    },
    {
      id: 'place3',
      name: '명동대성당',
      address: '서울특별시 중구 명동길 74',
      lat: 37.563929,
      lng: 126.987181
    },
    {
      id: 'place4',
      name: '꽃밥에 피다 북촌 친환경 그로서란트',
      address: '서울특별시 종로구 계동길 37',
      lat: 37.581944,
      lng: 126.985139
    },
    {
      id: 'place5',
      name: '비건 인사 채식당',
      address: '서울특별시 종로구 인사동길 35',
      lat: 37.574969,
      lng: 126.988679
    },
    {
      id: 'place6',
      name: '채식요리전문점 오세계향',
      address: '서울특별시 종로구 인사동길 12',
      lat: 37.574799,
      lng: 126.985289
    },
    {
      id: 'place7',
      name: '카페 수달',
      address: '서울특별시 종로구 계동길 5',
      lat: 37.577196,
      lng: 126.984624
    },
    {
      id: 'place9',
      name: '청수당',
      address: '서울특별시 종로구 계동길 37-4',
      lat: 37.574070,
      lng: 126.989837

    }
  ]
};

