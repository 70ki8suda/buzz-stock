import React from 'react';
import useSWR from 'swr';
import Head from 'next/head';
//components
import StockInfo from '../../components/stock-info/StockInfo';
import TweetFeed from '../../components/tweet/TweetFeed';
import PostTweet from '../../components/tweet/PostTweet';
//style
import pageStyle from '../../styles/pages/Ticker.module.scss';
//utils
import auth from '../../utils/auth';
const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;
let Summary_Request;
let fetcher;

const StockPage = ({ ticker, FetchedSummaryData, FetchedSummaryState }) => {
  //表示するSummaryのデータ
  Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${ticker}&region=US`;
  FetchedSummaryData = useSWR(Summary_Request, fetcher, {
    initialData: FetchedSummaryData,
    revalidateOnMount: true,
  }).data;
  const [SummaryData, setSummaryData] = React.useState(FetchedSummaryData);
  const [SummaryState, setSummaryState] = React.useState(FetchedSummaryState);

  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = React.useState([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = React.useState({});
  //did mount 初期表示tweetデータ
  const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

  React.useEffect(() => {
    let get_tweets_path = baseRequestUrl + '/tweet/quote/' + ticker;
    fetch(get_tweets_path, {
      method: 'GET',
      mode: 'cors',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: auth.bearerToken(),
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log('tweet loaded');
        setDisplayTweets(json);
      });
  }, [ticker, TweetPostState]);

  React.useEffect(() => {
    async function getSummary() {
      if ('defaultKeyStatistics' in FetchedSummaryData == false) {
        setSummaryState('unload');
        await fetch(Summary_Request, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
          },
        })
          .then((response) => response.json())
          .then((result) => {
            setSummaryData(result);
            setSummaryState('complete');
          });
      }
    }
    getSummary();
  }, [ticker]);
  return (
    <>
      <Head>
        <title>Buzz Stock .com | {ticker}</title>
      </Head>
      {ticker == undefined && <p>Loading Ticker</p>}
      {ticker !== undefined && SummaryData != undefined && (
        <div className={pageStyle['chart-container']}>
          <StockInfo ticker={ticker} SummaryData={SummaryData} SummaryState={SummaryState} />
        </div>
      )}
      <PostTweet
        TweetPostState={TweetPostState}
        setTweetPostState={setTweetPostState}
        defaultTicker={ticker}
      ></PostTweet>
      <TweetFeed
        DisplayTweets={DisplayTweets}
        setTweetPostState={setTweetPostState}
        setDisplayTweets={setDisplayTweets}
      ></TweetFeed>
    </>
  );
};
export async function getStaticPaths() {
  return {
    paths: [{ params: { ticker: 'AAPL' } }],
    fallback: 'blocking',
  };
}
export async function getStaticProps({ params, query }) {
  let ticker;
  if (params.ticker) {
    ticker = params.ticker;
  } else {
    ticker = query.ticker;
  }
  Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${ticker}`;

  fetcher = async (url) => {
    const rawSummaryData = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    });
    return rawSummaryData.json();
  };

  const FetchedSummaryData = await fetcher(Summary_Request);
  let FetchedSummaryState;
  if ('defaultKeyStatistics' in FetchedSummaryData == false) {
    FetchedSummaryState = 'unload';
  } else {
    FetchedSummaryState = 'complete';
  }

  return { props: { ticker, FetchedSummaryData, FetchedSummaryState }, revalidate: 30 };
}

export default StockPage;
