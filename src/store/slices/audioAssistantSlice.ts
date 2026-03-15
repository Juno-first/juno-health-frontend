import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AudioAssistantState {
  isOpen: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  title: string;
  text: string;
  audioUrl: string | null;
}

const initialState: AudioAssistantState = {
  isOpen: false,
  isPlaying: false,
  isLoading: false,
  title: "Juno is speaking",
  text: "",
  audioUrl: null,
};

const audioAssistantSlice = createSlice({
  name: "audioAssistant",
  initialState,
  reducers: {
    openAudioAssistant(
      state,
      action: PayloadAction<{
        title?: string;
        text?: string;
        audioUrl?: string | null;
      }>
    ) {
      state.isOpen = true;
      state.title = action.payload.title ?? "Juno is speaking";
      state.text = action.payload.text ?? "";
      state.audioUrl = action.payload.audioUrl ?? null;
    },

    closeAudioAssistant(state) {
      state.isOpen = false;
      state.isPlaying = false;
      state.isLoading = false;
    },

    setAudioLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setAudioPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },

    setAudioText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    },

    setAudioTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },

    setAudioUrl(state, action: PayloadAction<string | null>) {
      state.audioUrl = action.payload;
    },

    stopAudioAssistant(state) {
      state.isPlaying = false;
    },

    resetAudioAssistant(state) {
      state.isOpen = false;
      state.isPlaying = false;
      state.isLoading = false;
      state.title = "Juno is speaking";
      state.text = "";
      state.audioUrl = null;
    },
  },
});

export const {
  openAudioAssistant,
  closeAudioAssistant,
  setAudioLoading,
  setAudioPlaying,
  setAudioText,
  setAudioTitle,
  setAudioUrl,
  stopAudioAssistant,
  resetAudioAssistant,
} = audioAssistantSlice.actions;

export default audioAssistantSlice.reducer;