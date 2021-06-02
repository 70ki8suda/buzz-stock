import React, { useState, useEffect, useContext } from 'react';
//context data
import { AuthUserData } from '../../pages/_app';
import { LoggedInContext } from '../../pages/_app';
//env
//style
import postStyle from './PostTweet.module.scss';
//module
import auth from '../../utils/auth';

const PostTweet = ({ TweetPostState, setTweetPostState, defaultTicker }) => {
  const { AuthUserProfile } = useContext(AuthUserData);
  const { LoggedInState } = useContext(LoggedInContext);
  const profile_image = AuthUserProfile.profile_image;
  //tweetデータ
  const [TweetPostData, setTweetPostData] = React.useState({});
  //ticker State
  const [TickerOptions, setTickerOptions] = React.useState([]);
  //ticker data
  const [TickerData, setTickerData] = React.useState([defaultTicker]);
  const [messages, setMessages] = React.useState({
    tweet_text: '',
    tweet_image: '',
  });

  React.useEffect(() => {
    defaultTicker == undefined ? setTickerData([]) : setTickerData([defaultTicker]);
  }, [TweetPostState, defaultTicker]);

  const handlePostChange = (e) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    setTweetPostData(() => {
      return { ...TweetPostData, [name]: target.value };
    });

    setMessages(() => {
      //console.log(messages);
      return { ...messages, [name]: formValidate(name, value) };
    });
  };

  const formValidate = (name, value) => {
    switch (name) {
      case 'tweet_text':
        return tweetTextValidation(value);
    }
  };

  const tweetTextValidation = (text) => {
    //console.log(text);
    if (!text) return 'tweetを入力してください';
    if (text.length > 240) return 'tweetは240文字以下でお願いします';

    return '';
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
                let optionExchange = quote.exchange;
                let optionName = quote.shortname;

                tempTickers.push({
                  optionName: optionName,
                  optionExchange: optionExchange,
                  ticker: quote.symbol,
                });
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
      if (!TickerData.includes(selectedOption)) {
        setTickerData([...TickerData, selectedOption]);
      }
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

    if (size_in_megabytes > 5) {
      setMessages({
        ...messages,
        tweet_image: 'ファイルの上限サイズは5MBです',
      });
      setTweetPostData({ tweet_image: null, imageSelected: false });
      document.getElementById('tweet-image-input').value = '';
      document.getElementById('tweet-image-input-sp').value = '';
      return;
    }

    setTweetPostData({ ...TweetPostData, tweet_image: e.target.files[0], imageSelected: true });
  };

  //sp tweet ui
  let tweetTextSp;
  const [SpTweetWindow, setSpTweetWindow] = React.useState(false);
  const spTweetTrigger = () => {
    setSpTweetWindow(!SpTweetWindow);
    if (!SpTweetWindow) {
      tweetTextSp.focus();
    }
  };

  const spAddTicker = function (ticker) {
    if (!TickerData.includes(ticker)) {
      setTickerData([...TickerData, ticker]);
    }
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

    if (tickers !== null) {
      formData.append('tickers', tickers);
    }
    if (tweet_image !== undefined) {
      formData.append('tweet_image', tweet_image);
    }
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const create_tweet_api_path = baseRequestUrl + '/tweet';
    if (tweet_text) {
      await fetch(create_tweet_api_path, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: formData,
        headers: {
          Authorization: auth.bearerToken(),
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          //console.log(res);
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
          setMessages({
            tweet_text: '',
            tweet_image: '',
          });
          setTweetPostState(TweetPostState + 1);
        })

        .catch((error) => {
          console.error('Error:', error);
        });
      setSpTweetWindow(false);
    } else {
      setMessages({
        ...messages,
        tweet_text: 'tweetを入力してください',
      });
    }
  }

  return (
    <>
      <div
        className={`${postStyle['post-tweet']} ${postStyle['pc-ui']} ${
          !LoggedInState && postStyle['not-loggedin']
        }`}
      >
        <div className={postStyle['profile-image-wrap']}>
          {profile_image != null ? (
            <img src={profile_image} />
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
              id="tweetText"
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
                  {ticker.ticker} {ticker.optionExchange} {ticker.optionName}
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
            <div className={postStyle['validation-message-container']}>
              <p className={postStyle['validation-message']}>{messages.tweet_text}</p>
              <p className={postStyle['validation-message']}>{messages.tweet_image}</p>
            </div>
          </div>
        </form>
      </div>
      {LoggedInState && (
        <div className={postStyle['sp-post-trigger']} onClick={spTweetTrigger}>
          Post
        </div>
      )}
      <div
        className={`${postStyle['sp-ui-window']}  ${
          SpTweetWindow && postStyle['sp-ui-window-active']
        }`}
      >
        <div className={postStyle['sp-ui-top']}>
          <div className={postStyle['sp-ui-cancel']} onClick={spTweetTrigger}>
            Cancel
          </div>
          <div className={postStyle['sp-ui-post']} onClick={(e) => PostTweet(e)}>
            投稿
          </div>
        </div>
        <div className={postStyle['sp-tweet-input-container']}>
          <div className={postStyle['profile-image-wrap']}>
            {profile_image != null ? (
              <img src={profile_image} />
            ) : (
              <img src="/images/profile-default.png" />
            )}
          </div>
          <textarea
            className={postStyle['tweet-text-input']}
            onChange={handlePostChange}
            name="tweet_text"
            id="tweetTextSp"
            cols="30"
            rows="3"
            data-input="tweet-input"
            ref={(input) => {
              tweetTextSp = input;
            }}
          ></textarea>
        </div>
        <div className={postStyle['ticker-container']}>
          {TickerData.length > 0 &&
            TickerData.map((ticker, j) => (
              <p key={j} className={postStyle['ticker']} onClick={handleTickerDelete}>
                #{ticker}
              </p>
            ))}
        </div>
        <div className={postStyle['validation-message-container']}>
          <p className={postStyle['validation-message']}>{messages.tweet_text}</p>
          <p className={postStyle['validation-message']}>{messages.tweet_image}</p>
        </div>
        <div className={postStyle['sp-ticker-image-container']}>
          <div className={`form-item ${postStyle['ticker-box']}`}>
            <label htmlFor="tickers-input" className={postStyle['ticker-label']}>
              Tickers
            </label>
            <input
              className={postStyle['ticker-input']}
              autoComplete="off"
              type="text"
              name="tickers"
              id="tickers-input-sp"
              data-input="tweet-input"
              onChange={handleTickerInput}
            />
          </div>
          <div className={`image-input-wrap ${postStyle['tweet-post-image']}`}>
            <label
              htmlFor="tweet-image-input-sp"
              className={`image-input-label ${postStyle['image-input-label']} ${
                TweetPostData.imageSelected ? 'active' : ''
              }`}
            ></label>
            <input
              type="file"
              id="tweet-image-input-sp"
              name="tweet_image"
              accept="image/png,image/jpeg"
              onChange={setTweetImageFile}
              data-input="tweet-input"
              className="image-input"
            />
          </div>
        </div>

        <div className={postStyle['ticker-options-container']}>
          {TickerOptions.length > 0 &&
            TickerOptions.map((tickerOption, index) => (
              <div
                className={postStyle['sp-ticker-option-item']}
                onClick={() => spAddTicker(tickerOption.ticker)}
                key={index}
              >
                <span className={postStyle['sp-ticker-option-name']}>
                  {tickerOption.optionName}
                </span>
                <span className={postStyle['sp-ticker-option-symbol']}>{tickerOption.ticker}</span>
                <span className={postStyle['sp-ticker-option-exchange']}>
                  {tickerOption.optionExchange}
                </span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default PostTweet;
