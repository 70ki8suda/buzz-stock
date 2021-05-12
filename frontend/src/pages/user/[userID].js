import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

//components
import Profile from '../../components/tweet/Profile';
import PostTweet from '../../components/tweet/PostTweet';
import TweetFeed from '../../components/tweet/TweetFeed';
//utils
import auth from '../../utils/auth';

//context data
import { AuthUserData } from '../_app';

const UserPage = ({ userID }) => {
  const router = useRouter();
  const isloggedIn = auth.isAuthenticated();

  const { AuthUserProfile } = useContext(AuthUserData);
  const loggedin_userID = AuthUserProfile.id;

  const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
  const get_tweets_path = baseRequestUrl + '/api/v1/user/tweets/' + userID;
  //表示するtweetのデータ
  const [DisplayTweets, setDisplayTweets] = React.useState([]);
  //Tweetをpost/delete時に状態更新する状態関数
  const [TweetPostState, setTweetPostState] = React.useState({});

  //did mount 初期表示tweetデータ
  React.useEffect(
    (TweetPostState, userID) => {
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
          setDisplayTweets(json.data);
        });
    },
    [TweetPostState, userID],
  );

  return (
    <>
      <Head>
        <title>User Page</title>
      </Head>
      <Profile userID={userID}></Profile>
      {isloggedIn && loggedin_userID == userID && (
        <PostTweet setTweetPostState={setTweetPostState}></PostTweet>
      )}
      <TweetFeed
        DisplayTweets={DisplayTweets}
        setDisplayTweets={setDisplayTweets}
        setTweetPostState={setTweetPostState}
      ></TweetFeed>
    </>
  );
};
export async function getServerSideProps({ query }) {
  const { userID } = query;
  return { props: { userID } };
}

export default UserPage;
