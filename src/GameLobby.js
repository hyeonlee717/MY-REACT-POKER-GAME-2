// GameLobby.js
import React, { useEffect, useState } from 'react';
import { auth, database } from './firebase';
import { ref, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

function GameLobby() {
  const [balance, setBalance] = useState(0);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 로그인한 사용자의 잔액 정보 가져오기
        const balanceRef = ref(database, `users/${user.uid}/balance`);
        onValue(balanceRef, (snapshot) => {
          const data = snapshot.val();
          setBalance(data || 0);
        });

        // 방 목록 가져오기
        const roomsRef = ref(database, 'rooms');
        onValue(roomsRef, async (snapshot) => {
          const data = snapshot.val();
          const roomList = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
          setRooms(roomList);
        });
      } else {
        // 로그아웃된 경우 로그인 페이지로 이동
        navigate('/login');
      }
    });
    
    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div>
      <h1>TEXAS HOLD'EM GAME LOBBY</h1>
      <p>Balance : {balance}</p>
      <h2>Cash Game</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.roomUid}>
            방 ID: {room.roomUid}, 스몰 블라인드: {room.smallBlind}, 빅 블라인드: {room.bigBlind}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GameLobby;
