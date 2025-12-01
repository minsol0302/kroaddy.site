# -*- coding: utf-8 -*-
"""
E_capital_model 학습 스크립트
dfE.csv 데이터를 사용하여 SVD 모델을 학습합니다.
"""

import pandas as pd
import numpy as np
import pickle
import joblib
from datetime import datetime
import warnings
import logging
import os
import sys
warnings.filterwarnings('ignore')

from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split, GridSearchCV, cross_validate
from surprise import accuracy

# 로깅 설정
def setup_logging():
    """로깅 설정: 콘솔과 파일 모두에 로그 출력"""
    # 로그 디렉토리 생성
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)
    
    # 로그 파일명 (타임스탬프 포함)
    timestamp_str = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = os.path.join(log_dir, f'train_{timestamp_str}.log')
    
    # 로거 설정
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # 기존 핸들러 제거 (중복 방지)
    logger.handlers = []
    
    # 파일 핸들러 (상세 로그)
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # 콘솔 핸들러 (간단한 로그)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter('%(message)s')
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    return logger, log_file

# 로깅 초기화
logger, log_file = setup_logging()

# 타임스탬프 출력
timestamp = datetime.now()
logger.info("=" * 80)
logger.info(f"학습 시작 시간: {timestamp}")
logger.info(f"로그 파일: {log_file}")
logger.info("=" * 80)

# ============================================================================
# 1. 데이터 로드 및 검증
# ============================================================================
logger.info("\n[1단계] 데이터 로드 및 검증")
logger.info("-" * 80)

# 데이터 로드
logger.info("데이터 파일 로딩 중: ../preprocessed/dfE.csv")
df = pd.read_csv('../preprocessed/dfE.csv')
logger.info("데이터 로드 완료")

logger.info(f"원본 데이터 크기: {df.shape}")
logger.info(f"고유 사용자 수: {df['userID'].nunique()}")
logger.info(f"고유 아이템 수: {df['itemID'].nunique()}")
logger.info(f"평점 범위: {df['rating'].min():.2f} ~ {df['rating'].max():.2f}")
logger.info(f"평균 평점: {df['rating'].mean():.2f}")

# ============================================================================
# 2. 데이터 전처리
# ============================================================================
logger.info("\n[2단계] 데이터 전처리")
logger.info("-" * 80)

# 2.1 중복 제거
initial_size = len(df)
df = df.drop_duplicates(subset=['userID', 'itemID'], keep='last')
logger.info(f"중복 제거: {initial_size} → {len(df)} 행 ({initial_size - len(df)}개 제거)")

# 2.2 SIDO 결측값 처리
missing_sido = df['SIDO'].isna().sum() + (df['SIDO'] == '').sum()
if missing_sido > 0:
    logger.info(f"SIDO 결측값: {missing_sido}개")
    # itemID 기준으로 가장 빈도 높은 SIDO로 채우기
    sido_mapping = df.groupby('itemID')['SIDO'].apply(
        lambda x: x.mode().iloc[0] if len(x.mode()) > 0 and not pd.isna(x.mode().iloc[0]) else None
    ).to_dict()
    
    def fill_sido(row):
        if pd.isna(row['SIDO']) or row['SIDO'] == '':
            return sido_mapping.get(row['itemID'], None)
        return row['SIDO']
    
    df['SIDO'] = df.apply(fill_sido, axis=1)
    remaining_missing = df['SIDO'].isna().sum() + (df['SIDO'] == '').sum()
    logger.info(f"SIDO 결측값 처리 후: {remaining_missing}개 남음")

# 2.3 Cold Start 완화: 최소 평가 수 필터링
min_user_ratings = 2
min_item_ratings = 2
logger.info(f"Cold Start 필터링 기준: 사용자 최소 {min_user_ratings}개, 아이템 최소 {min_item_ratings}개 평가")

user_counts = df['userID'].value_counts()
item_counts = df['itemID'].value_counts()

df_filtered = df[
    (df['userID'].isin(user_counts[user_counts >= min_user_ratings].index)) &
    (df['itemID'].isin(item_counts[item_counts >= min_item_ratings].index))
]

