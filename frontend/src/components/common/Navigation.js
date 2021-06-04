import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import auth from '../../utils/auth';
//context
import { LoggedInContext } from '../../pages/_app';
import { AuthUserContext } from '../../pages/_app';
import { SpMenuContext } from '../../pages/_app';
//style
import navStyle from './Navigation.module.scss';
const Navigation = () => {
  const router = useRouter();
  const { loggedInState, setLoggedInState } = useContext(LoggedInContext);

  const { authUserData, setAuthUserData } = useContext(AuthUserContext);
  const { SpMenuState, setSpMenuState } = useContext(SpMenuContext);
  //ref
  let searchTickersSp;
  const [SpSearchWindow, setSpSearchWindow] = useState(false);
  const loggedin_userID = authUserData.id;

  const logoutHandler = () => {
    auth.logout();
    setAuthUserData({});
    setLoggedInState(auth.isAuthenticated());
    router.push('/');
  };

  const spSearchTrigger = () => {
    setSpSearchWindow(!SpSearchWindow);
    if (!SpSearchWindow) {
      searchTickersSp.focus();
    }
  };

  //sp-menu state
  const SpMenuHandler = () => {
    setSpMenuState(!SpMenuState);
  };
  //ticker State
  const [TickerOptions, setTickerOptions] = React.useState([]);

  const handleSearchTickerInput = async function (e) {
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
      let optionsData = document.getElementById('search-ticker-option-list');
      for (let i = 0; i < optionsData.options.length; i++) {
        if (inputValue == optionsData.options[i].value) {
          selectedOption = optionsData.options[i].getAttribute('data-ticker');
          return true;
        }
      }
      return false;
    };
    if (autocompleteSelected(target.value)) {
      router.push(`/quote/${selectedOption}`);
      target.value = '';
    }
  };
  return (
    <>
      <h1 className={navStyle['page-title']}>
        <Link href="/">Buzz Stock .com</Link>
        <div className={navStyle['sp-search-trigger']} onClick={spSearchTrigger}></div>
      </h1>
      <nav className={navStyle['auth-nav']}>
        <div className={`${navStyle['search-ticker-pc']}`}>
          <input
            autoComplete="off"
            list="search-ticker-option-list"
            type="text"
            name="tickers"
            id="search-tickers-input"
            className={navStyle['search-ticker-input']}
            onChange={handleSearchTickerInput}
            placeholder="銘柄検索"
          />
        </div>
        <datalist id="search-ticker-option-list">
          {TickerOptions.map((ticker, i) => (
            <option key={i} data-ticker={ticker.ticker}>
              {ticker.ticker} {ticker.optionExchange} {ticker.optionName}
            </option>
          ))}
        </datalist>
        <ul className={navStyle['auth-nav-list-pc']}>
          {loggedInState ? (
            <>
              <li className={navStyle['auth-nav-item']}>
                <Link href={`/user/${loggedin_userID}`}>Profile</Link>
              </li>
              <li className={navStyle['auth-nav-item']}>
                <Link href="/user/feed">Feed</Link>
              </li>
              <li className={navStyle['auth-nav-item']}>
                <span className="auth-nav-logout" onClick={logoutHandler}>
                  Log Out
                </span>
              </li>
            </>
          ) : (
            <>
              <li className={navStyle['auth-nav-item']}>
                <Link href="/account/login">Log In</Link>
              </li>
              <li className={navStyle['auth-nav-item']}>
                <Link href="/account/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
        <div
          onClick={SpMenuHandler}
          className={`${navStyle['sp-menu-trigger']} ${
            SpMenuState && navStyle['sp-menu-trigger-active']
          }`}
        >
          <div className={navStyle['sp-menu-trigger-border']}></div>
        </div>
        <div className={`${navStyle['sp-menu']} ${SpMenuState && navStyle['sp-menu-active']}`}>
          <ul className={navStyle['auth-nav-list-sp']}>
            {loggedInState ? (
              <>
                <li className={navStyle['auth-nav-item']} onClick={SpMenuHandler}>
                  <Link href={`/user/${loggedin_userID}`}>Profile</Link>
                </li>
                <li className={navStyle['auth-nav-item']} onClick={SpMenuHandler}>
                  <Link href="/user/feed">Feed</Link>
                </li>
                <li className={navStyle['auth-nav-item']} onClick={SpMenuHandler}>
                  <span className="auth-nav-logout" onClick={logoutHandler}>
                    Log Out
                  </span>
                </li>
              </>
            ) : (
              <>
                <li className={navStyle['auth-nav-item']} onClick={SpMenuHandler}>
                  <Link href="/account/login">Log In</Link>
                </li>
                <li className={navStyle['auth-nav-item']} onClick={SpMenuHandler}>
                  <Link href="/account/signup">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <div
        className={`${navStyle['sp-search-window']}  ${
          SpSearchWindow && navStyle['sp-search-window-active']
        }`}
      >
        <div className={navStyle['search-window-top']}>
          <div className={navStyle['search-window-back']} onClick={spSearchTrigger}></div>
          <input
            autoComplete="off"
            type="text"
            name="tickers"
            ref={(input) => {
              searchTickersSp = input;
            }}
            className={navStyle['search-ticker-input']}
            onChange={handleSearchTickerInput}
            placeholder="銘柄検索"
          />
        </div>

        {TickerOptions.length > 0 &&
          TickerOptions.map((tickerOption, index) => (
            <Link key={index} href={`/quote/${tickerOption.ticker}`}>
              <div className={navStyle['sp-ticker-option-item']} onClick={spSearchTrigger}>
                <span className={navStyle['sp-ticker-option-name']}>{tickerOption.optionName}</span>
                <span className={navStyle['sp-ticker-option-symbol']}>{tickerOption.ticker}</span>
                <span className={navStyle['sp-ticker-option-exchange']}>
                  {tickerOption.optionExchange}
                </span>
              </div>
            </Link>
          ))}
      </div>
    </>
  );
};

export default Navigation;
