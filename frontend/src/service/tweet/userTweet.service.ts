import { FetchQueryType } from 'src/type/FetchQuery.type';
import auth from '../../utils/auth';
const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

const getUserTweet = async (fetchQuery: FetchQueryType) => {
  const queryParams = { skip: String(fetchQuery.skip), take: String(fetchQuery.take) };
  const query = new URLSearchParams(queryParams);
  const requestUrl = baseRequestUrl + '/tweet/user/' + fetchQuery.userId + '?' + query;
  //console.log(requestUrl);
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

//user→userページ遷移時にリフレッシュ
const getInitialUserTweet = async (freshQuery: FetchQueryType) => {
  const queryParams = { skip: String(freshQuery.skip), take: String(freshQuery.take) };
  const query = new URLSearchParams(queryParams);
  const requestUrl = baseRequestUrl + '/tweet/user/' + freshQuery.userId + '?' + query;
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

export { getUserTweet, getInitialUserTweet };
