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

  //未ログインならログインページへリダイレクト
  React.useEffect(() => {
    if (!LoggedInState) {
      router.replace('/account/login');
    }
  });

  //did mount 初期表示tweetデータ
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
          console.log(json);
          setDisplayTweets(json);
        });
    },
    [TweetPostState],
  );

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
            DisplayTweets={DisplayTweets}
            setDisplayTweets={setDisplayTweets}
            setTweetPostState={setTweetPostState}
          ></TweetFeed>
        </>
      )}
    </>
  );
};

export default Feed;
