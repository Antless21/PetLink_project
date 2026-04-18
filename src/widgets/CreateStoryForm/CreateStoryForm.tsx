import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  Loader2,
  Film,
  Image as ImageIcon,
  Check,
  PawPrint,
} from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { useStoryStore } from '@entities/story/store';
import { usePetStore } from '@entities/pet/store';
import { resizeImage } from '@shared/lib/image';
import {
  processVideo,
  MAX_VIDEO_DURATION_SEC,
  MAX_VIDEO_SIZE_MB,
} from '@shared/lib/video';
import { cn } from '@shared/lib/cn';

interface Props {
  onClose: () => void;
  preselectedPetId?: string;
}

type MediaDraft =
  | { type: 'video'; videoDataUrl: string; posterDataUrl: string; durationSec: number }
  | { type: 'image'; imageDataUrl: string }
  | null;

export function CreateStoryForm({ onClose, preselectedPetId }: Props) {
  const navigate = useNavigate();
  const myPets = usePetStore((s) => s.getMyPets());
  const createStory = useStoryStore((s) => s.createStory);

  const [petId, setPetId] = useState(
    preselectedPetId && myPets.some((p) => p.id === preselectedPetId)
      ? preselectedPetId
      : myPets[0]?.id ?? '',
  );
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<MediaDraft>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleVideoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    setLoading(true);
    try {
      const result = await processVideo(file);
      setMedia({
        type: 'video',
        videoDataUrl: result.videoDataUrl,
        posterDataUrl: result.posterDataUrl,
        durationSec: result.durationSec,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обработки видео');
    } finally {
      setLoading(false);
    }
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    setLoading(true);
    try {
      const dataUrl = await resizeImage(file, 1080, 0.85);
      setMedia({ type: 'image', imageDataUrl: dataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обработки фото');
    } finally {
      setLoading(false);
    }
  }

  function removeMedia() {
    setMedia(null);
    setError(null);
  }

  async function handleSubmit() {
    setError(null);
    if (!petId) {
      setError('Выберите питомца');
      return;
    }
    if (!media) {
      setError('Добавьте фото или видео');
      return;
    }

    setLoading(true);
    try {
      if (media.type === 'video') {
        createStory({
          petId,
          mediaType: 'video',
          mediaUrl: media.videoDataUrl,
          posterUrl: media.posterDataUrl,
          caption,
        });
      } else {
        createStory({
          petId,
          mediaType: 'image',
          mediaUrl: media.imageDataUrl,
          caption,
        });
      }
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        navigate('/stories');
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить историю');
      setLoading(false);
    }
  }

  if (myPets.length === 0) {
    return (
      <Shell onClose={onClose} title="Новая история">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-coral-50 flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-8 h-8 text-coral-500" />
          </div>
          <h3 className="text-lg font-extrabold mb-2">Сначала создайте анкету</h3>
          <p className="text-sm text-slate-600 mb-5">
            Чтобы публиковать истории, нужно хотя бы одна анкета питомца.
          </p>
          <Button
            onClick={() => {
              onClose();
              navigate('/create');
            }}
          >
            Создать анкету
          </Button>
        </div>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell onClose={onClose} title="Новая история">
        <div className="p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
          </div>
          <h3 className="text-xl font-extrabold">История опубликована!</h3>
        </div>
      </Shell>
    );
  }

  return (
    <Shell onClose={onClose} title="Новая история">
      <div className="p-5 space-y-5 max-h-[calc(100vh-120px)] overflow-y-auto">
        {/* Pet selector */}
        {myPets.length > 1 && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              От лица питомца
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {myPets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPetId(p.id)}
                  className={cn(
                    'shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all',
                    petId === p.id
                      ? 'border-coral-500 bg-coral-50'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                >
                  {p.photos[0] ? (
                    <img
                      src={p.photos[0]}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-coral-200 flex items-center justify-center text-coral-700 font-bold text-sm">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-800">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Media upload */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
            Медиа
          </label>

          {!media ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => videoInputRef.current?.click()}
                disabled={loading}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-coral-400 hover:bg-coral-50 transition-all disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-coral-100 flex items-center justify-center">
                  <Film className="w-6 h-6 text-coral-500" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-800 text-sm">Видео</div>
                  <div className="text-[11px] text-slate-500">
                    до {MAX_VIDEO_DURATION_SEC} сек, {MAX_VIDEO_SIZE_MB} МБ
                  </div>
                </div>
              </button>

              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={loading}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50 transition-all disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-brand-500" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-800 text-sm">Фото</div>
                  <div className="text-[11px] text-slate-500">jpg, png</div>
                </div>
              </button>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[9/16] max-h-[420px] mx-auto">
              {media.type === 'video' ? (
                <video
                  src={media.videoDataUrl}
                  poster={media.posterDataUrl}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={media.imageDataUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              )}

              <button
                onClick={removeMedia}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Удалить"
              >
                <X className="w-5 h-5" />
              </button>

              {media.type === 'video' && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  {media.durationSec.toFixed(1)} с
                </div>
              )}
            </div>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleVideoPick}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />

          {loading && (
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Обработка...
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
            Подпись
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 180))}
            placeholder="Расскажи что-нибудь от лица питомца..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-coral-300"
          />
          <div className="text-[11px] text-slate-400 text-right mt-1">
            {caption.length} / 180
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 p-4 bg-white flex gap-2">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!media || loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Сохраняем
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Опубликовать
            </>
          )}
        </Button>
      </div>
    </Shell>
  );
}

function Shell({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
