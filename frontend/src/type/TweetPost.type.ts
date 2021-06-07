export type TweetPostType = {
  tweet_text: string;
  tweet_image?: any | null;
  imageSelected: boolean;
};

export const initialTweetPostState = {
  tweet_text: '',
  tweet_image: null,
  imageSelected: false,
};
