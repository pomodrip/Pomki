import React from 'react';
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';

function App() {
  return (
    <>
      <Header />
        <div>
          <h1>Pomki Project</h1>
          <p>애플리케이션이 정상적으로 실행되었습니다.</p>
        </div>
      <BottomNav />
    </>
  );
}

export default App;