"""
가격 분석 챗봇 서비스
OpenAI API를 사용한 친절한 한국어 챗봇
"""
from openai import OpenAI
import os
from typing import List, Dict, Optional
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 클라이언트 생성 (환경변수에서 키 자동 인식)
# API 키가 없으면 None으로 설정하고, 실제 사용 시에만 에러 발생
_openai_api_key = os.getenv("OPENAI_API_KEY")
if _openai_api_key:
    client = OpenAI(api_key=_openai_api_key)
else:
    client = None
    logger.warning("OPENAI_API_KEY가 설정되지 않았습니다. OpenAI API 기능이 작동하지 않을 수 있습니다.")

class PriceAnalyzerChatbot:
    """가격 분석 챗봇 클래스"""
    
    def __init__(self, model: str = "gpt-3.5-turbo", temperature: float = 0.7, max_tokens: int = 1000):
        """
        챗봇 초기화
        
        Args:
            model: 사용할 모델 (기본값: gpt-3.5-turbo)
            temperature: 창의성 조절 (0.0 ~ 2.0, 기본값: 0.7)
            max_tokens: 응답 길이 제한 (기본값: 300)
        """
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.system_message = "너는 친절한 한국어 챗봇이야. 사용자의 질문에 정확하고 도움이 되는 답변을 제공해줘."
        
    def chat(self, user_message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> str:
        """
        챗봇과 대화
        
        Args:
            user_message: 사용자 메시지
            conversation_history: 대화 이력 (선택사항)
        
        Returns:
            챗봇의 응답 메시지
        """
        try:
            # 메시지 구성
            messages = [
                {"role": "system", "content": self.system_message}
            ]
            
            # 대화 이력이 있으면 추가
            if conversation_history:
                # 대화 이력이 리스트인지 확인하고, 각 메시지의 형식 검증
                if isinstance(conversation_history, list):
                    for msg in conversation_history:
                        if isinstance(msg, dict) and "role" in msg and "content" in msg:
                            messages.append({
                                "role": msg["role"],
                                "content": str(msg["content"])
                            })
                        else:
                            logger.warning(f"잘못된 대화 이력 형식: {msg}")
                else:
                    logger.warning(f"대화 이력이 리스트가 아닙니다: {type(conversation_history)}")
            
            # 사용자 메시지 추가
            messages.append({"role": "user", "content": user_message})
            
            # 클라이언트 확인
            if client is None:
                error_msg = "OPENAI_API_KEY가 설정되지 않았습니다. 환경 변수를 확인해주세요."
                logger.error(error_msg)
                return "죄송합니다. OpenAI API 키가 설정되지 않아 응답을 생성할 수 없습니다."
            
            # 챗봇 호출
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            # 응답 추출
            bot_response = response.choices[0].message.content
            logger.info(f"사용자: {user_message}")
            logger.info(f"챗봇: {bot_response}")
            
            return bot_response
            
        except Exception as e:
            logger.error(f"챗봇 호출 실패: {e}")
            return f"죄송합니다. 오류가 발생했습니다: {str(e)}"
    
    def analyze_price(self, product_name: str, price: Optional[float] = None, context: Optional[str] = None) -> str:
        """
        가격 분석 요청
        
        Args:
            product_name: 상품명
            price: 가격 (선택사항)
            context: 추가 컨텍스트 (선택사항)
        
        Returns:
            가격 분석 결과
        """
        # 가격 정보가 있으면 포함
        if price:
            message = f"{product_name}의 가격이 {price:,}원인데, 이 가격이 적정한지 분석해줘."
        else:
            message = f"{product_name}의 가격을 분석해줘."
        
        # 추가 컨텍스트가 있으면 포함
        if context:
            message += f"\n추가 정보: {context}"
        
        # 시스템 메시지를 가격 분석 전문가로 변경
        original_system = self.system_message
        self.system_message = "너는 가격 분석 전문가야. 상품의 가격을 시장 가격, 경쟁사 가격, 가성비 등을 고려하여 분석해줘."
        
        try:
            response = self.chat(message)
            return response
        finally:
            # 원래 시스템 메시지로 복원
            self.system_message = original_system


# 전역 챗봇 인스턴스
chatbot = PriceAnalyzerChatbot()


def simple_chat(user_message: str) -> str:
    """
    간단한 챗봇 호출 함수
    
    Args:
        user_message: 사용자 메시지
    
    Returns:
        챗봇 응답
    """
    return chatbot.chat(user_message)


def analyze_price(product_name: str, price: Optional[float] = None, context: Optional[str] = None) -> str:
    """
    가격 분석 함수
    
    Args:
        product_name: 상품명
        price: 가격 (선택사항)
        context: 추가 컨텍스트 (선택사항)
    
    Returns:
        가격 분석 결과
    """
    return chatbot.analyze_price(product_name, price, context)


# 테스트 코드
if __name__ == "__main__":
    # 기본 챗봇 테스트
    print("=== 기본 챗봇 테스트 ===")
    response = simple_chat("안녕, 오늘 날씨 어때?")
    print(f"응답: {response}\n")
    
    # 가격 분석 테스트
    print("=== 가격 분석 테스트 ===")
    analysis = analyze_price("아이폰 15", 1200000, "최신 스마트폰, 애플 제품")
    print(f"분석 결과: {analysis}\n")
    
    # 대화 이력 테스트
    print("=== 대화 이력 테스트 ===")
    history = [
        {"role": "user", "content": "안녕하세요"},
        {"role": "assistant", "content": "안녕하세요! 무엇을 도와드릴까요?"}
    ]
    response = chatbot.chat("제 이름은 홍길동이에요", conversation_history=history)
    print(f"응답: {response}")

