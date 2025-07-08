import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { fetchAIAnswer } from '../../store/slices/aiSlice';
import { Input, Button, Flex } from '../ui';

interface AISearchBarProps {
  // 나중에 컨텍스트를 전달해야 할 경우를 대비해 props 확장성을 열어둡니다.
  context?: string | null; 
}

const AISearchBar: React.FC<AISearchBarProps> = ({ context }) => {
  const [question, setQuestion] = useState('');
  const dispatch = useAppDispatch();

  const handleSearch = () => {
    if (question.trim()) {
      dispatch(fetchAIAnswer({ question, context }));
      // 질문 후 입력창을 비울 수 있습니다. 필요에 따라 주석 해제.
      // setQuestion(''); 
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Flex align="center" gap={2}>
      <Input
        type="text"
        value={question}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="AI에게 무엇이든 물어보세요..."
        fullWidth
      />
      <Button onClick={handleSearch} disabled={!question.trim()}>
        질문하기
      </Button>
    </Flex>
  );
};

export default AISearchBar; 