logger.info(f"Cold Start 필터링: {len(df)} → {len(df_filtered)} 행")
logger.info(f"필터링 후 고유 사용자 수: {df_filtered['userID'].nunique()}")
logger.info(f"필터링 후 고유 아이템 수: {df_filtered['itemID'].nunique()}")

# 사용자별/아이템별 평가 수 분포
user_rating_counts = df_filtered.groupby('userID').size()
item_rating_counts = df_filtered.groupby('itemID').size()

logger.info(f"\n사용자별 평가 수 - 평균: {user_rating_counts.mean():.2f}, 최소: {user_rating_counts.min()}, 최대: {user_rating_counts.max()}")
logger.info(f"아이템별 평가 수 - 평균: {item_rating_counts.mean():.2f}, 최소: {item_rating_counts.min()}, 최대: {item_rating_counts.max()}")

# ============================================================================
# 3. Surprise Dataset 변환
# ============================================================================
logger.info("\n[3단계] Surprise Dataset 변환")
logger.info("-" * 80)

reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(df_filtered[['userID', 'itemID', 'rating']], reader)

logger.info("Dataset 변환 완료")

# ============================================================================
# 4. 하이퍼파라미터 튜닝 (선택사항 - 데이터가 작으면 스킵 가능)
# ============================================================================
logger.info("\n[4단계] 하이퍼파라미터 튜닝")
logger.info("-" * 80)

# 데이터 크기에 따라 그리드 조정
data_size = len(df_filtered)
if data_size < 500:
    # 작은 데이터셋: 간단한 그리드
    logger.info("작은 데이터셋 감지 - 간소화된 그리드 사용")
    param_grid = {
        'n_factors': [50, 100],
        'n_epochs': [20, 50],
        'lr_all': [0.01, 0.05],
        'reg_all': [0.01, 0.1],
        'reg_bu': [0.01, 0.1],
        'reg_bi': [0.01, 0.1]
    }
    cv_folds = 3
else:
    # 큰 데이터셋: 전체 그리드
    param_grid = {
        'n_factors': [50, 100, 200],
        'n_epochs': [10, 50],
        'lr_all': [0.01, 0.1],
        'reg_all': [0.01, 0.1],
        'reg_bu': [0.01, 0.1],
        'reg_bi': [0.01, 0.1]
    }
    cv_folds = 5

logger.info(f"그리드 탐색 시작 (CV={cv_folds})...")
logger.info(f"파라미터 그리드: {param_grid}")
grid = GridSearchCV(
    SVD, 
    param_grid, 
    measures=['RMSE', 'MAE'], 
    cv=cv_folds, 
    n_jobs=-1,
    joblib_verbose=0
)

logger.info("GridSearchCV 실행 중... (시간이 걸릴 수 있습니다)")
grid.fit(data)
logger.info("GridSearchCV 완료")

logger.info(f"\n최적 하이퍼파라미터 (RMSE 기준):")
logger.info(f"  RMSE: {grid.best_score['rmse']:.4f}")
logger.info(f"  MAE: {grid.best_score['mae']:.4f}")
logger.info(f"  파라미터: {grid.best_params['rmse']}")

# ============================================================================
# 5. 최종 모델 학습
# ============================================================================
logger.info("\n[5단계] 최종 모델 학습")
logger.info("-" * 80)

# 최적 하이퍼파라미터로 모델 생성
best_params = grid.best_params['rmse']
logger.info(f"최적 파라미터로 모델 생성: {best_params}")
algo = SVD(
    n_factors=best_params['n_factors'],
    n_epochs=best_params['n_epochs'],
    lr_all=best_params['lr_all'],
    reg_all=best_params['reg_all'],
    reg_bu=best_params['reg_bu'],
    reg_bi=best_params['reg_bi']
)

# Train-Test Split
trainset, testset = train_test_split(data, test_size=0.2, random_state=42)
logger.info(f"Train set 크기: {trainset.n_users} 사용자, {trainset.n_items} 아이템, {trainset.n_ratings} 평가")
logger.info(f"Test set 크기: {len(testset)} 평가")

