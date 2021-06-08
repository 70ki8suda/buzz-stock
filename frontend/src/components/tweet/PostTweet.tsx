import React, { useState, useEffect, useContext, useRef } from 'react';
//context data
import { AuthUserContext } from '../../pages/_app';
import { LoggedInContext } from '../../pages/_app';
//style
import postStyle from './PostTweet.module.scss';
//utils
import TweetValidator from '../../utils/tweetValidator';
//type
import { TempTickersType } from 'src/type/tempTickers.type';
import { initialTweetPostState, TweetPostType } from 'src/type/TweetPost.type';
import { fetchAutoCompleteData } from 'src/service/autoComplete/autoComplete.service';
import { PostTweetAction } from 'src/service/tweet/postTweet.service';

type Props = {
  TweetPostState: number;
  setTweetPostState: React.Dispatch<React.SetStateAction<number>>;
  defaultTicker: string | undefined;
};

const PostTweet = ({ TweetPostState, setTweetPostState, defaultTicker }: Props) => {
  //context
  const { authUserData } = useContext(AuthUserContext);
  const { loggedInState } = useContext(LoggedInContext);
  const profile_image = authUserData.profile_image;
  //tweetデータ
  const [TweetPostData, setTweetPostData] = useState<TweetPostType>(initialTweetPostState);
  //ticker State
  const [tickerInput, setTickerInput] = useState<string>('');
  const [TickerOptions, setTickerOptions] = useState<TempTickersType[]>([]);
  //ticker data
  const [TickerData, setTickerData] = useState([defaultTicker]);
  const [messages, setMessages] = useState({
    tweet_text: '',
    tweet_image: '',
  });

  useEffect(() => {
    //デフォルトのTickerセット
    defaultTicker == undefined ? setTickerData([]) : setTickerData([defaultTicker]);
  }, [TweetPostState, defaultTicker]);

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    setTweetPostData(() => {
      return { ...TweetPostData, [name]: target.value };
    });

    setMessages(() => {
      //console.log(messages);
      return { ...messages, [name]: TweetValidator.validate(name, value) };
    });
  };

  //ticker autocomplete検索
  const tickerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    //連続でautocomplete検索するのを防ぐ
    setTimeout(() => {
      if (tickerInput === '') {
        setTickerOptions([]);
      }
      if (
        tickerInput === tickerRef.current?.value &&
        tickerInput !== undefined &&
        tickerInput !== ''
      ) {
        const searchQuery = tickerInput;

        //autocomplete search処理
        //autocomplete option 初期化
        setTickerOptions([]);
        //関数内利用
        const tempTickers: any[] = [];
        //autocomplete fetch
        const fetchAutoComplete = async (searchQuery: string) => {
          const tickerOptions = await fetchAutoCompleteData(searchQuery);
          if (tickerOptions && tickerOptions.quotes !== undefined) {
            if (tickerOptions.quotes.length > 0) {
              tickerOptions.quotes.map((quote: any) => {
                const optionExchange = quote.exchange;
                const optionName = quote.shortname;

                tempTickers.push({
                  optionName: optionName,
                  optionExchange: optionExchange,
                  ticker: quote.symbol,
                });
              });
              setTickerOptions(tempTickers);
            }
          }
        };
        fetchAutoComplete(searchQuery);
      }
    }, 300);
  }, [tickerInput, TickerData]);

  const addTicker = function (ticker: string) {
    if (!TickerData.includes(ticker)) {
      setTickerData([...TickerData, ticker]);
      setTickerInput('');
    }
  };

  const deleteTicker = (e: React.MouseEvent<HTMLParagraphElement>) => {
    const target = e.currentTarget;
    //* 1文字目の#を削除
    const setValue = target.dataset.ticker;

    setTickerData(TickerData.filter((t) => t !== setValue));
  };

  const setTweetImageFile = (targetImage: any) => {
    const image = targetImage;
    if (image !== null) {
      const size_in_megabytes = image.size / 1024 / 1024;

      if (size_in_megabytes > 5) {
        setMessages({
          ...messages,
          tweet_image: 'ファイルの上限サイズは5MBです',
        });
        setTweetPostData({ ...TweetPostData, tweet_image: null, imageSelected: false });
        (document.getElementById('tweet-image-input')! as HTMLInputElement).value = '';
        (document.getElementById('tweet-image-input-sp')! as HTMLInputElement).value = '';
        return;
      }

      setTweetPostData({ ...TweetPostData, tweet_image: image, imageSelected: true });
    }
  };

  //sp tweet ui

  const [SpTweetWindow, setSpTweetWindow] = React.useState(false);
  const tweetTextSp = useRef<HTMLTextAreaElement>(null);
  const spTweetTrigger = () => {
    setSpTweetWindow(!SpTweetWindow);
    if (!SpTweetWindow) {
      tweetTextSp.current?.focus();
    }
  };

  //post tweet request
  async function PostTweet(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const { tweet_text, tweet_image } = TweetPostData;
    let tickers = TickerData.join(',');

    if (tickers.length === 0) {
      tickers = '';
    }
    const formData = new FormData();
    formData.append('content', tweet_text);

    if (tickers.length !== 0) {
      formData.append('tickers', tickers);
    }
    if (tweet_image !== undefined) {
      formData.append('tweet_image', tweet_image);
    }

    if (tweet_text) {
      const postTweet = async (formData: FormData) => {
        await PostTweetAction(formData);
        setTweetPostData({
          tweet_text: '',
          tweet_image: null,
          imageSelected: false,
        });
        setTickerData([defaultTicker]);
        const tweetInput = document.querySelectorAll('[data-input="tweet-input"]');
        for (const input of tweetInput as any) {
          input.value = '';
        }
        setMessages({
          tweet_text: '',
          tweet_image: '',
        });
        setTweetPostState(TweetPostState + 1);
        setSpTweetWindow(false);
      };
      postTweet(formData);
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
          !loggedInState && postStyle['not-loggedin']
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
              data-input="tweet-input"
            ></textarea>
            <div className={`form-item ${postStyle['ticker-box']}`}>
              <label htmlFor="tickers-input" className={postStyle['ticker-label']}>
                Tickers
              </label>
              <div className="ticker-input-wrap">
                <input
                  autoComplete="off"
                  list="ticker-option-list"
                  type="text"
                  name="tickers"
                  id="tickers-input"
                  onChange={(e) => setTickerInput(e.target.value)}
                  ref={tickerRef}
                  value={tickerInput}
                />
                <div className={postStyle['ticker-options-container']}>
                  {TickerOptions.length > 0 &&
                    TickerOptions.map((tickerOption, index) => (
                      <div
                        className={postStyle['ticker-option-item']}
                        onClick={() => addTicker(tickerOption.ticker)}
                        key={index}
                      >
                        <span className={postStyle['ticker-option-name']}>
                          {tickerOption.optionName}
                        </span>
                        <span className={postStyle['ticker-option-symbol']}>
                          {tickerOption.ticker}
                        </span>
                        <span className={postStyle['ticker-option-exchange']}>
                          {tickerOption.optionExchange}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className={postStyle['ticker-container']}>
              {TickerData.length > 0 &&
                TickerData.map((ticker, j) => (
                  <p
                    key={j}
                    data-ticker={ticker}
                    className={postStyle['ticker']}
                    onClick={deleteTicker}
                  >
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
                  onChange={(e) =>
                    setTweetImageFile(e.target.files !== null ? e.target.files[0] : null)
                  }
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
      {loggedInState && (
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
          <button className={postStyle['sp-ui-cancel']} onClick={spTweetTrigger}>
            Cancel
          </button>
          <button className={postStyle['sp-ui-post']} onClick={(e) => PostTweet(e)}>
            投稿
          </button>
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
            data-input="tweet-input"
            ref={tweetTextSp}
          ></textarea>
        </div>
        <div className={postStyle['ticker-container']}>
          {TickerData.length > 0 &&
            TickerData.map((ticker, j) => (
              <p key={j} className={postStyle['ticker']} onClick={deleteTicker}>
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
              onChange={(e) => setTickerInput(e.target.value)}
              ref={tickerRef}
              value={tickerInput}
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
                onClick={() => addTicker(tickerOption.ticker)}
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
