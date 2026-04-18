import { useEffect } from 'react';
import { useAuthStore } from '@entities/user/store';
import { usePetStore } from '@entities/pet/store';
import { useChatStore } from '@entities/chat/store';
import { useStoryStore } from '@entities/story/store';

export function useAppInit() {
  const isReady = useAuthStore((s) => s.isReady);
  const pets = usePetStore((s) => s.pets);

  useEffect(() => {
    useAuthStore.getState().init();
    usePetStore.getState().init();
  }, []);

  useEffect(() => {
    if (isReady) {
      useChatStore.getState().init();
      useStoryStore.getState().init();
    }
  }, [isReady]);

  useEffect(() => {
    if (isReady) {
      useStoryStore.getState().refreshFromStorage();
    }
  }, [pets.length, isReady]);
}
