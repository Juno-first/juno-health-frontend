import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { queueClient } from '../../libs/api/queueClient';
import type {
  QueueStatus,
  CheckInRequest,
  WsQueueEvent,
} from '../../schemas/queue.schema';

// ── State ──────────────────────────────────────────────────────────────────────

export type QueueCheckStatus =
  | 'idle'
  | 'checking'
  | 'in_queue'
  | 'not_in_queue'
  | 'joining'
  | 'leaving'
  | 'error';

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface StatusUpdate {
  id: string;
  type: 'position' | 'wait_time' | 'called' | 'status' | 'info';
  title: string;
  body: string;
  time: number;
}

interface QueueState {
  data: QueueStatus | null;
  checkedInAt: number | null;
  checkStatus: QueueCheckStatus;
  error: string | null;
  socketStatus: SocketStatus;
  updates: StatusUpdate[];
}

const initialState: QueueState = {
  data: null,
  checkedInAt: null,
  checkStatus: 'idle',
  error: null,
  socketStatus: 'disconnected',
  updates: [],
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const checkQueueStatus = createAsyncThunk<
  QueueStatus | null,
  void,
  { rejectValue: string }
>('queue/checkStatus', async (_, { rejectWithValue }) => {
  try {
    return await queueClient.getStatus();
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to check queue'
    );
  }
});

export const joinQueue = createAsyncThunk<
  QueueStatus,
  CheckInRequest,
  { rejectValue: string }
>('queue/join', async (body, { rejectWithValue }) => {
  try {
    return await queueClient.checkIn(body);
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to join queue'
    );
  }
});

export const leaveQueue = createAsyncThunk<void, void, { rejectValue: string }>(
  'queue/leave',
  async (_, { rejectWithValue }) => {
    try {
      await queueClient.leave();
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to leave queue'
      );
    }
  }
);

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeUpdate(
  type: StatusUpdate['type'],
  title: string,
  body: string
): StatusUpdate {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    body,
    time: Date.now(),
  };
}

function applyEventToQueueData(state: QueueState, e: WsQueueEvent) {
  if (!state.data) return;

  state.data.position = e.position;
  state.data.queueDepth = e.queueDepth;
  state.data.estimatedWaitMinutes = e.estimatedWaitMinutes;
  state.data.status = e.status;
  state.data.priorityTier = e.priorityTier;

  state.data.roomName = e.roomName ?? state.data.roomName ?? null;
  state.data.assignedStaffName =
    e.assignedStaffName ?? state.data.assignedStaffName ?? null;
  state.data.assignedStaffRole =
    e.assignedStaffRole ?? state.data.assignedStaffRole ?? null;
}

// ── Slice ──────────────────────────────────────────────────────────────────────

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    setSocketStatus(state, action: PayloadAction<SocketStatus>) {
      state.socketStatus = action.payload;
    },

    wsQueueEvent(state, { payload: e }: PayloadAction<WsQueueEvent>) {
      switch (e.eventType) {
        case 'CHECKED_IN': {
          if (!state.data) break;

          applyEventToQueueData(state, e);

          state.updates.unshift(
            makeUpdate('info', 'Checked In', `You are #${e.position} in the queue`)
          );
          break;
        }

        case 'POSITION_UPDATED':
        case 'QUEUE_UPDATED': {
          if (!state.data) break;

          const prev = state.data.position;

          applyEventToQueueData(state, e);

          if (prev !== e.position) {
            state.updates.unshift(
              makeUpdate(
                'position',
                'Queue Position Updated',
                `You moved from position ${prev} to position ${e.position}`
              )
            );
          } else {
            state.updates.unshift(
              makeUpdate(
                'wait_time',
                'Queue Updated',
                `Estimated wait time is now ${e.estimatedWaitMinutes} minutes`
              )
            );
          }
          break;
        }

        case 'CALLED': {
          if (!state.data) break;

          applyEventToQueueData(state, e);

          const roomText = e.roomName ? ` Please proceed to ${e.roomName}.` : '';
          const staffText = e.assignedStaffName
            ? ` ${e.assignedStaffName} will be seeing you.`
            : '';

          state.updates.unshift(
            makeUpdate(
              'called',
              "It's Your Turn!",
              `Please proceed to the treatment area.${roomText}${staffText}`.trim()
            )
          );
          break;
        }

        case 'LEFT_QUEUE':
        case 'DISCHARGED': {
          state.data = null;
          state.checkedInAt = null;
          state.checkStatus = 'not_in_queue';
          state.updates = [];
          break;
        }
      }
    },

    clearQueue(state) {
      state.data = null;
      state.checkedInAt = null;
      state.checkStatus = 'idle';
      state.error = null;
      state.socketStatus = 'disconnected';
      state.updates = [];
    },
  },

  extraReducers: (builder) =>
    builder
      .addCase(checkQueueStatus.pending, (state) => {
        state.checkStatus = 'checking';
        state.error = null;
      })
      .addCase(checkQueueStatus.fulfilled, (state, action) => {
        state.data = action.payload;
        state.checkStatus = action.payload ? 'in_queue' : 'not_in_queue';

        if (action.payload?.checkedInAt) {
          state.checkedInAt = new Date(action.payload.checkedInAt).getTime();
        }

        if (state.data) {
          state.data.roomName = state.data.roomName ?? null;
          state.data.assignedStaffName = state.data.assignedStaffName ?? null;
          state.data.assignedStaffRole = state.data.assignedStaffRole ?? null;
        }
      })
      .addCase(checkQueueStatus.rejected, (state, { payload }) => {
        state.checkStatus = 'error';
        state.error = payload ?? 'Unknown error';
      })

      .addCase(joinQueue.pending, (state) => {
        state.checkStatus = 'joining';
        state.error = null;
      })
      .addCase(joinQueue.fulfilled, (state, { payload }) => {
        state.checkStatus = 'in_queue';
        state.data = {
          ...payload,
          roomName: payload.roomName ?? null,
          assignedStaffName: payload.assignedStaffName ?? null,
          assignedStaffRole: payload.assignedStaffRole ?? null,
        };
        state.checkedInAt = Date.now();
        state.updates = [
          makeUpdate(
            'info',
            'Check-in Confirmed',
            'You have been successfully checked into the queue'
          ),
        ];
      })
      .addCase(joinQueue.rejected, (state, { payload }) => {
        state.checkStatus = 'error';
        state.error = payload ?? 'Failed to join queue';
      })

      .addCase(leaveQueue.pending, (state) => {
        state.checkStatus = 'leaving';
      })
      .addCase(leaveQueue.fulfilled, (state) => {
        state.data = null;
        state.checkedInAt = null;
        state.checkStatus = 'not_in_queue';
        state.socketStatus = 'disconnected';
        state.updates = [];
      })
      .addCase(leaveQueue.rejected, (state, { payload }) => {
        state.checkStatus = 'error';
        state.error = payload ?? 'Failed to leave queue';
      }),
});

export const { setSocketStatus, wsQueueEvent, clearQueue } = queueSlice.actions;
export default queueSlice.reducer;