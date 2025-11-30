import pandas as pd
import joblib
from surprise import SVD, Dataset, Reader

class RecommendationModel:
    def __init__(self, model_path: str, preprocessed_csv: str):
        # 모델 로드
        self.model = joblib.load(model_path)
        
        # 전처리된 데이터 로드
        self.df = pd.read_csv(preprocessed_csv)
        
        # 사용자-아이템 매트릭스 준비
        self.user_item_matrix = self.df.pivot_table(
            index='userID', columns='itemID', values='rating'
        ).fillna(0)
        
        # SIDO 정보
        self.item_sido_map = self.df.set_index('itemID')['SIDO'].to_dict()
        
        # Surprise dataset 준비
        reader = Reader(rating_scale=(1,5))
        self.surprise_data = Dataset.load_from_df(
            self.df[['userID', 'itemID', 'rating']], reader
        )

    def recommend_for_user(self, user_id: str, top_n: int = 5):
        if user_id not in self.user_item_matrix.index:
            return []

        user_ratings = self.user_item_matrix.loc[user_id]
        # 이미 방문한 아이템 제외
        visited = set(user_ratings[user_ratings != 0].index)
        all_items = list(self.user_item_matrix.columns)
        candidates = [i for i in all_items if i not in visited]

        predictions = []
        for item in candidates:
            pred = self.model.predict(user_id, item).est
            predictions.append((item, pred))

        # predicted_rating 기준 내림차순 정렬 후 상위 top_n 반환
        predictions.sort(key=lambda x: x[1], reverse=True)
        return predictions[:top_n]
