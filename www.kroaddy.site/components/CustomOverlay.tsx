// components/CustomOverlay.tsx
import { Location } from "../lib/types";

export const createOverlayContent = (location: Location, overlayId: string, onClose?: () => void) => {
    const closeId = `close-${overlayId}`;
    const expandId = `expand-${overlayId}`;
    const locationId = location.id || location.name;

    return `
    <div class="overlaybox" id="${overlayId}" style="
      position: relative;
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        padding-right: 50px;
      ">
        <div class="boxtitle" style="
          color: #1a1a1a;
          font-size: 16px;
          font-weight: 700;
          flex: 1;
        ">${location.name}</div>
        <button 
          id="${expandId}"
          onclick="
            window.dispatchEvent(new CustomEvent('expandPlace', { detail: '${locationId}' }));
          "
          style="
            background: #3182F6;
            border: none;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(49, 130, 246, 0.3);
            padding: 0;
          "
          onmouseover="this.style.background='#2563EB'; this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(49, 130, 246, 0.4)'"
          onmouseout="this.style.background='#3182F6'; this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(49, 130, 246, 0.3)'"
          title="상세 정보 보기"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <path d="M6 4L10 8L6 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <button 
        id="${closeId}"
        onclick="
          window.dispatchEvent(new CustomEvent('closeOverlay', { detail: '${overlayId}' }));
        "
        style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #999;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
          line-height: 1;
        "
        onmouseover="this.style.background='#f0f0f0'; this.style.color='#333'"
        onmouseout="this.style.background='none'; this.style.color='#999'"
        title="닫기"
      >×</button>
      <div class="body" style="
        display: flex;
        gap: 10px;
        margin-top: 6px;
      ">
        <div class="img" style="
          flex-shrink: 0;
          width: 70px;
          height: 70px;
          border-radius: 6px;
          overflow: hidden;
          background: #f5f5f5;
        ">
          <img 
            src="/logo3.png" 
            alt="${location.name}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
          />
        </div>
        <div class="desc" style="
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        ">
          <div style="
            font-size: 12px;
            color: #666;
            line-height: 1.4;
            margin-bottom: 4px;
          ">${location.address || '주소 정보 없음'}</div>
          ${location.category ? `
            <div style="
              font-size: 11px;
              color: #999;
              margin-top: auto;
            ">${location.category}</div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};
