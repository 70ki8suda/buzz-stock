import React from 'react';
//components
import ChartWrapper from './TopChartWrapper';
import StockSummary from '../stock-info/StockSummary';
import StockKeyData from '../stock-info/StockKeyData';

//utils
//style
import infoStyle from './TopStockInfo.module.scss';
type Props = {
  ticker: string;
  chartData: any;
  SummaryData: any;
};
const StockInfo = ({ ticker, chartData, SummaryData }: Props) => {
  return (
    <>
      <StockSummary SummaryData={SummaryData} SummaryState="complete"></StockSummary>
      <div className={infoStyle['chart-box']}>
        <ChartWrapper ticker={ticker} chartData={chartData} />
      </div>
      <StockKeyData SummaryData={SummaryData} SummaryState="complete"></StockKeyData>
    </>
  );
};

export default StockInfo;
