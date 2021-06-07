const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import auth from '../../utils/auth.js';

const favoriteTweetAction = async (tweetId: number): Promise<void> => {
  const url = baseRequestUrl + '/favorite/' + tweetId;
  fetch(url, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: auth.bearerToken(),
    },
  });
};

const unfavoriteTweetAction = async (tweetId: number): Promise<void> => {
  const url = baseRequestUrl + '/favorite/' + tweetId;
  fetch(url, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: auth.bearerToken(),
    },
  });
};

export { favoriteTweetAction, unfavoriteTweetAction };
