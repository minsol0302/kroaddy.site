from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from fake_useragent import UserAgent
import json
import time


def crawl_naver_news():
    """
    네이버 뉴스 도로/교통 섹션에서 뉴스 정보를 크롤링하는 함수
    
    Returns:
        list: 뉴스 정보가 담긴 딕셔너리 리스트
    """
    url = "https://news.naver.com/breakingnews/section/103/240"
    
    # fake-useragent로 랜덤 User-Agent 생성
    ua = UserAgent()
    
    # Chrome 옵션 설정
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 브라우저 창 숨김
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument(f'user-agent={ua.random}')  # 랜덤 User-Agent
    
    driver = None
    
    try:
        # WebDriver 초기화
        driver = webdriver.Chrome(options=chrome_options)
        
        # 페이지 로드
        print("페이지 로딩 중...")
        driver.get(url)
        
        # 페이지 로딩 대기 (뉴스 리스트가 로드될 때까지)
        wait = WebDriverWait(driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "sa_list")))
        
        # 추가 로딩 시간 (동적 콘텐츠 완전 로드)
        time.sleep(3)
        
        # 스크롤하여 lazy loading 콘텐츠 로드
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
        time.sleep(2)
        
        news_list = []
        
        # 뉴스 리스트 찾기
        news_items = driver.find_elements(By.CSS_SELECTOR, "ul.sa_list > li.sa_item")
        
        print(f"총 {len(news_items)}개의 뉴스를 찾았습니다.\n")
        
        for idx, item in enumerate(news_items, 1):
            try:
                # 기사 제목 추출 (sa_text_strong 클래스)
                try:
                    title_elem = item.find_element(By.CSS_SELECTOR, "strong.sa_text_strong")
                    title = title_elem.text.strip()
                except:
                    title = "N/A"
                
                # 언론사 추출 (sa_text_press 클래스)
                try:
                    press_elem = item.find_element(By.CSS_SELECTOR, "div.sa_text_press")
                    press = press_elem.text.strip()
                except:
                    press = "N/A"
                
                # 날짜/시간 추출 (sa_text_datetime 클래스)
                try:
                    datetime_elem = item.find_element(By.CSS_SELECTOR, "div.sa_text_datetime")
                    datetime = datetime_elem.text.strip()
                except:
                    datetime = "N/A"
                
                # 썸네일 이미지 추출 (_LAZY_LOADING 클래스)
                try:
                    # 여러 가능한 선택자 시도
                    img_elem = None
                    try:
                        img_elem = item.find_element(By.CSS_SELECTOR, "img._LAZY_LOADING")
                    except:
                        try:
                            img_elem = item.find_element(By.CSS_SELECTOR, "img._LAZY_LOADING_INIT_HIDE")
                        except:
                            img_elem = item.find_element(By.CSS_SELECTOR, "div.sa_thumb img")
                    
                    if img_elem:
                        # src 또는 data-src 속성 확인
                        thumbnail = img_elem.get_attribute("src")
                        if not thumbnail or thumbnail == "" or "data:image" in thumbnail:
                            thumbnail = img_elem.get_attribute("data-src")
                        if not thumbnail:
                            thumbnail = img_elem.get_attribute("data-lazy-src")
                    else:
                        thumbnail = "N/A"
                except:
                    thumbnail = "N/A"
                
                # 기사 URL 추출
                try:
                    link_elem = item.find_element(By.CSS_SELECTOR, "a.sa_text_title")
                    article_url = link_elem.get_attribute("href")
                except:
                    article_url = "N/A"
                
                # 기사 요약 추출
                try:
                    summary_elem = item.find_element(By.CSS_SELECTOR, "div.sa_text_lede")
                    summary = summary_elem.text.strip()
                except:
                    summary = "N/A"
                
                # 뉴스 정보 딕셔너리 생성
                news_info = {
                    "index": idx,
                    "title": title,
                    "press": press,
                    "datetime": datetime,
                    "thumbnail": thumbnail,
                    "article_url": article_url,
                    "summary": summary
                }
                
                news_list.append(news_info)
                
            except Exception as e:
                print(f"Error parsing news {idx}: {e}")
                continue
        
        return news_list
        
    except Exception as e:
        print(f"크롤링 중 오류 발생: {e}")
        return []
        
    finally:
        # WebDriver 종료
        if driver:
            driver.quit()
            print("\n브라우저 종료 완료")


def main():
    """메인 함수"""
    print("네이버 뉴스 도로/교통 섹션 크롤링 시작...\n")
    print("=" * 60)
    
    # 크롤링 실행
    news_data = crawl_naver_news()
    
    if news_data:
        # JSON 형태로 출력 (한글 깨짐 방지)
        print("\n" + "=" * 60)
        print("크롤링 결과:\n")
        print(json.dumps(news_data, ensure_ascii=False, indent=2))
        print("\n" + "=" * 60)
        print(f"총 {len(news_data)}개 뉴스 크롤링 완료!")
    else:
        print("크롤링 실패 또는 데이터 없음")


if __name__ == "__main__":
    main()

