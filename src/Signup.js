import React, { useState } from 'react';
import { auth, database } from './firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, serverTimestamp, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false); // 인증 여부 상태 추가
  const navigate = useNavigate();

  const handleSendVerification = async () => {
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

      // 이메일 인증 메일 보내기
      await sendEmailVerification(user);
      alert('인증 이메일이 발송되었습니다. 이메일을 확인하고 인증을 완료하세요.');

      // 이메일 인증 여부를 주기적으로 확인하는 로직 추가 필요
      checkEmailVerification(user);
    } catch (error) {
      alert('회원가입 실패: ' + error.message);
    }
  };

  // 이메일 인증 여부를 확인하는 함수
  const checkEmailVerification = async (user) => {
    user.reload(); // 사용자 정보를 새로고침하여 최신 상태 가져오기
    if (user.emailVerified) {
      setIsVerified(true);
      alert('이메일 인증이 완료되었습니다. 이제 회원가입 버튼을 눌러서 회원가입을 완료하세요.');
    } else {
      // 인증이 완료되지 않은 경우 3초 후 다시 확인
      setTimeout(() => checkEmailVerification(user), 3000);
    }
  };

  const handleSignUp = async () => {
    // 회원가입은 인증이 완료된 후 사용자 정보를 저장하는 역할을 합니다.
    try {
      const user = auth.currentUser;
      if (!user || !user.emailVerified) {
        alert('이메일 인증이 완료되지 않았습니다.');
        return;
      }

      // 인증 완료 후 데이터베이스에 사용자 정보 저장
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
      {/* 인증 메일 보내기 버튼 */}
      <button onClick={handleSendVerification} disabled={isVerified}>
        인증 이메일 보내기
      </button>
      {/* 회원가입 버튼은 인증이 완료된 경우에만 활성화 */}
      <button onClick={handleSignUp} disabled={!isVerified}>
        회원가입
      </button>
      <button onClick={() => navigate('/login')}>로그인으로 돌아가기</button>
    </div>
  );
}

export default Signup;
