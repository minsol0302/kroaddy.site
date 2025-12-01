const SERVICE_KEY = process.env.NEXT_PUBLIC_TOUR_API_ENCODDING_KEY;
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

// 장소명 → contentId 조회
export async function searchContentId(keyword: string) {
  const url =
    `${BASE_URL}/searchKeyword2` +
    `?serviceKey=${SERVICE_KEY}` +
    `&MobileOS=ETC&MobileApp=TestApp` +
    `&keyword=${encodeURIComponent(keyword)}` +
    `&_type=json`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.response?.body?.items?.item) return null;

  const item = data.response.body.items.item[0];
  return item.contentid;
}

// contentId → 이미지 조회
export async function fetchTourImages(contentId: string) {
  // subImageYN 제거 → INVALID_REQUEST_PARAMETER_ERROR 해결
  const url =
    `${BASE_URL}/detailImage2` +
    `?serviceKey=${SERVICE_KEY}` +
    `&MobileOS=ETC&MobileApp=TestApp` +
    `&contentId=${contentId}` +
    `&imageYN=Y` +
    `&_type=json`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.response?.body?.items?.item) return [];

  const items = data.response.body.items.item;

  // originimgurl 또는 firstimage2 fallback
  return items.map((img: any) => img.originimgurl || img.smallimageurl || '');
}
