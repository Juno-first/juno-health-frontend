import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import queueReducer from './slices/queueSlice';
import audioAssistantReducer from './slices/audioAssistantSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
     queue: queueReducer,
     audioAssistant: audioAssistantReducer,
  
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
