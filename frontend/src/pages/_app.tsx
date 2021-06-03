import React, { createContext, useState, useEffect } from 'react';
import Router from 'next/router';
import Head from 'next/head';
import { AppProps } from 'next/dist/next-server/lib/router/router';
//utils
import auth from '../utils/auth';
import { getWindowWidth } from 'src/utils/getWindowWidth';
//components
import Navigation from '../components/common/Navigation';
import Loader from '../components/common/Loader';
import Footer from '../components/common/Footer';
//style
import '../styles/globals.scss';
//types
import { UserDataType } from '../type/UserDataType';
import { LoggedInContextType } from '../type/LoggedInContextType';
import { AuthUserContextType } from '../type/AuthUserContextType';
import { SpMenuContextType } from '../type/SpMenuContextType';
import { getAuthUserData } from 'src/service/auth/auth.service';

//AuthUserData 初期値
const initialAuthUserData: UserDataType = {
  id: 0,
  display_id: '',
  email: '',
  followers_num: 0,
  following_num: 0,
  following: 0,
  introduction: '',
  name: '',
  profile_image: '',
};
//context
export const LoggedInContext = createContext<LoggedInContextType>({
  loggedInState: false,
  setLoggedInState: () => {
    return;
  },
});

export const AuthUserContext = createContext<AuthUserContextType>({
  authUserData: {
    ...initialAuthUserData,
  },
  setAuthUserData: () => {
    return;
  },
});

export const SpMenuContext = createContext<SpMenuContextType>({
  spMenuState: false,
  setSpMenuState: () => {
    return;
  },
});

//window幅取得関数

const App = ({ Component, pageProps }: AppProps) => {
  //ローディング状態
  const [loadState, setLoadState] = useState(true);
  //ログイン状態
  const [loggedInState, setLoggedInState] = useState(false);
  //スマホメニュー状態
  const [spMenuState, setSpMenuState] = React.useState(false);
  //ログイン済みの場合contextにプロフィールデータを入れる
  const [authUserData, setAuthUserData] = useState<UserDataType>({
    ...initialAuthUserData,
  });

  //page load処理
  Router.events.on('routeChangeStart', () => setLoadState(false));
  Router.events.on('routeChangeComplete', () => setLoadState(true));

  useEffect(() => {
    setLoggedInState(auth.isAuthenticated());
    async function fetchAuthUserData() {
      const authUserData = await getAuthUserData();
      setAuthUserData({ ...authUserData });
    }
    if (loggedInState) {
      fetchAuthUserData();
    }
  }, [loggedInState]);

  //pcsizeでスマホメニュー強制で閉じる
  useEffect(() => {
    const resizeListener = () => {
      if (getWindowWidth() > 600) {
        setSpMenuState(false);
      }
    };
    // set resize listener
    window.addEventListener('resize', resizeListener);
  }, []);

  return (
    <>
      {!loadState && (
        <div className="load-wrapper">
          <Loader />
        </div>
      )}
      <LoggedInContext.Provider value={{ loggedInState, setLoggedInState }}>
        <AuthUserContext.Provider value={{ authUserData, setAuthUserData }}>
          <SpMenuContext.Provider value={{ spMenuState, setSpMenuState }}>
            <Head>
              <meta name="viewport" content="width=device-width, user-scalable=no" />
              <title>BUZZ STOCK .COM</title>
              <meta
                name="description"
                content="株式のチャートの確認・ファンダメンタル情報の確認ならBuzz Stock.comへ"
              />
              <link rel="preload" href="/fonts/rifton-norm.ttf" as="font" crossOrigin="" />
              <link rel="preload" href="/fonts/nulshock-bd.ttf" as="font" crossOrigin="" />
            </Head>
            <div className="page-container">
              <div className={`page-wrapper ${spMenuState && 'sp-menu-trigger-active'}`}>
                <Navigation />
                <Component {...pageProps} />
                <Footer />
              </div>
            </div>
          </SpMenuContext.Provider>
        </AuthUserContext.Provider>
      </LoggedInContext.Provider>
    </>
  );
};
export default App;
