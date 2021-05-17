import React, { createContext, useContext, useState, useEffect } from 'react';
import Router from 'next/router';
import Head from 'next/head';
//utils
import auth from '../utils/auth';
//components
import Navigation from '../components/common/Navigation';
import Loader from '../components/common/Loader';
import Footer from '../components/common/Footer';
//context
export const LoggedInContext = React.createContext();
export const AuthUserData = React.createContext();
export const SpMenuContext = React.createContext();
//style
import '../styles/globals.scss';
//constant
const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
//window幅取得関数

const App = (props) => {
  const { pageProps, Component } = props;
  //ローディング状態
  const [LoadState, setLoadState] = useState(true);
  //ログイン状態
  const [LoggedInState, setLoggedInState] = useState(false);
  //スマホメニュー状態
  const [SpMenuState, setSpMenuState] = React.useState(false);
  //ログイン済みの場合contextにプロフィールデータを入れる
  const [AuthUserProfile, setAuthUserProfile] = useState({});
  const user_data_path = baseRequestUrl + '/auth/current_user';
  //page load処理
  Router.events.on('routeChangeStart', () => setLoadState(false));
  Router.events.on('routeChangeComplete', () => setLoadState(true));

  useEffect(() => {
    setLoggedInState(auth.isAuthenticated());
    if (LoggedInState) {
      fetch(user_data_path, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          console.log('userDataLoaded');
          console.log(json);
          setAuthUserProfile(json);
        });
    }
  }, [LoggedInState]);

  //pcsizeでスマホメニュー強制で閉じる
  const getWindowWidth = () => {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  };
  useEffect(() => {
    const resizeListener = () => {
      // change width from the state object

      if (getWindowWidth() > 600) {
        console.log(getWindowWidth());
        setSpMenuState(false);
      }
    };
    // set resize listener
    window.addEventListener('resize', resizeListener);
  }, []);

  return (
    <>
      {!LoadState && (
        <div className="load-wrapper">
          <Loader />
        </div>
      )}
      <LoggedInContext.Provider value={{ LoggedInState, setLoggedInState }}>
        <AuthUserData.Provider value={{ AuthUserProfile, setAuthUserProfile }}>
          <SpMenuContext.Provider value={{ SpMenuState, setSpMenuState }}>
            <Head>
              <link rel="preload" href="/fonts/rifton-norm.ttf" as="font" crossOrigin="" />
              <link rel="preload" href="/fonts/nulshock-bd.ttf" as="font" crossOrigin="" />
              <meta name="viewport" content="width=device-width, user-scalable=no" />
            </Head>
            <div className="page-container">
              <div className={`page-wrapper ${SpMenuState && 'sp-menu-trigger-active'}`}>
                <Navigation />
                <Component {...pageProps} />
                <Footer />
              </div>
            </div>
          </SpMenuContext.Provider>
        </AuthUserData.Provider>
      </LoggedInContext.Provider>
    </>
  );
};
export default App;
