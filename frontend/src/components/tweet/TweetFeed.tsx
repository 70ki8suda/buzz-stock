import React, { useContext, useRef, useCallback } from 'react';
import Link from 'next/link';
//context data
import { AuthUserContext } from '../../pages/_app';
import { LoggedInContext } from '../../pages/_app';
//components

//utils
import formatDate from '../../utils/format_date';
//style
import style from './TweetFeed.module.scss';
import FavStarSVG from '../../../public/images/star.svg';
//utils
import { TweetFeedProps } from 'src/type/TweetFeedProps';
import { TickerType } from 'src/type/Ticker.type';
import { TweetType } from 'src/type/Tweet.type';
import { deleteTweetRequest } from 'src/service/tweet/deleteTweet.service';
import { favoriteTweetAction, unfavoriteTweetAction } from 'src/service/tweet/favorite.service';
const TweetFeed = ({
  tweetLoadState,
  DisplayTweets,
  setDisplayTweets,
  TweetPostState,
  setTweetPostState,
  fetchTweet,
  fetchQuery,
  hasMoreTweet,
}: TweetFeedProps) => {
  const { authUserData } = useContext(AuthUserContext);
  const loggedin_userID = authUserData.id;
  const { loggedInState } = useContext(LoggedInContext);

  const observer = useRef<IntersectionObserver>();

  //最下部のtweetまでスクロールしたらfetch,無限スクロール
  const lastTweetElement = useCallback(
    (node) => {
      if (tweetLoadState == 'loading') return;
      if (observer.current) observer.current!.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreTweet) {
          console.log('Load More Tweet');
          fetchQuery.skip = fetchQuery.skip + 10;
          fetchTweet();
        }
      });
      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tweetLoadState, hasMoreTweet],
  );

  async function onTweetDeleteHandler(e: React.MouseEvent<HTMLButtonElement>, tweet_id: number) {
    e.preventDefault();

    const deleteTweetAction = async (tweet_id: number) => {
      await deleteTweetRequest(tweet_id);
      setDisplayTweets(DisplayTweets.filter((tweet) => tweet.id !== tweet_id));
      setTweetPostState(TweetPostState + 1);
    };
    deleteTweetAction(tweet_id);
  }
  const favoritedByUser = (tweet: TweetType): boolean | void => {
    const favorite = tweet.favorites.filter(function (favorite) {
      if (favorite.userId == loggedin_userID) return true;
    });
    if (favorite.length > 0) return true;
  };
  const FavoriteHandler = (e: React.MouseEvent<HTMLInputElement>, tweet: TweetType, i: number) => {
    if (loggedInState) {
      e.preventDefault();

      const tempTweetData = [...DisplayTweets];
      const tweet_favorites = tweet.favorites;

      if (favoritedByUser(tweet)) {
        //既にfavorite済みのとき:DELETE
        const new_favorites = tweet_favorites.filter(function (favorite) {
          favorite.userId !== loggedin_userID;
        });
        tempTweetData[i].favorites = new_favorites;
        setDisplayTweets(tempTweetData);
        unfavoriteTweetAction(tweet.id);
      } else {
        //未favoriteのとき:POST
        const new_favorites = [...tweet_favorites, { userId: loggedin_userID, tweetId: tweet.id }];
        tempTweetData[i].favorites = new_favorites;
        setDisplayTweets(tempTweetData);
        favoriteTweetAction(tweet.id);
      }
    }
  };
  return (
    <div className={style['tweet-container']}>
      {tweetLoadState === 'loading' && <div className={style['loading-tweet']}></div>}
      {DisplayTweets && DisplayTweets.length > 0 ? (
        DisplayTweets.map((tweet, i) => (
          <div
            key={i}
            id={tweet.id}
            className={style['tweet-box']}
            {...(i + 1 === DisplayTweets.length && { ref: lastTweetElement })}
          >
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
              <div className={style['tweet-text']}> {tweet.content}</div>
              {tweet.tweet_image != null && (
                <div className={style['tweet-image']}>
                  <img src={tweet.tweet_image.url} />
                </div>
              )}
              <div className={style['ticker-container']}>
                {tweet.tickers !== undefined &&
                  tweet.tickers.length > 0 &&
                  tweet.tickers.map((ticker: TickerType, j: number) => (
                    <Link href={`/quote/${ticker.name}`} key={j}>
                      <span className={style['ticker']}>#{ticker.name}</span>
                    </Link>
                  ))}
              </div>

              <div className={style['fav-container']}>
                <div className={style['fav-wrapper']}>
                  <FavStarSVG
                    onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                      FavoriteHandler(e, tweet, i)
                    }
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
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    onTweetDeleteHandler(e, tweet.id)
                  }
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
