import { fileToBase64 } from './image';

export interface VideoProcessResult {
  videoDataUrl: string;
  posterDataUrl: string;
  durationSec: number;
  sizeMb: number;
}

export const MAX_VIDEO_DURATION_SEC = 10;
export const MAX_VIDEO_SIZE_MB = 4;

export async function processVideo(file: File): Promise<VideoProcessResult> {
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_VIDEO_SIZE_MB) {
    throw new Error(
      `Видео слишком большое (${sizeMb.toFixed(1)} МБ). Максимум ${MAX_VIDEO_SIZE_MB} МБ.`,
    );
  }

  const videoDataUrl = await fileToBase64(file);

  const { posterDataUrl, durationSec } = await extractPosterAndDuration(
    videoDataUrl,
  );

  if (durationSec > MAX_VIDEO_DURATION_SEC + 0.5) {
    throw new Error(
      `Видео слишком длинное (${durationSec.toFixed(1)} с). Максимум ${MAX_VIDEO_DURATION_SEC} секунд.`,
    );
  }

  return { videoDataUrl, posterDataUrl, durationSec, sizeMb };
}

function extractPosterAndDuration(
  videoSrc: string,
): Promise<{ posterDataUrl: string; durationSec: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = videoSrc;

    let settled = false;

    const cleanup = () => {
      video.src = '';
      video.load();
    };

    const finish = (result: { posterDataUrl: string; durationSec: number }) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };

    video.addEventListener('loadedmetadata', () => {
      if (!video.duration || !isFinite(video.duration)) {
        fail(new Error('Не удалось определить длительность видео'));
        return;
      }
      try {
        video.currentTime = Math.min(0.1, video.duration / 2);
      } catch {
        /* some browsers need seeked event after play */
      }
    });

    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        const targetWidth = 720;
        const ratio = video.videoWidth / video.videoHeight || 9 / 16;
        canvas.width = targetWidth;
        canvas.height = Math.round(targetWidth / ratio);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish({
            posterDataUrl: '',
            durationSec: video.duration,
          });
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const posterDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        finish({ posterDataUrl, durationSec: video.duration });
      } catch (err) {
        fail(err instanceof Error ? err : new Error('Ошибка захвата кадра'));
      }
    });

    video.addEventListener('error', () => {
      fail(new Error('Не удалось прочитать видео. Попробуйте другой файл.'));
    });

    setTimeout(() => {
      if (!settled) fail(new Error('Обработка видео заняла слишком много времени'));
    }, 15000);
  });
}

export function estimateDataUrlSizeMb(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return (base64.length * 0.75) / (1024 * 1024);
}
