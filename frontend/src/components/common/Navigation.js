import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import auth from '../../utils/auth';
//context
import { LoggedInContext } from '../../pages/_app';
import { AuthUserData } from '../../pages/_app';
import { SpMenuContext } from '../../pages/_app';
//style
import navStyle from './Navigation.module.scss';
const Navigation = () => {
  const router = useRouter();
  const { LoggedInState, setLoggedInState } = useContext(LoggedInContext);

  const { AuthUserProfile } = useContext(AuthUserData);
  const { SpMenuState, setSpMenuState } = useContext(SpMenuContext);
  const loggedin_userID = AuthUserProfile.id;

  const logoutHandler = () => {
    auth.logout();
    setLoggedInState(auth.isAuthenticated());
    router.push('/');
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
        <span className={navStyle['border-edge']}></span>
        <span className={navStyle['border-edge2']}></span>
        <span className={navStyle['border-edge3']}></span>
        <span className={navStyle['border-edge4']}></span>
        <span className={navStyle['border-edge5']}></span>
      </h1>
      <nav className={navStyle['auth-nav']}>
        <div className={`${navStyle['search-ticker']}`}>
          <input
            autoComplete="off"
            list="search-ticker-option-list"
            type="text"
            name="tickers"
            id="search-tickers-input"
            className={navStyle['search-ticker-input']}
            onChange={handleSearchTickerInput}
          />
        </div>
        <datalist id="search-ticker-option-list">
          {TickerOptions.map((ticker, i) => (
            <option key={i} data-ticker={ticker.ticker}>
              {ticker.optionText}
            </option>
          ))}
        </datalist>
        <ul className={navStyle['auth-nav-list-pc']}>
          {LoggedInState ? (
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
            {LoggedInState ? (
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
        </div>
      </nav>
    </>
  );
};

export default Navigation;
