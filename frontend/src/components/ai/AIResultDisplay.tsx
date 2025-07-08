import React from 'react';
import { useAppSelector } from '../../hooks/useRedux';
import { selectAIState } from '../../store/slices/aiSlice';
import { Spinner, Card, Text, Alert } from '../ui';


const AIResultDisplay: React.FC = () => {
  const { loading, data, error } = useAppSelector(selectAIState);

  if (loading === 'pending') {
    return (
      <Card>
        <Spinner />
        <Text>AI가 답변을 생성하고 있습니다...</Text>
      </Card>
    );
  }

  if (error) {
    return <Alert severity="error">오류가 발생했습니다: {error}</Alert>;
  }

  if (!data) {
    return <Text>AI에게 질문하여 답변을 받아보세요.</Text>;
  }

  return (
    <Card>
      <Text component="h3" variant="h3" fontWeight="bold">AI 답변:</Text>
      <Text>{data.answer}</Text>
      <Text variant="caption" color="text.secondary" sx={{ mt: 2 }}>
        원본 질문: {data.question}
      </Text>
    </Card>
  );
};

export default AIResultDisplay; 