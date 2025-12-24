import pandas as pd
import joblib
import logging
from surprise import SVD, Dataset, Reader

# 로거 설정
logger = logging.getLogger(__name__)

class RecommendationModel:
    def __init__(self, model_path: str, preprocessed_csv: str):
        logger.info(f"[모델 초기화 시작] 모델 경로: {model_path}, 데이터 경로: {preprocessed_csv}")
        
        # 모델 로드
        logger.info(f"[모델 로드] 모델 파일 로딩 중: {model_path}")
        self.model = joblib.load(model_path)
        logger.info("[모델 로드 완료] SVD 모델이 성공적으로 로드되었습니다")
        
        # 전처리된 데이터 로드
        logger.info(f"[데이터 로드] 전처리된 데이터 로딩 중: {preprocessed_csv}")
        self.df = pd.read_csv(preprocessed_csv)
        logger.info(f"[데이터 로드 완료] 데이터 크기: {self.df.shape[0]}행, {self.df.shape[1]}열")
        logger.info(f"[데이터 통계] 고유 사용자 수: {self.df['userID'].nunique()}, 고유 아이템 수: {self.df['itemID'].nunique()}")
        
        # 사용자-아이템 매트릭스 준비
        logger.info("[데이터 전처리] 사용자-아이템 매트릭스 생성 중...")
        self.user_item_matrix = self.df.pivot_table(
            index='userID', columns='itemID', values='rating'
        ).fillna(0)
        logger.info(f"[데이터 전처리 완료] 매트릭스 크기: {self.user_item_matrix.shape[0]} 사용자 x {self.user_item_matrix.shape[1]} 아이템")
        
        # SIDO 정보
        self.item_sido_map = self.df.set_index('itemID')['SIDO'].to_dict()
        logger.info(f"[SIDO 매핑] {len(self.item_sido_map)}개 아이템의 SIDO 정보 로드 완료")
        
        # Surprise dataset 준비
        reader = Reader(rating_scale=(1,5))
        self.surprise_data = Dataset.load_from_df(
            self.df[['userID', 'itemID', 'rating']], reader
        )
        logger.info("[초기화 완료] RecommendationModel이 성공적으로 초기화되었습니다")

    def recommend_for_user(self, user_id: str, top_n: int = 5):
        logger.info(f"[추천 요청] userID: {user_id}, topN: {top_n}")
        
        if user_id not in self.user_item_matrix.index:
            logger.warning(f"[추천 실패] 사용자를 찾을 수 없음: {user_id}")
            return []

        user_ratings = self.user_item_matrix.loc[user_id]
        # 이미 방문한 아이템 제외
        visited = set(user_ratings[user_ratings != 0].index)
        all_items = list(self.user_item_matrix.columns)
        candidates = [i for i in all_items if i not in visited]
        
        logger.info(f"[추천 후보] 사용자 {user_id}: 방문한 아이템 {len(visited)}개, 후보 아이템 {len(candidates)}개")

        predictions = []
        logger.debug(f"[예측 시작] {len(candidates)}개 아이템에 대한 예측 수행 중...")
        for item in candidates:
            pred = self.model.predict(user_id, item).est
            predictions.append((item, pred))

        # predicted_rating 기준 내림차순 정렬 후 상위 top_n 반환
        predictions.sort(key=lambda x: x[1], reverse=True)
        result = predictions[:top_n]
        
        logger.info(f"[추천 완료] userID: {user_id}, 추천 아이템 수: {len(result)}개")
        if result:
            logger.info(f"[추천 결과] 상위 {min(top_n, len(result))}개: {[(item, round(pred, 3)) for item, pred in result]}")
        
        return result
