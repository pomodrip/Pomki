// API 명세서를 기반으로 한 타입 정의

/**
 * 덱 응답 DTO
 * API: /api/decks/**
 */
export interface CardDeck {
  deckId: string;
  deckName: string;
  memberId: number;
  cardCnt: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 카드 응답 DTO
 * API: /api/card/**, /api/decks/{deckId}/cards
 */
export interface Card {
  cardId: number;
  content: string;
  answer: string;
  deckId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 덱 생성 요청 DTO
 * API: POST /api/decks
 */
export interface CreateDeckRequest {
  deckName: string;
}

/**
 * 덱 수정 요청 DTO
 * API: PUT /api/decks/{deckId}
 */
export interface UpdateDeckRequest {
  deckName: string;
}

/**
 * 카드 생성 요청 DTO
 * API: POST /api/card?deckId={deckId}
 */
export interface CreateCardRequest {
  content: string;
  answer: string;
}

/**
 * 카드 수정 요청 DTO
 * API: PUT /api/card/{cardId}
 */
export interface UpdateCardRequest {
  content: string;
  answer: string;
}
