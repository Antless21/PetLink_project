export type StoryMediaType = 'video' | 'image';

export interface Story {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  ownerName: string;
  ownerType: 'person' | 'shelter';
  city: string;
  mediaType: StoryMediaType;
  mediaUrl: string;
  posterUrl?: string;
  caption: string;
  createdAt: string;
  pawsCount: number;
}

export interface StoryReaction {
  userId: string;
  storyId: string;
  createdAt: string;
}
