import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Head from 'next/head';
//components
import StockInfo from '../../components/stock-info/StockInfo';
import TweetFeed from '../../components/tweet/TweetFeed';
import PostTweet from '../../components/tweet/PostTweet';
//style
import pageStyle from '../../styles/pages/Ticker.module.scss';
//utils
//service
import { getTickerTweet, getInitialTickerTweet } from '../../service/tweet/tickerTweet.service';
import { getSummary } from '../../service/summary/summary.serivce';

import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { FetchQueryType } from 'src/type/FetchQueryType';

const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;
let Summary_Request: string;
// eslint-disable-next-line no-unused-vars
type Fetcher = { (ticker: string): Promise<[]> };
let fetcher: Fetcher;

type Props = {
  ticker: string;
  FetchedSummaryData: [] | undefined;
  FetchedSummaryState: string;
};
const StockPage: React.VFC<Props> = ({ ticker, FetchedSummaryData, FetchedSummaryState }) => {
  //表示するSummaryのデータ
  Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${ticker}&region=US`;
  FetchedSummaryData = useSWR(Summary_Request, fetcher, {
    initialData: FetchedSummaryData,
    revalidateOnMount: true,
  }).data;
  const [SummaryData, setSummaryData] = React.useState(FetchedSummaryData);
  const [SummaryState, setSummaryState] = React.useState(FetchedSummaryState);

  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = useState<any[]>([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = useState<number>(0);
  //tweetのfetch query
  const [tweetLoadState, setTweetLoadState] = useState('loading');
  const [fetchQuery, setFetchQuery] = useState<FetchQueryType>({
    ticker: ticker,
    skip: 0,
    take: 10,
  });
  const [hasMoreTweet, setHasMoreTweet] = useState(true);
  //did mount 初期表示tweetデータ

  const fetchTweet = async (): Promise<void> => {
    setTweetLoadState('loading');
    const tweetData = await getTickerTweet(fetchQuery);
    setDisplayTweets([...DisplayTweets, ...tweetData]);
    setTweetLoadState('complete');
    setHasMoreTweet(tweetData.length > 0);
  };

  //tweetセット
  useEffect(() => {
    //ticker→tickerページ遷移時にリフレッシュ
    const freshQuery = { ticker: ticker, skip: 0, take: 10 };
    setDisplayTweets([]);
    setFetchQuery(freshQuery);
    setTweetLoadState('loading');
    async function fetchInitialTweet() {
      const tweetData = await getInitialTickerTweet(freshQuery);
      setDisplayTweets([...tweetData]);
      setTweetLoadState('complete');
      setHasMoreTweet(tweetData.length > 0);
    }
    fetchInitialTweet();
  }, [ticker, TweetPostState]);

  //summaryDataセット
  useEffect(() => {
    //ticker→ticker 遷移時のデータ更新
    setSummaryData(FetchedSummaryData);
    //ISRでfetchできていなかったときここでデータセット
    async function getSummaryOnClient() {
      if (
        FetchedSummaryData == undefined ||
        'defaultKeyStatistics' in FetchedSummaryData == false
      ) {
        setSummaryState('unload');
        const summaryData = await getSummary(Summary_Request);
        setSummaryData(summaryData);
        setSummaryState('complete');
      }
    }
    getSummaryOnClient();
  }, [ticker, FetchedSummaryData]);
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
        tweetLoadState={tweetLoadState}
        DisplayTweets={DisplayTweets}
        setDisplayTweets={setDisplayTweets}
        TweetPostState={TweetPostState}
        setTweetPostState={setTweetPostState}
        fetchTweet={fetchTweet}
        fetchQuery={fetchQuery}
        hasMoreTweet={hasMoreTweet}
      ></TweetFeed>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { ticker: 'AAPL' } }],
    fallback: 'blocking',
  };
};

interface Params extends ParsedUrlQuery {
  ticker: string;
}

export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
  const ticker: string = params!.ticker;

  Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${ticker}`;

  fetcher = async (url: string) => {
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
};

export default StockPage;
