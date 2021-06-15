import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
//components
import StockInfo from '../components/top-page-chart/TopStockInfo';
//style
import styles from './index.module.scss';
//types
import { GetStaticProps } from 'next';
import { getPropsData } from 'src/service/top/getPropsData';
interface Props {
  ActiveChartData: any;
  ActiveSummaryData: any;
  GainerChartData: any;
  GainerSummaryData: any;
}
const Home: React.FC<Props> = ({
  ActiveChartData,
  ActiveSummaryData,
  GainerChartData,
  GainerSummaryData,
}) => {
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
        {ActiveSummaryData !== undefined && ActiveChartData !== undefined ? (
          Object.keys(ActiveChartData).map((key, i) => (
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
          ))
        ) : (
          <div>Sorry Page Loading Failed! Please Reload in Some Minutes!</div>
        )}
      </div>
      <div className={styles['section-border']}></div>
      <div className={styles['ttl-wrapper']}>
        <h1 className={styles['ttl']}>
          ! TOP GAINERS !<span className={styles['ttl-ja']}>現在最値上ガリ銘柄</span>
        </h1>
      </div>
      <div className={styles['wrap']}>
        {GainerSummaryData !== undefined && GainerChartData !== undefined ? (
          Object.keys(GainerChartData).map((key, i) => (
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
          ))
        ) : (
          <div>Sorry Page Loading Failed! Please Reload in Some Minutes!</div>
        )}
      </div>
    </>
  );
};

//ISR
export const getStaticProps: GetStaticProps = async () => {
  const { ActiveChartData, ActiveSummaryData, GainerChartData, GainerSummaryData } =
    await getPropsData();
  //ISR
  return {
    props: { ActiveChartData, ActiveSummaryData, GainerChartData, GainerSummaryData },
    revalidate: 60,
  };
};
export default Home;
