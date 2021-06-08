import React, { useContext, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import auth from '../../utils/auth';
//context
import { LoggedInContext } from '../../pages/_app';
import { AuthUserContext } from '../../pages/_app';

//style
import navStyle from './Navigation.module.scss';
import { fetchAutoCompleteData } from 'src/service/autoComplete/autoComplete.service';
import { TempTickersType } from 'src/type/tempTickers.type';
import { InitialUserData } from 'src/type/UserDataType';

type NavigationProps = {
  spMenuState: boolean;
  // eslint-disable-next-line no-unused-vars
  setSpMenuState: React.Dispatch<React.SetStateAction<boolean>>;
};

const Navigation = ({ spMenuState, setSpMenuState }: NavigationProps) => {
  const router = useRouter();
  const { loggedInState, setLoggedInState } = useContext(LoggedInContext);

  const { authUserData, setAuthUserData } = useContext(AuthUserContext);
  const loggedin_userID = authUserData.id;
  const [tickerInput, setTickerInput] = useState<string>('');
  const [TickerOptions, setTickerOptions] = useState<TempTickersType[]>([]);
  const [SpSearchWindow, setSpSearchWindow] = useState(false);
  //ref
  const tickerRef = useRef<HTMLInputElement>(null);

  const logoutHandler = () => {
    auth.logout();
    setAuthUserData(InitialUserData);
    setLoggedInState(auth.isAuthenticated());
    router.push('/');
  };

  const spSearchTrigger = () => {
    setSpSearchWindow(!SpSearchWindow);
    if (!SpSearchWindow) {
      tickerRef.current?.focus();
    }
  };

  //sp-menu state
  const SpMenuHandler = () => {
    setSpMenuState(!spMenuState);
  };
  //clear ticker
  const clearTickerInput = () => {
    setTickerOptions([]);
    setTickerInput('');
  };

  //ticker autocomplete検索

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
  }, [tickerInput]);

  return (
    <>
      <h1 className={navStyle['page-title']}>
        <Link href="/">Buzz Stock .com</Link>
        <div className={navStyle['sp-search-trigger']} onClick={spSearchTrigger}></div>
      </h1>
      <nav className={navStyle['auth-nav']}>
        <div className={`${navStyle['search-ticker-pc']}`}>
          <div className="ticker-input-wrap">
            <input
              autoComplete="off"
              list="search-ticker-option-list"
              type="text"
              name="tickers"
              id="search-tickers-input"
              className={navStyle['search-ticker-input']}
              onChange={(e) => setTickerInput(e.target.value)}
              ref={tickerRef}
              value={tickerInput}
              placeholder="銘柄検索"
            />
            <div className={navStyle['ticker-options-container']}>
              {TickerOptions.length > 0 &&
                TickerOptions.map((tickerOption, index) => (
                  <Link key={index} href={`/quote/${tickerOption.ticker}`}>
                    <div className={navStyle['ticker-option-item']} onClick={clearTickerInput}>
                      <span className={navStyle['ticker-option-name']}>
                        {tickerOption.optionName}
                      </span>
                      <span className={navStyle['ticker-option-symbol']}>
                        {tickerOption.ticker}
                      </span>
                      <span className={navStyle['ticker-option-exchange']}>
                        {tickerOption.optionExchange}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

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
            spMenuState && navStyle['sp-menu-trigger-active']
          }`}
        >
          <div className={navStyle['sp-menu-trigger-border']}></div>
        </div>
        <div className={`${navStyle['sp-menu']} ${spMenuState && navStyle['sp-menu-active']}`}>
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
            ref={tickerRef}
            className={navStyle['search-ticker-input']}
            onChange={(e) => setTickerInput(e.target.value)}
            value={tickerInput}
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
