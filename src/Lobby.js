// Lobby.js
import React, { useState } from 'react';
import { auth, database } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, update, onDisconnect } from 'firebase/database'; // 추가

function Lobby() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = auth.currentUser;
      const userRef = ref(database, `users/${user.uid}`);
  
      // 로그인 상태를 true로 설정
      await update(userRef, { loggedIn: true });
  
      // 연결이 끊어질 때 loggedIn을 false로 설정
      onDisconnect(userRef).update({ loggedIn: false });
  
      navigate('/gamelobby');
    } catch (error) {
      alert('로그인 실패 : ' + error.message);
    }
  };

  return (
    <div>
      <h1>로그인</h1>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>로그인</button>
      <button onClick={() => navigate('/signup')}>회원가입</button>
    </div>
  );
}

export default Lobby;
