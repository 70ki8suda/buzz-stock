const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import auth from '../../utils/auth';

const deleteTweetRequest = async (tweet_id: number): Promise<void> => {
  const url = baseRequestUrl + '/tweet/' + String(tweet_id);
  await fetch(url, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: auth.bearerToken(),
    },
  }).catch((error) => {
    console.error('Error:', error);
  });
};

export { deleteTweetRequest };
