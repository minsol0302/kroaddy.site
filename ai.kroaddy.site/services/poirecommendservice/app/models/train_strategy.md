# E_capital_model 학습 전략

## 1. 데이터 분석 및 검증

### 1.1 데이터 구조 확인
- **userID**: 사용자 식별자 (e000008, e000027 등)
- **itemID**: 장소명 (일산 호수공원, 자라섬 등)
- **rating**: 평점 (1.0 ~ 5.0)
- **SIDO**: 시도 정보 (경기, 서울, 인천 등, 일부 빈 값 존재)

### 1.2 데이터 품질 검증
```python
# 필수 검증 항목
1. 중복 데이터 확인 및 처리
2. 결측값 확인 (SIDO 일부 빈 값)
3. rating 범위 검증 (1-5 사이)
4. 사용자별 최소 평가 수 확인 (Cold Start 문제)
5. 아이템별 최소 평가 수 확인
```

## 2. 데이터 전처리 전략

### 2.1 필수 전처리
```python
# 1. 중복 제거 (동일 userID-itemID 조합)
df = df.drop_duplicates(subset=['userID', 'itemID'], keep='last')

# 2. SIDO 결측값 처리
# 옵션 A: itemID 기준으로 가장 빈도 높은 SIDO로 채우기
# 옵션 B: 빈 값 제거 (권장하지 않음)

# 3. rating 정규화 (필요시)
# 현재 rating이 1-5 범위이므로 정규화 불필요

# 4. Cold Start 문제 완화
# 최소 평가 수가 적은 사용자/아이템 필터링
min_user_ratings = 2  # 사용자당 최소 2개 평가
min_item_ratings = 2  # 아이템당 최소 2개 평가
```

### 2.2 데이터 분포 확인
```python
# 사용자별 평가 수 분포
user_rating_counts = df.groupby('userID').size()
print(f"평균 평가 수: {user_rating_counts.mean()}")
print(f"최소 평가 수: {user_rating_counts.min()}")
print(f"최대 평가 수: {user_rating_counts.max()}")

# 아이템별 평가 수 분포
item_rating_counts = df.groupby('itemID').size()
print(f"평균 평가 수: {item_rating_counts.mean()}")
print(f"최소 평가 수: {item_rating_counts.min()}")
```

## 3. 모델 학습 전략

### 3.1 단계별 학습 프로세스

#### Step 1: 데이터 로드 및 기본 검증
```python
import pandas as pd
import numpy as np
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split, GridSearchCV, cross_validate
import pickle
import joblib

# 데이터 로드
df = pd.read_csv('../preprocessed/dfE.csv')

# 기본 검증
print(f"데이터 크기: {df.shape}")
print(f"고유 사용자 수: {df['userID'].nunique()}")
print(f"고유 아이템 수: {df['itemID'].nunique()}")
print(f"평점 범위: {df['rating'].min()} ~ {df['rating'].max()}")
```

#### Step 2: 데이터 전처리
```python
# 중복 제거
df = df.drop_duplicates(subset=['userID', 'itemID'], keep='last')

# SIDO 결측값 처리 (itemID 기준으로 가장 빈도 높은 SIDO로 채우기)
sido_mapping = df.groupby('itemID')['SIDO'].apply(lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else None).to_dict()
df['SIDO'] = df.apply(lambda row: sido_mapping.get(row['itemID'], row['SIDO']) if pd.isna(row['SIDO']) or row['SIDO'] == '' else row['SIDO'], axis=1)

# Cold Start 완화: 최소 평가 수 필터링
min_user_ratings = 2
min_item_ratings = 2

user_counts = df['userID'].value_counts()
item_counts = df['itemID'].value_counts()

df_filtered = df[
    (df['userID'].isin(user_counts[user_counts >= min_user_ratings].index)) &
    (df['itemID'].isin(item_counts[item_counts >= min_item_ratings].index))
]

print(f"필터링 후 데이터 크기: {df_filtered.shape}")
```

#### Step 3: Surprise Dataset 변환
```python
# Reader 설정 (평점 범위: 1-5)
reader = Reader(rating_scale=(1, 5))

# Dataset 생성
data = Dataset.load_from_df(df_filtered[['userID', 'itemID', 'rating']], reader)
```

#### Step 4: 하이퍼파라미터 튜닝 (GridSearchCV)
```python
# 하이퍼파라미터 그리드 설정
param_grid = {
    'n_factors': [50, 100, 200],      # 잠재 요인 수
    'n_epochs': [10, 50],              # 학습 에포크 수
    'lr_all': [0.01, 0.1],             # 학습률
    'reg_all': [0.01, 0.1],            # 전체 정규화 계수
    'reg_bu': [0.01, 0.1],             # 사용자 편향 정규화
    'reg_bi': [0.01, 0.1]              # 아이템 편향 정규화
}

# GridSearchCV 실행
grid = GridSearchCV(
    SVD, 
    param_grid, 
    measures=['RMSE', 'MAE'], 
    cv=5,                              # 5-fold 교차 검증
    n_jobs=-1,                         # 병렬 처리
    joblib_verbose=10
)

grid.fit(data)

# 최적 하이퍼파라미터 출력
print(f"Best RMSE: {grid.best_score['rmse']}")
print(f"Best MAE: {grid.best_score['mae']}")
print(f"Best Params: {grid.best_params['rmse']}")
```

