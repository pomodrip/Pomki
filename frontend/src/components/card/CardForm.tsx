import React, { useState } from 'react';
import { useCard } from '../../hooks/useCard';

interface CardFormProps {
  deckId: string;
  onCardsCreated: (newCards: any[]) => void;
}

export const CardForm: React.FC<CardFormProps> = ({ deckId, onCardsCreated }) => {
  const [cardInputs, setCardInputs] = useState([{ content: '', answer: '' }]);
  const { createCards, isLoading, error } = useCard();

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const values = [...cardInputs];
    if (event.target.name === 'content') {
      values[index].content = event.target.value;
    } else {
      values[index].answer = event.target.value;
    }
    setCardInputs(values);
  };

  const handleAddCard = () => {
    setCardInputs([...cardInputs, { content: '', answer: '' }]);
  };

  const handleRemoveCard = (index: number) => {
    const values = [...cardInputs];
    values.splice(index, 1);
    setCardInputs(values);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const newCards = await createCards(deckId, cardInputs);
    if (newCards) {
      onCardsCreated(newCards);
      setCardInputs([{ content: '', answer: '' }]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {cardInputs.map((card, index) => (
        <div key={index}>
          <input
            type="text"
            name="content"
            placeholder="Question"            value={card.content}
            onChange={event => handleInputChange(index, event)}
            required
          />
          <input
            type="text"
            name="answer"
            placeholder="Answer"            value={card.answer}
            onChange={event => handleInputChange(index, event)}
            required
          />
          <button type="button" onClick={() => handleRemoveCard(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddCard}>Add Card</button>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Cards to Deck'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </form>
  );
};
