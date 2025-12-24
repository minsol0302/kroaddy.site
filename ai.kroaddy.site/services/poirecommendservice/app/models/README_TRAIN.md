# E_capital_model 학습 가이드

## 빠른 시작

### 1. 환경 설정

필요한 패키지 설치:
```bash
pip install pandas numpy scikit-learn surprise joblib
```

### 2. 데이터 준비

`dfE.csv` 파일이 `../preprocessed/` 디렉토리에 있는지 확인:
```
ai.kroaddy.site/services/poirecommendservice/app/
├── models/
│   ├── train_model.py          # 학습 스크립트
│   └── svd_model_E.pkl         # 학습된 모델 (생성됨)
└── preprocessed/
    └── dfE.csv                  # 학습 데이터
```

### 3. 학습 실행

```bash
cd ai.kroaddy.site/services/poirecommendservice/app/models
python train_model.py
```

## 학습 전략 요약

### 데이터 전처리
1. **중복 제거**: 동일 userID-itemID 조합 중복 제거
2. **SIDO 결측값 처리**: itemID 기준으로 가장 빈도 높은 SIDO로 채우기
3. **Cold Start 완화**: 최소 평가 수가 2개 미만인 사용자/아이템 필터링

### 모델 학습
1. **하이퍼파라미터 튜닝**: GridSearchCV로 최적 파라미터 탐색
2. **교차 검증**: 5-fold CV로 모델 성능 평가
3. **Train-Test Split**: 80-20 비율로 분할

### 평가 지표
- **RMSE**: 평균 제곱근 오차
- **MAE**: 평균 절대 오차
- **Recall@5**: 상위 5개 추천에서 실제 관심 아이템을 찾는 비율

## 출력 파일

학습 완료 후 생성되는 파일:
- `svd_model_E.pkl`: 학습된 SVD 모델

## 주의사항

1. **데이터 크기**: 현재 `dfE.csv`는 336행으로 작은 편입니다.
   - 작은 데이터셋에서는 하이퍼파라미터 그리드를 간소화합니다.
   - 교차 검증 fold 수를 줄입니다 (3-fold).

2. **Cold Start 문제**: 
   - 신규 사용자나 아이템에 대한 추천이 어려울 수 있습니다.
   - 최소 평가 수 필터링으로 어느 정도 완화됩니다.

3. **SIDO 정보 활용**:
   - 지역 기반 추천을 위해 SIDO 정보를 활용할 수 있습니다.
   - 현재 모델은 SIDO를 직접 사용하지 않지만, 후처리에서 활용 가능합니다.

## 커스터마이징

### 하이퍼파라미터 수정

`train_model.py`의 `param_grid`를 수정하여 탐색 범위를 조정할 수 있습니다:

```python
param_grid = {
    'n_factors': [50, 100, 200],      # 잠재 요인 수
    'n_epochs': [10, 50],              # 학습 에포크 수
    'lr_all': [0.01, 0.1],             # 학습률
    'reg_all': [0.01, 0.1],            # 전체 정규화 계수
    'reg_bu': [0.01, 0.1],             # 사용자 편향 정규화
    'reg_bi': [0.01, 0.1]              # 아이템 편향 정규화
}
```

### 최소 평가 수 조정

Cold Start 필터링 기준을 변경:

```python
min_user_ratings = 2  # 사용자당 최소 평가 수
min_item_ratings = 2  # 아이템당 최소 평가 수
```

## 문제 해결

### 메모리 부족
- `n_jobs`를 줄이거나 하이퍼파라미터 그리드를 축소하세요.

### 학습 시간이 너무 오래 걸림
- `n_epochs` 범위를 줄이거나 `cv` fold 수를 줄이세요.
- 작은 데이터셋에서는 간소화된 그리드를 사용하세요.

### 성능이 낮음
- 데이터 품질을 확인하세요 (이상치, 결측값).
- 최소 평가 수 필터링 기준을 조정하세요.
- 하이퍼파라미터 탐색 범위를 확장하세요.

## 추가 리소스

- [Surprise 라이브러리 문서](https://surprise.readthedocs.io/)
- [SVD 알고리즘 설명](https://surprise.readthedocs.io/en/stable/matrix_factorization.html)