#### Step 5: 최종 모델 학습
```python
# 최적 하이퍼파라미터로 모델 생성
best_params = grid.best_params['rmse']
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

# 모델 학습
algo.fit(trainset)

# 교차 검증으로 성능 평가
cv_results = cross_validate(
    algo=algo, 
    data=data, 
    measures=['RMSE', 'MAE'], 
    cv=10, 
    verbose=True, 
    n_jobs=-1
)

print(f"평균 RMSE: {cv_results['test_rmse'].mean()}")
print(f"평균 MAE: {cv_results['test_mae'].mean()}")
```

#### Step 6: 모델 저장
```python
# 모델 저장
model_path = 'svd_model_E.pkl'
with open(model_path, 'wb') as file:
    pickle.dump(algo, file)

# 또는 joblib 사용
joblib.dump(algo, model_path)

print(f"모델 저장 완료: {model_path}")
```

## 4. 평가 및 검증 전략

### 4.1 예측 성능 평가
```python
# 테스트셋 예측
predictions = algo.test(testset)

# RMSE, MAE 계산
from surprise import accuracy
rmse = accuracy.rmse(predictions, verbose=False)
mae = accuracy.mae(predictions, verbose=False)

print(f"Test RMSE: {rmse}")
print(f"Test MAE: {mae}")
```

### 4.2 추천 품질 평가 (Recall@K)
```python
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

# Recall@5 계산
def recall5_calculator(df):
    df_sorted = df.sort_values(
        by=['userID', 'true_rec', 'predicted_rating'], 
        ascending=[True, False, False]
    )
    
    def calculate_recall_at_k(user_data, k=5):
        true_positives = user_data['true_rec'].sum()
        total_interest_items = user_data['true_rec'].sum()
        recommended_items = user_data['est_rec'].head(k).sum()
        
        recall_at_k = recommended_items / total_interest_items if total_interest_items > 0 else 0
        return recall_at_k
    
    recall_at_5_values = df_sorted.groupby('userID').apply(
        lambda x: calculate_recall_at_k(x, k=5)
    )
    
    return recall_at_5_values.mean()

recall_at_5 = recall5_calculator(predictions_df)
print(f'Recall@5: {recall_at_5}')
```

## 5. 최적화 전략

### 5.1 하이퍼파라미터 최적화
- **n_factors**: 데이터 크기에 따라 조정 (50-200)
- **n_epochs**: 과적합 방지를 위해 조기 종료 고려
- **학습률(lr_all)**: 너무 크면 불안정, 너무 작으면 수렴 느림
- **정규화 계수**: 과적합 방지, 교차 검증으로 최적값 찾기

### 5.2 데이터 최적화
- **최소 평가 수 필터링**: Cold Start 문제 완화
- **이상치 제거**: 비정상적으로 높은/낮은 평점 제거
- **시간 기반 분할**: 시간 정보가 있다면 시간 기반 train-test split

### 5.3 모델 앙상블 (선택사항)
```python
# 여러 모델 조합
from surprise import KNNBasic, KNNWithMeans, SVDpp

models = [
    SVD(n_factors=100, n_epochs=50),
    SVDpp(n_factors=100, n_epochs=50),
    KNNWithMeans(k=40, sim_options={'name': 'cosine'})
]

# 앙상블 예측 (평균)
ensemble_predictions = []
for model in models:
    model.fit(trainset)
    preds = model.test(testset)
    ensemble_predictions.append([p.est for p in preds])

final_predictions = np.mean(ensemble_predictions, axis=0)
```

## 6. 실행 순서 요약

1. **데이터 로드**: `dfE.csv` 읽기
2. **데이터 검증**: 크기, 결측값, 분포 확인
3. **전처리**: 중복 제거, 결측값 처리, Cold Start 필터링
4. **Dataset 변환**: Surprise Dataset으로 변환
5. **하이퍼파라미터 튜닝**: GridSearchCV 실행
6. **모델 학습**: 최적 파라미터로 학습
7. **성능 평가**: RMSE, MAE, Recall@5 계산
8. **모델 저장**: pickle/joblib로 저장

## 7. 주의사항

1. **데이터 크기**: 현재 데이터가 336행으로 작음 → 하이퍼파라미터 그리드를 줄이거나 교차 검증 fold 수 조정
2. **Cold Start**: 신규 사용자/아이템에 대한 대응 전략 필요
3. **SIDO 정보 활용**: 지역 기반 추천 로직 추가 고려
4. **모델 업데이트**: 새로운 데이터가 추가되면 재학습 필요

