import React from 'react';
//components
import ChartWrapper from '../chart/ChartWrapper';
import StockSummary from './StockSummary';
import StockKeyData from './StockKeyData';
//utils
//style
import infoStyle from './StockInfo.module.scss';

type Props = {
  ticker: string;
  SummaryData: any;
  SummaryState: string;
};
const StockInfo = ({ ticker, SummaryData, SummaryState }: Props) => {
  return (
    <>
      <StockSummary SummaryData={SummaryData} SummaryState={SummaryState}></StockSummary>
      <div className={infoStyle['chart-box']}>
        <ChartWrapper ticker={ticker} />
      </div>
      <StockKeyData SummaryData={SummaryData} SummaryState={SummaryState}></StockKeyData>
    </>
  );
};

export default StockInfo;
