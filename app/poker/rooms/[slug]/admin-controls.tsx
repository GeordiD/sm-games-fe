'use client'

import { useAppDispatch, useAppSelector } from '@/app/_lib/hooks'
import { createNewRound } from '@/app/_lib/store/roundSlice';

export default function AdminControls(props: {
  className?: string,
  roomId: string,
}) {
  const dispatch = useAppDispatch();

  const {
    className = '',
    roomId,
  } = props

  const nextRoundStatus = useAppSelector(state => state.round.status);
  const activeRound = useAppSelector(state => state.round.active);

  function handleNextRoundClick() {
    dispatch(createNewRound(roomId));
  }

  async function handleFlipCardsClick() {
    await fetch(`/api/rooms/${roomId}/rounds`, {
      method: 'PUT',
      body: JSON.stringify({
        isCardsFlipped: true,
      })
    });
  }

  return (
    <div className={`${className} flex flex-col gap-4`}>
      <button
        onClick={handleFlipCardsClick}
        className="btn btn-secondary"
        disabled={activeRound?.isCardsFlipped}
      >Flip Cards
      </button>
      <button
        onClick={handleNextRoundClick}
        className="btn btn-secondary"
        disabled={nextRoundStatus !== 'idle'}
      >Next Round
      </button>
    </div>
  )
}