import { UserType } from './User.type';
import { TickerType } from './Ticker.type';
import { FavoriteType } from './Favorite.type';
export type TweetType = {
  id: number;
  userId: number;
  content: string;
  created_at: Date;
  user: UserType;
  tickers: TickerType[];
  favorites: FavoriteType[];
  tweet_image?: {
    url: string;
  };
};
