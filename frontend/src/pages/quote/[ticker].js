import React from 'react';
import useSWR from 'swr';
import Head from 'next/head';
//components
import StockInfo from '../../components/stock-info/StockInfo';
import TweetFeed from '../../components/tweet/TweetFeed';
import PostTweet from '../../components/tweet/PostTweet';
//style
import pageStyle from '../../styles/pages/Ticker.module.scss';
const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;
let Summary_Request;
let fetcher;

const StockPage = ({ ticker, SummaryData, SummaryState }) => {
  //表示するSummaryのデータ
  Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${ticker}`;
  SummaryData = useSWR(ticker ? Summary_Request : null, fetcher, { initialData: SummaryData }).data;

  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = React.useState([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = React.useState({});
  //did mount 初期表示tweetデータ
  const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
  const get_tweets_path = baseRequestUrl + '/tweet/quote/' + ticker;

  React.useEffect(
    (TweetPostState) => {
      fetch(get_tweets_path, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          console.log('tweet loaded');
          setDisplayTweets(json);
        });
    },
    [TweetPostState, get_tweets_path],
  );
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
  // const rawSummaryData = await fetch(Summary_Request, {
  //   method: 'GET',
  //   headers: {
  //     'x-rapidapi-key': API_KEY,
  //     'x-rapidapi-host': API_HOST,
  //   },
  // });

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

  const SummaryData = await fetcher(Summary_Request);
  const SummaryState = 'complete';
  //console.log(SummaryData);
  return { props: { ticker, SummaryData, SummaryState }, revalidate: 30 };
}

export default StockPage;
