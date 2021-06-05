import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

//components
import Profile from '../../components/profile/Profile';
import PostTweet from '../../components/tweet/PostTweet';
import TweetFeed from '../../components/tweet/TweetFeed';
//utils
import auth from '../../utils/auth';

//context data
import { AuthUserContext } from '../_app';
import { LoggedInContext } from '../../pages/_app';

const UserPage = ({ userId }) => {
  const { loggedInState } = useContext(LoggedInContext);

  const { authUserData } = useContext(AuthUserContext);
  const loggedin_userID = authUserData.id;

  const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = useState([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = useState(0);
  //tweetのfetch query
  const [tweetLoadState, setTweetLoadState] = useState('loading');
  const [fetchQuery, setFetchQuery] = useState({ userId: userId, skip: 0, take: 10 });
  const [hasMoreTweet, setHasMoreTweet] = useState(true);

  const fetchTweet = async () => {
    const queryParams = { skip: fetchQuery.skip, take: fetchQuery.take };
    const query = new URLSearchParams(queryParams);
    const requestUrl = baseRequestUrl + '/tweet/user/' + fetchQuery.userId + '?' + query;
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

  //did mount 初期表示tweetデータ
  //user→user切り替え時にリフレッシュ
  React.useEffect(() => {
    const freshQuery = { skip: 0, take: 10 };
    setFetchQuery({ userId: userId, skip: 0, take: 10 });

    fetchTweet();

    const queryParams = { skip: freshQuery.skip, take: freshQuery.take };
    const query = new URLSearchParams(queryParams);
    const requestUrl = baseRequestUrl + '/tweet/user/' + fetchQuery.userId + '?' + query;
    setTweetLoadState('loading');
    fetch(requestUrl, {
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
        setDisplayTweets([...json]);
        setTweetLoadState('complete');
        setHasMoreTweet(json.length > 0);
      });
  }, [TweetPostState, userId]);

  return (
    <>
      <Head>
        <title>User Page</title>
      </Head>
      <Profile userId={userId}></Profile>
      {loggedInState && loggedin_userID == userId && (
        <PostTweet
          TweetPostState={TweetPostState}
          setTweetPostState={setTweetPostState}
        ></PostTweet>
      )}
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
  );
};
export async function getServerSideProps({ query }) {
  const { userId } = query;
  return { props: { userId } };
}

export default UserPage;
