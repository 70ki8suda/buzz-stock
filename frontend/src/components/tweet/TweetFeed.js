import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
//context data
import { AuthUserData } from '../../pages/_app';
import { LoggedInContext } from '../../pages/_app';
//components

//utils
import formatDate from '../../utils/format_date';
//style
import style from './TweetFeed.module.scss';
import FavStarSVG from '../../../public/images/star.svg';
//utils
import auth from '../../utils/auth';
const TweetFeed = ({ DisplayTweets, setTweetPostState, TweetPostState, setDisplayTweets }) => {
  const { AuthUserProfile } = useContext(AuthUserData);
  const loggedin_userID = AuthUserProfile.id;
  const { LoggedInState } = useContext(LoggedInContext);

  async function onTweetDeleteHandler(e, tweet_id) {
    e.preventDefault();
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_path = baseRequestUrl + '/tweet/' + tweet_id;
    console.log(api_path);

    await fetch(api_path, {
      method: 'DELETE',
      mode: 'cors',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: auth.bearerToken(),
      },
    })
      .then((res) => {
        setTweetPostState(TweetPostState + 1);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  let favoritedByUser = (tweet) => {
    let favorite = tweet.favorites.filter(function (favorite, index) {
      if (favorite.userId == loggedin_userID) return true;
    });
    if (favorite.length > 0) return true;
  };
  const FavoriteHandler = (e, tweet, i) => {
    if (LoggedInState) {
      //console.log(key.i);
      //favoriteを反転させる
      let tempTweetData = [...DisplayTweets];
      //backendにリクエスト送信して、データベースの値変える
      const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
      const api_path = baseRequestUrl + '/favorite/' + tweet.id;
      const tweet_favorites = tweet.favorites;
      if (favoritedByUser(tweet)) {
        //既にfavorite済みのとき
        const new_favorites = tweet_favorites.filter(function (favorite, index) {
          favorite.userId !== loggedin_userID;
        });
        tempTweetData[i].favorites = new_favorites;
        setDisplayTweets(tempTweetData);

        const requestOptions = {
          method: 'DELETE',
          mode: 'cors',
          withCredentials: true,
          credentials: 'include',
          headers: {
            Authorization: auth.bearerToken(),
          },
        };
        fetch(api_path, requestOptions)
          .then((response) => response.json())
          .then((data) => console.log(data));
      } else {
        //未favoriteのとき
        const new_favorites = [...tweet_favorites, { userId: loggedin_userID, tweetId: tweet.id }];
        tempTweetData[i].favorites = new_favorites;
        setDisplayTweets(tempTweetData);
        const requestOptions = {
          method: 'POST',
          mode: 'cors',
          withCredentials: true,
          credentials: 'include',
          headers: {
            Authorization: auth.bearerToken(),
          },
        };
        fetch(api_path, requestOptions)
          .then((response) => response.json())
          .then((data) => console.log(data));
      }
    }
  };
  return (
    <div className={style['tweet-container']}>
      {DisplayTweets && DisplayTweets.length > 0 ? (
        DisplayTweets.map((tweet, i) => (
          <div key={i} id={tweet.id} className={style['tweet-box']}>
            <div className={style['profile-image-wrap']}>
              <Link href={`/user/${tweet.user.id}`}>
                {tweet.user.profile_image !== null ? (
                  <img src={tweet.user.profile_image.url} />
                ) : (
                  <img src="/images/profile-default.png" />
                )}
              </Link>
            </div>
            <div className={style['tweet-content']}>
              <div className={style['profile-info-top']}>
                <h2 className={style['profile-name']}>{tweet.user.name}</h2>
                <div className={style['display-id']}> @{tweet.user.display_id}</div>
                <div className={style['tweet-date']}>{formatDate(tweet.created_at)}</div>
              </div>
              <div> {tweet.content}</div>
              {tweet.tweet_image != null && (
                <div className={style['tweet-image']}>
                  <img src={tweet.tweet_image.url} />
                </div>
              )}
              <div className={style['ticker-container']}>
                {tweet.tickers !== undefined &&
                  tweet.tickers.length > 0 &&
                  tweet.tickers.map((ticker, j) => (
                    <Link href={`/quote/${ticker.name}`} key={j}>
                      <span className={style['ticker']}>#{ticker.name}</span>
                    </Link>
                  ))}
              </div>

              <div className={style['fav-container']}>
                <div className={style['fav-wrapper']}>
                  <FavStarSVG
                    onClick={(e) => FavoriteHandler(e, tweet, i)}
                    className={`${style['fav-star']} ${
                      favoritedByUser(tweet) && style['fav-star--favorited']
                    }`}
                  />
                </div>
                <span className={style['fav-num']}>{tweet.favorites.length}</span>
              </div>
              {tweet.user.id == loggedin_userID && (
                <button
                  className={style['delete-btn']}
                  onClick={(e) => onTweetDeleteHandler(e, tweet.id)}
                >
                  削除
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className={style['no-tweet-yet']}>
          No Tweet about this stock yet
          <br />
          この株式に関するツイートはまだありません
        </div>
      )}
    </div>
  );
};

export default TweetFeed;
