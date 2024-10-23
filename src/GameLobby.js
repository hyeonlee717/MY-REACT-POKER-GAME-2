import React, { useEffect, useState } from 'react';
import { auth, database } from './firebase';
import { ref, push, set, serverTimestamp, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

function GameLobby() {
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const balanceRef = ref(database, `users/${user.uid}/balance`);
        get(balanceRef)
          .then((snapshot) => {
            const data = snapshot.val();
            setBalance(data || 0);
          })
          .catch((error) => {
            console.error('잔액 정보를 가져오는 중 오류 발생:', error);
          });
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleEnterRoom = async () => {
    const roomsRef = ref(database, 'rooms');

    try {
      const snapshot = await get(roomsRef);
      const data = snapshot.val();
      const roomList = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];

      const existingRoom = roomList.find((room) => room.participants < 9);

      if (existingRoom) {
        await joinRoom(existingRoom); // 여기서 `joinRoom` 호출
      } else {
        const newRoomRef = push(roomsRef);
        const roomUid = newRoomRef.key;

        await set(newRoomRef, {
          roomUid: roomUid,
          smallBlind: 500,
          bigBlind: 1000,
          createdAt: serverTimestamp(),
          participants: 0 // 초기 참가자 수를 0으로 설정
        });

        console.log(`새로운 방 생성됨: ${roomUid}`);
        await joinRoom({ id: roomUid, smallBlind: 500, bigBlind: 1000 }); // 생성된 방으로 `joinRoom` 호출
      }
    } catch (error) {
      console.error('방 목록을 가져오는 중 오류 발생:', error);
    }
  };

  const joinRoom = async (room) => {
    if (!auth.currentUser) return;
  
    const user = auth.currentUser;
    const waitingPlayerRef = ref(database, `rooms/${room.id}/waitingPlayers/${user.uid}`);
  
    try {
      const playerSnapshot = await get(waitingPlayerRef);
  
      // 플레이어가 아직 대기 중인 목록에 없는 경우에만 추가
      if (!playerSnapshot.exists()) {
        const waitingPlayerInfo = {
          uid: user.uid,
          email: user.email,
        };
        await set(waitingPlayerRef, waitingPlayerInfo);
      }
  
      // 이제 방으로 이동
      navigate(`/room/${room.id}`, { state: room });
    } catch (error) {
      console.error('방에 입장 중 오류 발생:', error);
      alert('방에 입장하는 중 오류가 발생했습니다.');
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
