import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import {
  openAudioAssistant,
  closeAudioAssistant,
  setAudioLoading,
  setAudioPlaying,
  setAudioText,
  setAudioTitle,
  stopAudioAssistant,
  resetAudioAssistant,
} from "../slices/audioAssistantSlice";
import {
  requestWelcomeAudio,
  requestQueueAudio,
  type VoiceAssistantPayload,
  type QueueAudioPayload,
} from "../../libs/api/voiceAssistantClient";

let globalAudio: HTMLAudioElement | null = null;
let globalAudioUrl: string | null = null;

export function useAudioAssistant() {
  const dispatch = useAppDispatch();

  const {
    isOpen,
    isPlaying,
    isLoading,
    title,
    text,
    audioUrl,
  } = useAppSelector((s) => s.audioAssistant);

  const cleanupAudio = useCallback(() => {
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      globalAudio.onplay = null;
      globalAudio.onpause = null;
      globalAudio.onended = null;
      globalAudio.onerror = null;
      globalAudio = null;
    }

    if (globalAudioUrl) {
      URL.revokeObjectURL(globalAudioUrl);
      globalAudioUrl = null;
    }
  }, []);

  const open = useCallback(
    (payload?: { title?: string; text?: string; audioUrl?: string | null }) => {
      dispatch(
        openAudioAssistant({
          title: payload?.title ?? "Juno is speaking",
          text: payload?.text ?? "",
          audioUrl: payload?.audioUrl ?? null,
        })
      );
    },
    [dispatch]
  );

  const close = useCallback(() => {
    cleanupAudio();
    dispatch(closeAudioAssistant());
    dispatch(setAudioPlaying(false));
  }, [cleanupAudio, dispatch]);

  const stop = useCallback(() => {
    cleanupAudio();
    dispatch(stopAudioAssistant());
    dispatch(setAudioPlaying(false));
  }, [cleanupAudio, dispatch]);

  const reset = useCallback(() => {
    cleanupAudio();
    dispatch(resetAudioAssistant());
    dispatch(setAudioPlaying(false));
    dispatch(setAudioLoading(false));
  }, [cleanupAudio, dispatch]);

  const setLoading = useCallback(
    (value: boolean) => dispatch(setAudioLoading(value)),
    [dispatch]
  );

  const setPlaying = useCallback(
    (value: boolean) => dispatch(setAudioPlaying(value)),
    [dispatch]
  );

  const setText = useCallback(
    (value: string) => dispatch(setAudioText(value)),
    [dispatch]
  );

  const setTitle = useCallback(
    (value: string) => dispatch(setAudioTitle(value)),
    [dispatch]
  );

  const playAudioBlob = useCallback(
    async ({
      audioBlob,
      titleText,
      bodyText,
    }: {
      audioBlob: Blob;
      titleText: string;
      bodyText: string;
    }) => {
      cleanupAudio();

      const objectUrl = URL.createObjectURL(audioBlob);
      globalAudioUrl = objectUrl;

      const audio = new Audio(objectUrl);
      globalAudio = audio;

      dispatch(
        openAudioAssistant({
          title: titleText,
          text: bodyText,
          audioUrl: objectUrl,
        })
      );

      audio.onplay = () => dispatch(setAudioPlaying(true));
      audio.onpause = () => dispatch(setAudioPlaying(false));
      audio.onended = () => {
        dispatch(setAudioPlaying(false));
        setTimeout(() => {
          dispatch(closeAudioAssistant());
        }, 1200);
      };
      audio.onerror = () => {
        dispatch(setAudioPlaying(false));
        dispatch(setAudioLoading(false));
      };

      await audio.play();
    },
    [cleanupAudio, dispatch]
  );

  const playWelcomeAudio = useCallback(
    async (payload: VoiceAssistantPayload, authToken?: string | null) => {
      try {
        dispatch(setAudioLoading(true));
        dispatch(setAudioPlaying(false));

        dispatch(
          openAudioAssistant({
            title: "Juno is speaking",
            text: "Preparing your welcome message...",
            audioUrl: null,
          })
        );

        const { audioBlob, script } = await requestWelcomeAudio(
          payload,
          authToken ?? undefined
        );

        dispatch(setAudioLoading(false));

        await playAudioBlob({
          audioBlob,
          titleText: "Juno is speaking",
          bodyText: script || "Welcome. You have been checked in.",
        });
      } catch (error) {
        console.error("Failed to play welcome audio:", error);
        dispatch(setAudioLoading(false));
        dispatch(setAudioPlaying(false));
        dispatch(setAudioText("I couldn’t play the welcome audio right now."));
      }
    },
    [dispatch, playAudioBlob]
  );

  const playQueueAudio = useCallback(
    async (payload: QueueAudioPayload, authToken?: string | null) => {
      try {
        dispatch(setAudioLoading(true));
        dispatch(setAudioPlaying(false));

        dispatch(
          openAudioAssistant({
            title: "Queue update",
            text: "Preparing your queue update...",
            audioUrl: null,
          })
        );

        const { audioBlob, script } = await requestQueueAudio(
          payload,
          authToken ?? undefined
        );

        dispatch(setAudioLoading(false));

        await playAudioBlob({
          audioBlob,
          titleText: "Queue update",
          bodyText: script || "You have a new queue update.",
        });
      } catch (error) {
        console.error("Failed to play queue audio:", error);
        dispatch(setAudioLoading(false));
        dispatch(setAudioPlaying(false));
        dispatch(setAudioText("I couldn’t play the queue audio right now."));
      }
    },
    [dispatch, playAudioBlob]
  );

  return {
    isOpen,
    isPlaying,
    isLoading,
    title,
    text,
    audioUrl,
    open,
    close,
    stop,
    reset,
    setLoading,
    setPlaying,
    setText,
    setTitle,
    playWelcomeAudio,
    playQueueAudio,
  };
}