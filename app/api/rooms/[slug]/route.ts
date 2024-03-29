import { NotFound } from '@/app/_lib/default-responses';
import { _roomService } from '@/app/_lib/services/room.service';
import { _roundService } from '@/app/_lib/services/round.service';
import { RouteHandler } from '@/app/_lib/types/RouteHandler';
import { Player, PokerRoom, Round } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export interface GetRoomApiResponse {
  room: PokerRoom,
  players: Player[],
  activeRound: Round,
  history: Round[],
  votes: Record<string, string>,
}

// Get data about current state of a room
export async function GET(
  req: NextRequest,
  { params }: RouteHandler,
) {
  const roomResult = await _roomService.getRoomById(params.slug)

  // If rooom doesn't exist, return 404
  if (!roomResult) {
    return NotFound();
  }

  const {
    players,
    ...pokerRoom
  } = roomResult;

  const activeRound = await _roundService.getActiveRound(roomResult.id);
  const pastRounds = await _roundService.getRoundHistory(roomResult.id);
  const votes = activeRound?.Vote
    .reduce((acc, vote) => ({
      ...acc,
      [vote.player.cuid]: vote.value
    }), {});

  return NextResponse.json({
    room: pokerRoom,
    players,
    activeRound: activeRound || null,
    votes,
    history: pastRounds || [],
  } as GetRoomApiResponse)
}
