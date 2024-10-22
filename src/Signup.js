// Signup.js
import React, { useState } from 'react';
import { auth, database } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, serverTimestamp, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      alert('이메일을 입력하세요.');
      return;
    }

    if (!trimmedPassword) {
      alert('비밀번호를 입력하세요.');
      return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        const user = userCredential.user;
  
        // Realtime Database에 사용자 정보 저장
        await set(ref(database, 'users/' + user.uid), {
          email: user.email,
          createdAt: serverTimestamp()
        });
  
        alert('회원가입이 완료되었습니다.');
        navigate('/login');
      } catch (error) {
        alert('회원가입 실패: ' + error.message);
      }
  };

  return (
    <div>
      <h1>회원가입</h1>
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
      <button onClick={handleSignUp}>회원가입</button>
      <button onClick={() => navigate('/login')}>로그인으로 돌아가기</button>
    </div>
  );
}

export default Signup;
