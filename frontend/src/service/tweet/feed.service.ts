const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import { FetchQueryType } from 'src/type/FetchQuery.type';
import auth from '../../utils/auth';

const getFeedTweet = async (fetchQuery: FetchQueryType): Promise<any> => {
  const queryParams = { skip: String(fetchQuery.skip), take: String(fetchQuery.take) };
  const query = new URLSearchParams(queryParams);
  const requestUrl = baseRequestUrl + '/tweet/following_users_feed' + '?' + query;
  const tweetData = await fetch(requestUrl, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: auth.bearerToken(),
    },
  }).then((res) => {
    return res.json();
  });
  return tweetData;
};

export { getFeedTweet };
