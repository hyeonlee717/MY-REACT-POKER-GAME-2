// GameLobby.js
import React, { useEffect, useState } from 'react';
import { auth, database } from './firebase';
import { ref, push, set, serverTimestamp, update, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

function GameLobby() {
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 로그인한 사용자의 잔액 정보 가져오기
        const balanceRef = ref(database, `users/${user.uid}/balance`);
        get(balanceRef).then((snapshot) => {
          const data = snapshot.val();
          setBalance(data || 0);
        }).catch((error) => {
          console.error('잔액 정보를 가져오는 중 오류 발생:', error);
        });
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 사용자가 '입장' 버튼을 누르면 호출되는 함수
  const handleEnterRoom = async () => {
    const roomsRef = ref(database, 'rooms');

    // 서버에서 방 목록 가져오기 (한 번만 실행)
    try {
      const snapshot = await get(roomsRef);
      const data = snapshot.val();
      const roomList = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];

      // 참가자가 9명 미만인 기존 방 찾기
      const existingRoom = roomList.find((room) => room.participants < 9);

      if (existingRoom) {
        // 기존 방에 입장
        await joinRoom(existingRoom);
      } else {
        // 새로운 방 생성
        const newRoomRef = push(roomsRef);
        const roomUid = newRoomRef.key;

        await set(newRoomRef, {
          roomUid: roomUid,
          smallBlind: 500,
          bigBlind: 1000,
          createdAt: serverTimestamp(),
          participants: 1 // 첫 사용자가 입장하면서 참가자 수를 1로 설정
        });

        console.log(`새로운 방 생성됨: ${roomUid}`);
        alert('새로운 방이 생성되었습니다.');
      }
    } catch (error) {
      console.error('방 목록을 가져오는 중 오류 발생:', error);
    }
  };

  // 방에 입장하는 함수
  const joinRoom = async (room) => {
    const roomRef = ref(database, `rooms/${room.id}`);
    const updatedParticipants = (room.participants || 0) + 1;

    if (updatedParticipants <= 9) {
      await update(roomRef, {
        participants: updatedParticipants,
      });
      alert(`방에 입장하셨습니다: ${room.roomUid}`);
    } else {
      alert('방이 가득 찼습니다. 다른 방을 이용해 주세요.');
    }
  };

  return (
    <div>
      <h1>TEXAS HOLD'EM GAME LOBBY</h1>
      <p>Balance : {balance}</p>
      <h2>Cash Game</h2>
      <button onClick={handleEnterRoom}>500/1000</button>
    </div>
  );
}

export default GameLobby;
ㄴ