import React, { useState, useEffect } from 'react';
//components
import ChartWrapper from '../chart/ChartWrapper';
import StockSummary from './StockSummary';
import StockKeyData from './StockKeyData';
//utils
//style
import infoStyle from './StockInfo.module.scss';

const StockInfo = ({ ticker, SummaryData, SummaryState }) => {
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
