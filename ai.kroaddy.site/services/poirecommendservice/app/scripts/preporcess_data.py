# preprocess_data.py
import pandas as pd
import numpy as np

# CSV 불러오기
visit_E = pd.read_csv('../inputdata/tn_visit_area_info_E.csv')

# 관광지 선택
visit_info = visit_E[
    visit_E['VISIT_AREA_TYPE_CD'].isin(range(1, 9))
].groupby('VISIT_AREA_NM').filter(lambda x: len(x) > 1).reset_index(drop=True)

# 평점 계산
visit_info['ratings'] = visit_info[['DGSTFN','REVISIT_INTENTION','RCMDTN_INTENTION']].mean(axis=1)
visit_info['TRAVELER_ID'] = visit_info['TRAVEL_ID'].str.split('_').str[1]

# 권역 처리
visit_info['SIDO'] = visit_info['LOTNO_ADDR'].str.split().str[0]

# 대표 관광지 이름 선택
most_freq = visit_info.groupby('LOTNO_ADDR')['VISIT_AREA_NM'] \
                     .agg(lambda x: x.mode().iloc[0]).reset_index()
visit_info = visit_info.merge(most_freq, on='LOTNO_ADDR', how='left', suffixes=('', '_most_frequent'))
visit_info['VISIT_AREA_NM'] = visit_info['VISIT_AREA_NM_most_frequent'].fillna(visit_info['VISIT_AREA_NM'])
visit_info.drop(columns=['VISIT_AREA_NM_most_frequent'], inplace=True)

# 컬럼명 변경 및 저장
df_final = visit_info.rename(columns={
    'TRAVELER_ID':'userID',
    'VISIT_AREA_NM':'itemID',
    'ratings':'rating'
})[['userID','itemID','rating','SIDO']]

df_final.to_csv('../preprocessed/dfE.csv', index=False)
print("전처리 완료: dfE.csv 생성됨")
