'use client'

import { useAppDispatch, useAppSelector } from '@/app/_lib/hooks';
import { fetchRoomData } from '@/app/_lib/store/roomSlice';
import { _localStorageService } from '@/app/_lib/utils/LocalStorageService';
import PlayerList from '@/app/poker/rooms/[slug]/player-list';
import MainPanel from '@/app/poker/rooms/[slug]/main-panel';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import NavBar from '@/app/poker/rooms/[slug]/nav-bar';

export default function Page({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const roomId = params.slug;

  const status = useAppSelector(state => state.room.status);
  const players = useAppSelector(state => state.room.players ?? []);
  const hasLoaded = useAppSelector(state => state.room.hasLoaded);
  const currentPlayerId = useAppSelector(state => state.room.currentPlayerId);

  // TODO: This hook is crazy - needs to be simpler.
  useEffect(() => {
    const playerId = _localStorageService.getPlayerIdForRoom(roomId);
    if (currentPlayerId !== playerId) {
      dispatch({
        type: 'room/updatePlayerId',
        payload: playerId,
      })
    }

    if (!playerId) {
      router.push(`${pathname}/join`)
    } else if (players.length > 0 && !players.find(x => x.cuid === playerId)) {
      // The player has an id in the local storage but not in the game
      // Navigate to join && delete the player id
      _localStorageService.removePlayerFromRoom({
        roomId,
      });
      dispatch({ type: 'room/reset' })
    } else {
      if (status === 'idle') {
        dispatch(fetchRoomData(roomId));
      }

      const socket = io(process.env.NEXT_PUBLIC_BE_URL ?? '', {
        query: {
          playerId,
          roomId,
        }
      });

      socket.on('vote_change', (payload) => {
        dispatch({
          type: 'round/updateVote',
          payload,
        })
      })

      socket.on('round_update', (payload) => {
        dispatch({
          type: 'round/updateRound',
          payload,
        })
      })

      socket.on('roster', (payload) => {
        dispatch({
          type: 'room/updateConnectedStatuses',
          payload: payload.roster,
        })
      })

      socket.on('room_change', () => {
        dispatch(fetchRoomData(roomId))
      })

      // on unmount
      return () => {
        socket.disconnect();
      }
    }
  }, [roomId, router, pathname, dispatch, status, currentPlayerId, hasLoaded, players])

  if (!hasLoaded) {
    return (
      <div>
        Loading...
      </div>
    )
  }

  // No room found
  if (status === 'failed') {
    return (
      <div>
        No room found.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <NavBar
        roomId={roomId}
        roomName="Proton Refinement"
      />
      <div className="flex gap-8 p-4 justify-center w-full">
        <MainPanel
          roomId={roomId}
          currentPlayerId={currentPlayerId}
        />
        <div className="min-w-64">
          <PlayerList
            className="max-w-xs w-full h-fit"
            currentPlayerId={currentPlayerId}
          />
        </div>
      </div>
    </div>

  )
}