// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './Lobby'; // 로그인 기능을 담당하는 컴포넌트
import Signup from './Signup'; // 회원가입 컴포넌트
import GameLobby from './GameLobby';
import GameRoom from './GameRoom'; // 게임 방 컴포넌트

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        <Route path="/login" element={<Lobby />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/gamelobby" element={<GameLobby />} />
        <Route path="/room/:roomUid" element={<GameRoom />} /> {/* GameRoom 경로 추가 */}
        <Route path="*" element={<Lobby />} /> {/* 기본 경로를 로그인 페이지로 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
