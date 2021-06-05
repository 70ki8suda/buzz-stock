import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

//components
import PostTweet from '../../components/tweet/PostTweet';
import TweetFeed from '../../components/tweet/TweetFeed';

//utils
import auth from '../../utils/auth';

//context data
import { LoggedInContext } from '../../pages/_app';

//styles
import style from '../../styles/pages/Feed.module.scss';

const Feed = ({ userId }) => {
  const router = useRouter();
  const { loggedInState } = useContext(LoggedInContext);

  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = React.useState([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = React.useState({});
  //tweetのfetch query
  const [tweetLoadState, setTweetLoadState] = useState('loading');
  const [fetchQuery, setFetchQuery] = useState({ userId: userId, skip: 0, take: 10 });
  const [hasMoreTweet, setHasMoreTweet] = useState(true);

  const fetchTweet = async () => {
    const queryParams = { skip: fetchQuery.skip, take: fetchQuery.take };
    const query = new URLSearchParams(queryParams);
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const requestUrl = baseRequestUrl + '/tweet/following_users_feed' + '?' + query;
    setTweetLoadState('loading');
    await fetch(requestUrl, {
      method: 'GET',
      mode: 'cors',
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