# 모델 학습
logger.info("모델 학습 중...")
algo.fit(trainset)
logger.info("모델 학습 완료")

# 교차 검증으로 성능 평가
logger.info("\n교차 검증 수행 중...")
cv_results = cross_validate(
    algo=algo, 
    data=data, 
    measures=['RMSE', 'MAE'], 
    cv=5, 
    verbose=False, 
    n_jobs=-1
)

logger.info(f"교차 검증 결과:")
logger.info(f"  평균 RMSE: {cv_results['test_rmse'].mean():.4f} (±{cv_results['test_rmse'].std():.4f})")
logger.info(f"  평균 MAE: {cv_results['test_mae'].mean():.4f} (±{cv_results['test_mae'].std():.4f})")

# ============================================================================
# 6. 테스트셋 평가
# ============================================================================
logger.info("\n[6단계] 테스트셋 평가")
logger.info("-" * 80)

logger.info("테스트셋 예측 수행 중...")
predictions = algo.test(testset)
rmse = accuracy.rmse(predictions, verbose=False)
mae = accuracy.mae(predictions, verbose=False)

logger.info(f"Test RMSE: {rmse:.4f}")
logger.info(f"Test MAE: {mae:.4f}")

# ============================================================================
# 7. 모델 저장
# ============================================================================
logger.info("\n[7단계] 모델 저장")
logger.info("-" * 80)

model_path = 'svd_model_E.pkl'
logger.info(f"모델 저장 중: {model_path}")
with open(model_path, 'wb') as file:
    pickle.dump(algo, file)

logger.info(f"모델 저장 완료: {model_path}")

# ============================================================================
# 8. 추천 품질 평가 (Recall@5)
# ============================================================================
logger.info("\n[8단계] 추천 품질 평가 (Recall@5)")
logger.info("-" * 80)

# 예측 결과를 DataFrame으로 변환
prediction_data = []
for uid, iid, true_r, est, _ in predictions:
    prediction_data.append({
        'userID': uid, 
        'itemID': iid, 
        'true_rating': true_r, 
        'predicted_rating': est
    })

predictions_df = pd.DataFrame(prediction_data)

# SIDO 정보 추가
itemID_to_SIDO = df_filtered.set_index('itemID')['SIDO'].to_dict()
predictions_df['SIDO'] = predictions_df['itemID'].map(itemID_to_SIDO)

# 추천 여부 결정 (평균 평점 기준)
mean_true_rating = predictions_df['true_rating'].mean()
mean_predicted_rating = predictions_df['predicted_rating'].mean()

predictions_df['true_rec'] = (predictions_df['true_rating'] > mean_true_rating).astype(int)
predictions_df['est_rec'] = (predictions_df['predicted_rating'] > mean_predicted_rating).astype(int)

# Recall@5 계산 함수
def recall5_calculator(df):
    df_sorted = df.sort_values(
        by=['userID', 'true_rec', 'predicted_rating'], 
        ascending=[True, False, False]
    )
    
    def calculate_recall_at_k(user_data, k=5):
        total_interest_items = user_data['true_rec'].sum()
        if total_interest_items == 0:
            return 0
        
        recommended_items = user_data['est_rec'].head(k).sum()
        recall_at_k = recommended_items / total_interest_items
        return recall_at_k
    
    recall_at_5_values = df_sorted.groupby('userID').apply(
        lambda x: calculate_recall_at_k(x, k=5)
    )
    
    return recall_at_5_values.mean()

logger.info("Recall@5 계산 중...")
recall_at_5 = recall5_calculator(predictions_df)
logger.info(f"Recall@5: {recall_at_5:.4f}")

# ============================================================================
# 9. 학습 완료
# ============================================================================
end_time = datetime.now()
duration = end_time - timestamp
logger.info("\n" + "=" * 80)
logger.info("학습 완료!")
logger.info(f"시작 시간: {timestamp}")
logger.info(f"완료 시간: {end_time}")
logger.info(f"소요 시간: {duration}")
logger.info(f"로그 파일: {log_file}")
logger.info("=" * 80)

