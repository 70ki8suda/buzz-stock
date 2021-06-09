import { FetchQueryType } from 'src/type/FetchQueryType';
import auth from '../../utils/auth';
const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

const getTickerTweet = async (fetchQuery: FetchQueryType): Promise<any> => {
  const queryParams = { skip: String(fetchQuery.skip), take: String(fetchQuery.take) };
  const query = new URLSearchParams(queryParams);
  const requestUrl = baseRequestUrl + '/tweet/quote/' + fetchQuery.ticker + '?' + query;
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

//ticker→tickerページ遷移時にリフレッシュ
const getInitialTickerTweet = async (freshQuery: FetchQueryType) => {
  const queryParams = { skip: String(freshQuery.skip), take: String(freshQuery.take) };
  const query = new URLSearchParams(queryParams);
  const requestUrl = baseRequestUrl + '/tweet/quote/' + freshQuery.ticker + '?' + query;
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

export { getTickerTweet, getInitialTickerTweet };
