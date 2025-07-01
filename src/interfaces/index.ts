import { QualityWithMetadata } from './qualities.enum';

export interface UserResponse {
  id?: string;
  name?: string;
  profilePicture?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  facebookUrl?: string;
  goodwill?: GoodwillResponse;
  phoneNumber?: string;
  refreshToken?: string;
  topThreeQualities?: QualityWithMetadata[];
  remainingLikes?: number;
  likesRefreshedAt?: Date;
}

export interface GoodwillResponse {
  score: number;
  level: string;
}
