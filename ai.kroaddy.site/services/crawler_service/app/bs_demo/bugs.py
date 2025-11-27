import requests
from bs4 import BeautifulSoup
import json


def crawl_bugs_chart():
    """
    벅스 실시간 차트에서 곡 정보를 크롤링하는 함수
    
    Returns:
        list: 곡 정보가 담긴 딕셔너리 리스트
    """
    url = "https://music.bugs.co.kr/chart/track/realtime/total"
    
    # User-Agent 헤더 추가 (크롤링 차단 방지)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # 웹페이지 요청
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # HTTP 에러 체크
        
        # BeautifulSoup으로 HTML 파싱
        soup = BeautifulSoup(response.text, 'lxml')
        
        # 차트 테이블 찾기
        chart_list = soup.select('table.list.trackList.byChart tbody tr')
        
        songs = []
        
        for idx, track in enumerate(chart_list, 1):
            try:
                # 제목 추출 (title 클래스)
                title_elem = track.select_one('p.title a')
                title = title_elem.text.strip() if title_elem else "N/A"
                
                # 아티스트 추출 (artist 클래스)
                artist_elem = track.select_one('p.artist a')
                artist = artist_elem.text.strip() if artist_elem else "N/A"
                
                # 앨범 추출 (album 클래스)
                album_elem = track.select_one('a.album')
                album = album_elem.text.strip() if album_elem else "N/A"
                
                # 곡 정보 딕셔너리 생성
                song_info = {
                    "rank": idx,
                    "title": title,
                    "artist": artist,
                    "album": album
                }
                
                songs.append(song_info)
                
            except Exception as e:
                print(f"Error parsing track {idx}: {e}")
                continue
        
        return songs
        
    except requests.RequestException as e:
        print(f"Request error: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []


def main():
    """메인 함수"""
    print("벅스 실시간 차트 크롤링 시작...\n")
    
    # 차트 크롤링 실행
    chart_data = crawl_bugs_chart()
    
    if chart_data:
        # JSON 형태로 출력 (한글 깨짐 방지)
        print(json.dumps(chart_data, ensure_ascii=False, indent=2))
        print(f"\n총 {len(chart_data)}곡 크롤링 완료!")
    else:
        print("크롤링 실패 또는 데이터 없음")


if __name__ == "__main__":
    main()

