import { useState } from 'react';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import Text from '../components/ui/Text';
import { apiWithFallback, authApiWithFallback, deckApiWithFallback } from '../api/apiWithFallback';

/**
 * API Fallback 시스템 사용 예제
 * 
 * 이 컴포넌트는 axios 통신 실패시 mock 데이터를 사용하는 방법을 보여줍니다.
 */
export default function ApiWithFallbackExample() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 예시 1: 직접 apiWithFallback 사용
  const handleDirectApiCall = async () => {
    setLoading(true);
    try {
      const result = await apiWithFallback(
        // 실제 API 호출 (실패할 가능성이 높은 예시)
        () => fetch('/api/nonexistent-endpoint').then(res => res.json()),
        // Fallback 데이터
        { message: 'Mock 데이터를 사용했습니다!', timestamp: new Date().toISOString() },
        // 옵션
        { 
          enableMock: true, 
          fallbackDelay: 1000,
          logError: true 
        }
      );
      setResult(`직접 호출 결과: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`에러 발생: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 예시 2: 로그인 API 사용
  const handleLoginWithFallback = async () => {
    setLoading(true);
    try {
      const result = await authApiWithFallback.login({
        email: 'test@example.com',
        password: 'password123'
      });
      setResult(`로그인 결과: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`로그인 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 예시 3: 덱 목록 조회
  const handleGetDecks = async () => {
    setLoading(true);
    try {
      const result = await deckApiWithFallback.getDecksByMemberId(1);
      setResult(`덱 목록: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`덱 조회 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 예시 4: 덱 생성
  const handleCreateDeck = async () => {
    setLoading(true);
    try {
      const result = await deckApiWithFallback.createDeck({
        deckName: '새로운 덱 ' + Date.now(),
        memberId: 1
      });
      setResult(`덱 생성 결과: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`덱 생성 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Text variant="h1" style={{ marginBottom: '20px' }}>
        API Fallback 시스템 예제
      </Text>
      
      <Text variant="body1" style={{ marginBottom: '30px' }}>
        아래 버튼들을 클릭하면 API 호출을 시도하고, 실패시 자동으로 Mock 데이터를 반환합니다.
        개발자 콘솔을 열어서 로그를 확인해보세요.
      </Text>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <Button 
          onClick={handleDirectApiCall} 
          disabled={loading}
        >
          직접 API 호출 (fallback 포함)
        </Button>
        
        <Button 
          onClick={handleLoginWithFallback} 
          disabled={loading}
        >
          로그인 API (Mock Fallback)
        </Button>
        
        <Button 
          onClick={handleGetDecks} 
          disabled={loading}
        >
          덱 목록 조회 (Mock Fallback)
        </Button>
        
        <Button 
          onClick={handleCreateDeck} 
          disabled={loading}
        >
          덱 생성 (Mock Fallback)
        </Button>
      </div>

      {loading && (
        <Text variant="body1" style={{ marginBottom: '20px' }}>
          API 호출 중... (실패시 Mock 데이터 사용)
        </Text>
      )}

      {result && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <Text variant="caption" style={{ marginBottom: '10px' }}>
            결과:
          </Text>
          <pre style={{ 
            fontSize: '12px', 
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {result}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <Text variant="h3" style={{ marginBottom: '10px' }}>
          사용 방법:
        </Text>
        <Text variant="body1" style={{ fontSize: '14px' }}>
          <strong>1. 직접 사용:</strong><br/>
          <code>
            {`import { apiWithFallback } from '../api/apiWithFallback';

const result = await apiWithFallback(
  () => actualApiCall(),
  mockData,
  { enableMock: true }
);`}
          </code>
          <br/><br/>
          
          <strong>2. 사전 정의된 API 사용:</strong><br/>
          <code>
            {`import { authApiWithFallback } from '../api/apiWithFallback';

const result = await authApiWithFallback.login(data);`}
          </code>
          <br/><br/>
          
          <strong>3. 환경 변수 설정:</strong><br/>
          <code>VITE_USE_MOCK_FALLBACK=true</code> - Mock fallback 활성화<br/>
          개발 환경에서는 기본적으로 활성화됩니다.
        </Text>
      </div>
    </Container>
  );
} 