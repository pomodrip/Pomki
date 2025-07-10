import { useState } from 'react';
import { cardService } from '../services/cardService';
import type { CreateCardRequest, CreateCardsRequest, Card } from '../types/card';

export const useCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCards = async (deckId: string, cards: { content: string; answer: string }[]): Promise<Card[] | undefined> => {
    setIsLoading(true);
    setError(null);

    try {
      if (cards.length === 1) {
        const request: CreateCardRequest = { deckId, ...cards[0] };
        const newCard = await cardService.createCard(deckId, request);
        return [newCard];
      } else {
        const request: CreateCardsRequest = { cards };
        const newCards = await cardService.createMultipleCards(deckId, request);
        return newCards;
      }
    } catch (err) {
      setError(err as Error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCards, isLoading, error };
};
