import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

//components
import PostTweet from '../../components/tweet/PostTweet';
import TweetFeed from '../../components/tweet/TweetFeed';

//utils
import auth from '../../utils/auth';

//context data
import { AuthUserData } from '../../pages/_app';
import { LoggedInContext } from '../../pages/_app';

//styles
import style from '../../styles/pages/Feed.module.scss';

const Feed = ({ userID }) => {
  const router = useRouter();
  const { LoggedInState } = useContext(LoggedInContext);

  const { AuthUserProfile } = useContext(AuthUserData);
  const loggedin_userID = AuthUserProfile.id;

  const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
  const get_tweets_path = baseRequestUrl + '/tweet/following_users_feed';
  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = React.useState([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = React.useState({});
  //tweetのfetch query
  const [tweetLoadState, setTweetLoadState] = useState('loading');
  const [fetchQuery, setFetchQuery] = useState({ userId: userID, skip: 0, take: 10 });
  const [hasMoreTweet, setHasMoreTweet] = useState(true);

  const fetchTweet = async () => {
    const queryParams = { skip: fetchQuery.skip, take: fetchQuery.take };
    const query = new URLSearchParams(queryParams);
    const requestUrl = baseRequestUrl + '/tweet/following_users_feed' + '?' + query;
    setTweetLoadState('loading');
    await fetch(requestUrl, {
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
        setDisplayTweets([...DisplayTweets, ...json]);
        setTweetLoadState('complete');
        setHasMoreTweet(json.length > 0);
      });
  };

  //未ログインならログインページへリダイレクト
  React.useEffect(() => {
    if (!LoggedInState) {
      router.replace('/account/login');
    }
  });

  //did mount 初期表示tweetデータ
  React.useEffect(() => {
    setDisplayTweets([]);
    fetchTweet();
  }, [TweetPostState, userID]);

  return (
    <>
      <Head>
        <title>Feed</title>
      </Head>

      {LoggedInState && (
        <>
          <h1 className={style['db-ttl']}>Feed</h1>
          <PostTweet setTweetPostState={setTweetPostState}></PostTweet>
          <TweetFeed
            tweetLoadState={tweetLoadState}
            setTweetLoadState={setTweetLoadState}
            DisplayTweets={DisplayTweets}
            setDisplayTweets={setDisplayTweets}
            TweetPostState={TweetPostState}
            setTweetPostState={setTweetPostState}
            fetchTweet={fetchTweet}
            fetchQuery={fetchQuery}
            setFetchQuery={setFetchQuery}
            hasMoreTweet={hasMoreTweet}
            setHasMore={setHasMoreTweet}
          ></TweetFeed>
        </>
      )}
    </>
  );
};

export default Feed;
