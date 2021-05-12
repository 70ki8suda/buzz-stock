import React, { useState, useEffect } from 'react';
import Head from 'next/head';

import Loader from '../components/common/Loader';
const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

const Home = () => {
  const api_path = baseRequestUrl + '/api/v1/hello';
  const [data, setData] = React.useState();

  const [loadState, setloadState] = React.useState(false);

  React.useEffect(() => {
    var setLoadTrue = () => {
      setloadState(true);
    };
    setTimeout(() => {
      setLoadTrue();
    }, 5000);

    fetch(api_path, {
      method: 'GET',
      mode: 'cors',
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        setData(json.status);
      });
  }, []);

  return (
    <>
      <Head>
        <title>api test</title>
      </Head>
      {loadState == false && <Loader></Loader>}

      <div>{data}</div>
    </>
  );
};

export default Home;
