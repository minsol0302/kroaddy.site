// lib/types.ts
export interface Location {
    id: string;
    name: string;
    address: string;
    phone?: string;
    category?: string;
    lat: number;
    lng: number;
    placeUrl?: string;
    imageUrl?: string;
  }
  
  // 여행 일정 전체
  export interface TravelPlan {
    id?: string;
    title: string;
    description?: string;
    locations: Location[];
    createdAt?: string;
  }