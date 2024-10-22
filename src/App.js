// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Lobby from './Lobby'; // 로그인 기능을 담당하는 컴포넌트
import Signup from './Signup'; // 회원가입 컴포넌트

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Lobby />} /> {/* Login 대신 Lobby 사용 */}
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
