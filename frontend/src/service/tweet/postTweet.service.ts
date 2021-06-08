const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import auth from '../../utils/auth';

const PostTweetAction = async (formData: FormData): Promise<void> => {
  const create_tweet_api_path = baseRequestUrl + '/tweet';
  await fetch(create_tweet_api_path, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: {
      Authorization: auth.bearerToken(),
    },
  });
};

export { PostTweetAction };
