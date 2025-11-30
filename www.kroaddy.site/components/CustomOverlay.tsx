// components/CustomOverlay.tsx
import { Location } from "../lib/types";

export const createOverlayContent = (location: Location, overlayId: string) => {
    const closeId = `close-${overlayId}`;
    const expandId = `expand-${overlayId}`;
    const locationId = location.id || location.name;

    return `
    <div class="custom-overlay-wrap" id="${overlayId}">
      <div class="info">
        <div class="title">
          ${location.name}
          <div class="close" id="${closeId}" title="닫기"></div>
          <button 
            id="${expandId}"
            class="expand-btn"
            title="상세 정보 보기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <path d="M6 4L10 8L6 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="body">
          <div class="img">
            <img src="/logo3.png" width="73" height="70" alt="${location.name}">
          </div>
          <div class="desc">
            <div class="ellipsis">${location.address || '주소 정보 없음'}</div>
            ${location.category ? `<div class="jibun ellipsis">${location.category}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
};
