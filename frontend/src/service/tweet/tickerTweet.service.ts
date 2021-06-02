import auth from '../../utils/auth';

const getTickerTweet = async (fetchQuery: any) => {
  const queryParams = { skip: fetchQuery.skip, take: fetchQuery.take };
  const query = new URLSearchParams(queryParams);
  const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
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
const getInitialTickerTweet = async (freshQuery: any) => {
  const queryParams = { skip: freshQuery.skip, take: freshQuery.take };
  const query = new URLSearchParams(queryParams);
  const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
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
