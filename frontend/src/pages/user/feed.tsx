import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

//components
import PostTweet from '../../components/tweet/PostTweet';
import TweetFeed from '../../components/tweet/TweetFeed';

//utils
//context data
import { LoggedInContext } from '../_app';

//service
import { getFeedTweet } from 'src/service/tweet/feed.service';

//type
import { FetchQueryType } from '../../type/FetchQueryType';
import { TweetType } from 'src/type/Tweet.type';

//styles
import style from './Feed.module.scss';

const Feed: React.VFC<{ userId: string }> = ({ userId }) => {
  const router = useRouter();
  const { loggedInState } = useContext(LoggedInContext);

  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = useState<TweetType[]>([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = useState<number>(0);
  //tweetのfetch query
  const [tweetLoadState, setTweetLoadState] = useState<string>('loading');
  const [fetchQuery, setFetchQuery] = useState<FetchQueryType>({
    skip: 0,
    take: 10,
  });
  const [hasMoreTweet, setHasMoreTweet] = useState<boolean>(true);

  const fetchTweet = async (): Promise<void> => {
    setTweetLoadState('loading');
    const tweetData = await getFeedTweet(fetchQuery);
    setDisplayTweets([...DisplayTweets, ...tweetData]);
    setTweetLoadState('complete');
    setHasMoreTweet(tweetData.length > 0);
  };

  //未ログインならログインページへリダイレクト
  useEffect(() => {
    if (!loggedInState) {
      router.replace('/account/login');
    }
  });

  //did mount 初期表示tweetデータ
  useEffect(() => {
    setDisplayTweets([]);
    fetchTweet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TweetPostState, userId]);

  return (
    <>
      <Head>
        <title>Feed</title>
      </Head>

      {loggedInState && (
        <>
          <h1 className={style['db-ttl']}>Feed</h1>
          <PostTweet
            TweetPostState={TweetPostState}
            setTweetPostState={setTweetPostState}
            defaultTicker={undefined}
          ></PostTweet>
          <TweetFeed
            tweetLoadState={tweetLoadState}
            DisplayTweets={DisplayTweets}
            setDisplayTweets={setDisplayTweets}
            TweetPostState={TweetPostState}
            setTweetPostState={setTweetPostState}
            fetchTweet={fetchTweet}
            fetchQuery={fetchQuery}
            setFetchQuery={setFetchQuery}
            hasMoreTweet={hasMoreTweet}
          ></TweetFeed>
        </>
      )}
    </>
  );
};

export default Feed;
