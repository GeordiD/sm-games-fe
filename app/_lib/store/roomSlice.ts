import { GetRoomApiResponse } from '@/app/api/rooms/[slug]/route';
import { Player } from '@prisma/client';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type Status = 'idle' | 'pending' | 'succeeded' | 'failed';

interface RoomState {
  status: Status,
  error: string | null,
  players: Player[],
}

const initialState: RoomState = {
  status: 'idle',
  error: null,
  players: [],
};

export const fetchRoomData = createAsyncThunk('room/fetchRoom', async (id: string) => {
  const response = await fetch(
    `/api/rooms/${id}`,
    {
      method: 'GET'
    }
  );

  if (response.status === 404) {
    return null;
  } else {
    const result = await response.json();
    console.log(result);
    return result;
  }
})

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRoomData.fulfilled, (state, action: PayloadAction<GetRoomApiResponse>) => {
      return {
        ...state,
        status: 'succeeded',
        players: action.payload.players,
      };
    });

    builder.addCase(fetchRoomData.pending, (state) => {
      return {
        ...state,
        status: 'pending',
      }
    });

    builder.addCase(fetchRoomData.rejected, (state) => {
      return {
        ...state,
        status: 'failed',
        error: 'some error',
      }
    })
  }
});

export default roomSlice.reducer;
