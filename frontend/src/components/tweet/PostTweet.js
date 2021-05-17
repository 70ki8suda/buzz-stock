import React, { useState, useEffect, useContext } from 'react';
//context data
import { AuthUserData } from '../../pages/_app';
import { LoggedInContext } from '../../pages/_app';
//env
const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
//style
import postStyle from './PostTweet.module.scss';

const PostTweet = ({ TweetPostState, setTweetPostState, defaultTicker }) => {
  const { AuthUserProfile } = useContext(AuthUserData);
  const { LoggedInState } = useContext(LoggedInContext);
  const profile_image_url = AuthUserProfile.profile_image_url;
  //tweetデータ
  const [TweetPostData, setTweetPostData] = React.useState({});
  //ticker State
  const [TickerOptions, setTickerOptions] = React.useState([]);
  //ticker data
  const [TickerData, setTickerData] = React.useState([defaultTicker]);
  React.useEffect(() => {
    defaultTicker == undefined ? setTickerData([]) : setTickerData([defaultTicker]);
  }, [TweetPostState, defaultTicker]);
  const handlePostChange = (e) => {
    const target = e.target;
    const name = target.name;
    setTweetPostData(() => {
      return { ...TweetPostData, [name]: target.value };
    });
  };

  const handleTickerInput = async function (e) {
    //連続でautocomplete検索起動するのを防ぐフラグ
    let handleTickerInputFlag = true;
    //timer関数
    const timer = function () {
      setTimeout(function () {
        handleTickerInputFlag = true;
      }, 200);
    };
    const target = e.target;
    let searchQuery = target.value;
    const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
    const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;
    if (handleTickerInputFlag) {
      //timer 一回リセット,フラグ->false,再起動
      clearTimeout(timer);
      handleTickerInputFlag = false;
      timer();
      //autocomplete search処理
      //autocomplete option 初期化
      setTickerOptions([]);
      //関数内利用
      let tempTickers = [];
      //autocomplete fetch
      fetch(
        `https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete?q=${searchQuery}&region=US`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
          },
        },
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.quotes != undefined) {
            if (data.quotes.length > 0) {
              data.quotes.map((quote) => {
                let optionText = quote.symbol + '  ' + quote.shortname + '  ' + quote.exchange;
                tempTickers.push({ optionText: optionText, ticker: quote.symbol });
              });
              setTickerOptions(tempTickers);
            }
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
    //autocomplete選択時処理
    let selectedOption;
    let autocompleteSelected = (inputValue) => {
      let optionsData = document.getElementById('ticker-option-list');
      for (let i = 0; i < optionsData.options.length; i++) {
        if (inputValue == optionsData.options[i].value) {
          selectedOption = optionsData.options[i].getAttribute('data-ticker');
          return true;
        }
      }
      return false;
    };
    if (autocompleteSelected(target.value)) {
      setTickerData([...TickerData, selectedOption]);
      target.value = '';
    }
  };
  const handleTickerDelete = (e) => {
    const target = e.target;
    //* 1文字目の#を削除
    const deleteValue = target.textContent.slice(1);

    setTickerData(TickerData.filter((t) => t !== deleteValue));
  };
  const setTweetImageFile = (e) => {
    e.preventDefault();
    let size_in_megabytes = e.target.files[0].size / 1024 / 1024;

    if (size_in_megabytes > 1) {
      alert('Maximum file size is 1MB. Please choose a smaller file.');
      setTweetPostData({ tweet_image: null, imageSelected: false });
      document.getElementById('tweet-image-input').value = '';
      return;
    }

    setTweetPostData({ ...TweetPostData, tweet_image: e.target.files[0], imageSelected: true });
  };

  //post tweet request
  async function PostTweet(e) {
    e.preventDefault();
    const { tweet_text, tweet_image } = TweetPostData;
    let tickers = TickerData.join(',');
    if (tickers.length === 0) {
      tickers = null;
    }
    let formData = new FormData();
    formData.append('content', tweet_text);
    if (tweet_image !== undefined) {
      formData.append('image', tweet_image);
    }
    if (tickers !== null) {
      formData.append('tickers', tickers);
    }
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const create_tweet_api_path = baseRequestUrl + '/tweet';

    await fetch(create_tweet_api_path, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      body: formData,
    })
      .then((res) => {
        console.log(res);
        setTweetPostState(TweetPostState + 1);
      })
      .then(() => {
        //input textarea空にする
        setTweetPostData({
          tweet_text: null,
          image: null,
          imageSelected: false,
          tickers: null,
        });
        const tweetInput = document.querySelectorAll('[data-input="tweet-input"]');

        for (const input of tweetInput) {
          input.value = '';
        }
      })

      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return (
    <div className={`${postStyle['post-tweet']} ${!LoggedInState && postStyle['not-loggedin']}`}>
      <div className={postStyle['profile-image-wrap']}>
        {profile_image_url != null ? (
          <img src={profile_image_url} />
        ) : (
          <img src="/images/profile-default.png" />
        )}
      </div>
      <form className={postStyle['post-tweet-form']}>
        <div className={postStyle['input-wrap']}>
          <textarea
            className={postStyle['tweet-text-input']}
            onChange={handlePostChange}
            name="tweet_text"
            cols="30"
            rows="3"
            data-input="tweet-input"
          ></textarea>
          <div className={`form-item ${postStyle['ticker-box']}`}>
            <label htmlFor="tickers-input" className={postStyle['ticker-label']}>
              Tickers
            </label>
            <input
              autoComplete="off"
              list="ticker-option-list"
              type="text"
              name="tickers"
              id="tickers-input"
              onChange={handleTickerInput}
            />
          </div>
          <datalist id="ticker-option-list">
            {TickerOptions.map((ticker, i) => (
              <option key={i} data-ticker={ticker.ticker}>
                {ticker.optionText}
              </option>
            ))}
          </datalist>
          <div className={postStyle['ticker-container']}>
            {TickerData.length > 0 &&
              TickerData.map((ticker, j) => (
                <p key={j} className={postStyle['ticker']} onClick={handleTickerDelete}>
                  #{ticker}
                </p>
              ))}
          </div>
          <div className={postStyle['push-interface']}>
            <div className={`image-input-wrap ${postStyle['tweet-post-image']}`}>
              <label
                htmlFor="tweet-image-input"
                className={`image-input-label ${postStyle['image-input-label']} ${
                  TweetPostData.imageSelected ? 'active' : ''
                }`}
              ></label>
              <input
                type="file"
                id="tweet-image-input"
                name="tweet_image"
                accept="image/png,image/jpeg"
                onChange={setTweetImageFile}
                data-input="tweet-input"
                className="image-input"
              />
            </div>
            <button className="submit-btn" onClick={(e) => PostTweet(e)}>
              投稿
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostTweet;
