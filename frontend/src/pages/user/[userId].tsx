import React, { useState, useEffect, useContext } from 'react';
import Head from 'next/head';

//components
import Profile from '../../components/profile/Profile';
import PostTweet from '../../components/tweet/PostTweet';
import TweetFeed from '../../components/tweet/TweetFeed';
//utils

//context data
import { AuthUserContext } from '../_app';
import { LoggedInContext } from '../_app';
import { GetServerSideProps } from 'next';

//service
import { getInitialUserTweet, getUserTweet } from 'src/service/tweet/userTweet.service';

//type
import { FetchQueryType } from '../../type/FetchQuery.type';
import { TweetType } from '../../type/Tweet.type';

type Props = {
  userId: string;
};
const UserPage: React.VFC<Props> = ({ userId }) => {
  const { loggedInState } = useContext(LoggedInContext);

  const { authUserData } = useContext(AuthUserContext);
  const loggedin_userID = authUserData.id;

  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = useState<TweetType[]>([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = useState<number>(0);
  //tweetのfetch query
  const [tweetLoadState, setTweetLoadState] = useState<string>('loading');
  const [fetchQuery, setFetchQuery] = useState<FetchQueryType>({
    userId: userId,
    skip: 10,
    take: 10,
  });
  const [hasMoreTweet, setHasMoreTweet] = useState<boolean>(true);

  const fetchTweet = async (): Promise<void> => {
    setTweetLoadState('loading');
    const tweetData = await getUserTweet(fetchQuery);
    setDisplayTweets([...DisplayTweets, ...tweetData]);
    setTweetLoadState('complete');
    setHasMoreTweet(tweetData.length > 0);
  };

  //did mount 初期表示tweetデータ
  //user→user切り替え時にリフレッシュ
  useEffect(() => {
    const freshQuery = { userId: userId, skip: 0, take: 10 };
    setTweetLoadState('loading');
    async function fetchInitialTweet() {
      const tweetData = await getInitialUserTweet(freshQuery);
      setDisplayTweets([...tweetData]);
      setTweetLoadState('complete');
      setHasMoreTweet(tweetData.length > 0);
    }
    fetchInitialTweet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TweetPostState, userId]);

  return (
    <>
      <Head>
        <title>User Page</title>
      </Head>
      <Profile userId={userId}></Profile>
      {loggedInState && loggedin_userID === parseInt(userId) && (
        <PostTweet
          defaultTicker={undefined}
          TweetPostState={TweetPostState}
          setTweetPostState={setTweetPostState}
        ></PostTweet>
      )}
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
  );
};
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { userId } = query;
  return { props: { userId } };
};

export default UserPage;
