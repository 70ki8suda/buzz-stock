import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
//components
import StockInfo from '../components/top-page-chart/TopStockInfo';

//style
import styles from '../styles/pages/Top.module.scss';
const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;
const get_movers_path =
  'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-movers?region=US&lang=en-US&start=0&count=4';

const Home = ({ ActiveChartData, ActiveSummaryData, GainerChartData, GainerSummaryData }) => {
  return (
    <>
      <Head>
        <title>Buzz Stock .com</title>
      </Head>
      <div className={styles['ttl-wrapper']}>
        <h1 className={styles['ttl']}>
          ! MOST ACTIVE !<span className={styles['ttl-ja']}>現在最出来高銘柄</span>
        </h1>
      </div>
      <div className={styles['wrap']}>
        {Object.keys(ActiveChartData).map((key, i) => (
          <div className={styles['chart-container']} key={i}>
            <StockInfo
              ticker={key}
              chartData={ActiveChartData[key]}
              SummaryData={ActiveSummaryData[key]}
            ></StockInfo>
            <div className={styles['discuss-btn']}>
              <div className={styles['discuss-btn-inner']}>
                <Link href={`./quote/${key}`}>Discuss</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles['section-border']}></div>
      <div className={styles['ttl-wrapper']}>
        <h1 className={styles['ttl']}>
          ! TOP GAINERS !<span className={styles['ttl-ja']}>現在最値上ガリ銘柄</span>
        </h1>
      </div>
      <div className={styles['wrap']}>
        {Object.keys(GainerChartData).map((key, i) => (
          <div className={styles['chart-container']} key={i}>
            <StockInfo
              ticker={key}
              chartData={GainerChartData[key]}
              SummaryData={GainerSummaryData[key]}
            ></StockInfo>
            <div className={styles['discuss-btn']}>
              <div className={styles['discuss-btn-inner']}>
                <Link href={`./quote/${key}`}>Discuss</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

//ISR
export const getStaticProps = async () => {
  const rawMovers = await fetch(get_movers_path, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST,
    },
  });
  const Movers = await rawMovers.json();

  let ActiveTickersArray = [];

  const ActiveTickers = await Movers.finance.result[2].quotes
    .filter((quote) => {
      return quote.quoteType == 'EQUITY';
    })
    .map((quote) => {
      return ActiveTickersArray.push(quote.symbol);
    });
  ActiveTickersArray = ActiveTickersArray.slice(0, 3);
  console.log(ActiveTickersArray);

  const path_query = ActiveTickersArray.join(',');
  const encoded_query = encodeURI(path_query);
  const get_chart_path = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-spark?symbols=${encoded_query}&interval=15m&range=5d`;

  let getActiveChartRetryNum = 4;
  let ActiveChartData;
  let getActiveChartData = async (retryNum) => {
    try {
      let rawActiveChartData = await fetch(get_chart_path, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST,
        },
      });
      ActiveChartData = await rawActiveChartData.json();
      //console.log(ActiveChartData);
      if (!ActiveChartData[ActiveTickersArray[0]]) {
        console.log('try fetching chart again');
        throw 'fetch chart data error';
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
      if (retryNum === 0) {
        throw 'load chartdata error';
      }
      return await getActiveChartData(getActiveChartRetryNum - 1);
    }
  };
  getActiveChartData(getActiveChartRetryNum);

  let ActiveSummaryData = {};
  for (var i = 0; i < ActiveTickersArray.length; i++) {
    let Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${ActiveTickersArray[i]}`;
    let retryNum = 4;
    let getSummaryData = async () => {
      try {
        let rawSummaryData = await fetch(Summary_Request, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
          },
        });

        let SummaryJson = await rawSummaryData.json();

        if ('defaultKeyStatistics' in SummaryJson == false) {
          throw 'fetch data error';
        }
        ActiveSummaryData[ActiveTickersArray[i]] = SummaryJson;
      } catch {
        if (retryNum === 0) {
          throw 'load error';
        }
        await new Promise((r) => setTimeout(r, 1000));
        return await getSummaryData(retryNum - 1);
      }
    };
    await getSummaryData(retryNum);
  }

  //ここからtop gainer
  let GainerTickersArray = [];
  const GainerTickers = await Movers.finance.result[0].quotes
    .filter((quote) => {
      return quote.quoteType == 'EQUITY';
    })
    .map((quote) => {
      return GainerTickersArray.push(quote.symbol);
    });

  GainerTickersArray = GainerTickersArray.slice(0, 3);

  const path_query2 = GainerTickersArray.join(',');
  const encoded_query2 = encodeURI(path_query2);
  const get_chart_path2 = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-spark?symbols=${encoded_query2}&interval=15m&range=5d`;

  let getGainerChartRetryNum = 4;
  let GainerChartData;
  let getGainerChartData = async (retryNum) => {
    try {
      let rawGainerChartData = await fetch(get_chart_path2, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST,
        },
      });
      GainerChartData = await rawGainerChartData.json();
      //console.log(ActiveChartData);
      if (!ActiveChartData[ActiveTickersArray[0]]) {
        console.log('try fetching chart again');
        throw 'fetch chart data error';
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
      if (retryNum === 0) {
        throw 'load chartdata error';
      }
      return await getGainerChartData(getGainerChartRetryNum - 1);
    }
  };
  getGainerChartData(getGainerChartRetryNum);

  let GainerSummaryData = {};
  for (var j = 0; j < GainerTickersArray.length; j++) {
    let Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${GainerTickersArray[j]}`;
    let retryNum = 4;
    let getSummaryData = async () => {
      try {
        let rawSummaryData = await fetch(Summary_Request, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
          },
        });

        let SummaryJson = await rawSummaryData.json();

        if ('defaultKeyStatistics' in SummaryJson == false) {
          throw 'fetch data error';
        }
        GainerSummaryData[GainerTickersArray[j]] = SummaryJson;
      } catch {
        if (retryNum === 0) {
          throw 'load error';
        }
        await new Promise((r) => setTimeout(r, 1000));
        return await getSummaryData(retryNum - 1);
      }
    };
    await getSummaryData(retryNum);
  }
  //ISR
  return {
    props: { ActiveChartData, ActiveSummaryData, GainerChartData, GainerSummaryData },
    revalidate: 60,
  };
};
export default Home;
