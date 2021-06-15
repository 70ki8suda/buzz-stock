import { FetchQueryType } from './FetchQuery.type';

export type TweetFeedProps = {
  tweetLoadState: string;
  DisplayTweets: any[];
  setDisplayTweets: React.Dispatch<React.SetStateAction<any[]>>;
  TweetPostState: number;
  setTweetPostState: React.Dispatch<React.SetStateAction<number>>;
  fetchTweet: () => Promise<void>;
  fetchQuery: FetchQueryType;
  setFetchQuery: React.Dispatch<React.SetStateAction<any>>;
  hasMoreTweet: boolean;
};
