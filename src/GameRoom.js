// GameRoom.js
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { auth, database } from './firebase';
import { ref, get, set, update, onValue } from 'firebase/database';

function GameRoom() {
  const { roomUid } = useParams();
  const location = useLocation();
  const { smallBlind, bigBlind } = location.state || {};
  const [seats, setSeats] = useState(Array(9).fill(null));
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [buyIn, setBuyIn] = useState('');
  const [buyInError, setBuyInError] = useState('');
  const minBuyIn = bigBlind * 40;
  const maxBuyIn = bigBlind * 100;
  const [isAlreadySeated, setIsAlreadySeated] = useState(false);

  useEffect(() => {
    // 방에 현재 있는 플레이어 목록을 가져와 좌석 상태를 설정
    const seatsRef = ref(database, `rooms/${roomUid}/players`);
    onValue(seatsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const updatedSeats = Array(9).fill(null);
      Object.values(data).forEach((player) => {
        if (player.seatNumber !== undefined && player.seatNumber !== null) {
          updatedSeats[player.seatNumber] = player;
        }
      });
      setSeats(updatedSeats);

      // 현재 사용자가 이미 자리에 앉아 있는지 확인
      const user = auth.currentUser;
      if (user && data[user.uid]) {
        setIsAlreadySeated(true);
      }
    });
  }, [roomUid]);

  const handleSeatClick = (index) => {
    if (seats[index] === null) {
      setSelectedSeat(index);
    }
  };

  const handleBuyInChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setBuyIn(value);

    if (value < minBuyIn) {
      setBuyInError(`최소 바이인 금액은 ${minBuyIn}입니다.`);
    } else if (value > maxBuyIn) {
      setBuyInError(`최대 바이인 금액은 ${maxBuyIn}입니다.`);
    } else {
      setBuyInError('');
    }
  };

  const handleSit = async () => {
    if (!auth.currentUser) return;
  
    const user = auth.currentUser;
    const userBalanceRef = ref(database, `users/${user.uid}/balance`);
    
    try {
      const userBalanceSnapshot = await get(userBalanceRef);
      const userBalance = userBalanceSnapshot.exists() ? userBalanceSnapshot.val() : 0;
  
      if (typeof userBalance !== 'number' || userBalance <= 0) {
        alert('잔액 정보를 가져오는 데 문제가 발생했습니다. 유효한 잔액이 없습니다.');
        return;
      }
  
      if (!buyIn || buyIn > userBalance || buyIn < minBuyIn || buyIn > maxBuyIn) {
        alert('잔액이 부족하거나 바이인 금액이 유효하지 않습니다.');
        return;
      }
  
      const remainingBalance = userBalance - buyIn;
  
      const seatInfo = {
        uid: user.uid,
        email: user.email,
        buyIn: buyIn,
        seatNumber: selectedSeat,
      };
  
      // 선택한 자리에 사용자를 할당
      const newSeats = [...seats];
      newSeats[selectedSeat] = seatInfo;
      setSeats(newSeats);
  
      // Firebase에 자리와 플레이어 정보 업데이트
      const playerRef = ref(database, `rooms/${roomUid}/players/${user.uid}`);
      await set(playerRef, seatInfo);
  
      // `waitingPlayers`에서 제거
      const waitingPlayerRef = ref(database, `rooms/${roomUid}/waitingPlayers/${user.uid}`);
      await set(waitingPlayerRef, null); // 플레이어가 자리 잡으면 대기 목록에서 제거
  
      // users의 잔액 업데이트
      await update(ref(database, `users/${user.uid}`), {
        balance: remainingBalance,
      });
  
      // 참가자 수 업데이트
      if (!isAlreadySeated) {
        const roomRef = ref(database, `rooms/${roomUid}`);
        const roomSnapshot = await get(roomRef);
        const roomData = roomSnapshot.val() || {};
        const currentParticipants = roomData.participants || 0;
  
        await update(roomRef, {
          participants: currentParticipants + 1,
        });
  
        setIsAlreadySeated(true); // 이제 사용자에 대해 이미 앉은 상태로 설정
      }
  
      // 자리와 바이인 정보 초기화
      setSelectedSeat(null);
      setBuyIn('');
    } catch (error) {
      console.error('잔액 정보를 가져오는 중 오류 발생:', error);
      alert('잔액 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };
  

  return (
    <div>
      <h1>Texas Hold'em Game Room</h1>
      <h3>SB: {smallBlind} / BB: {bigBlind}</h3>

      <div className="seats">
        {seats.map((seat, index) => (
          <div
            key={index}
            className={`seat ${seat ? 'occupied' : 'empty'}`}
            onClick={() => handleSeatClick(index)}
          >
            {seat ? (
              <div>
                <p>{seat.email}</p>
                <p>Buy-in: {seat.buyIn}</p>
              </div>
            ) : (
              <p>빈 자리</p>
            )}
          </div>
        ))}
      </div>

      {selectedSeat !== null && (
        <div className="buyin-modal">
          <h3>바이인 설정</h3>
          <input
            type="number"
            value={buyIn}
            onChange={handleBuyInChange}
            placeholder={`최소 ${minBuyIn} ~ 최대 ${maxBuyIn}`}
          />
          {buyInError && <p className="error">{buyInError}</p>}
          <button
            onClick={handleSit}
            disabled={!buyIn || buyIn < minBuyIn || buyIn > maxBuyIn}
          >
            앉기
          </button>
          <button onClick={() => setSelectedSeat(null)}>취소</button>
        </div>
      )}
    </div>
  );
}

export default GameRoom;
