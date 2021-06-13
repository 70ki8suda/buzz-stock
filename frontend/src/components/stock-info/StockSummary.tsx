import React from 'react';
//utils
import unescapeHtml from '../../utils/unescapeHtml';
//style
import style from './StockSummary.module.scss';
//components
import Loader from '../common/Loader';

function changePecent(_raw: string) {
  const n1 = parseFloat(_raw);
  const n2 = Math.floor(n1 * 10000);
  return n2 / 100;
}
const StockSummary = ({ SummaryData, SummaryState }: { SummaryData: any; SummaryState: any }) => {
  return (
    <>
      {SummaryState === 'complete' ? (
        <>
          {SummaryData.quoteType !== undefined && (
            <h1 className={style['quote-name']}>
              {unescapeHtml(SummaryData.quoteType.longName)}
              <span className={style['lead-border']}>
                <span className={style['lead-border-edge']}></span>
              </span>
            </h1>
          )}
          {SummaryData.price !== undefined && SummaryData.quoteType !== undefined && (
            <div className={style['info-top-container']}>
              <span className={style['triangle1']}></span>
              <span className={style['triangle2']}></span>
              <div className={style['info-top-left']}>
                <h2 className={style['ticker']}>
                  {SummaryData.quoteType.symbol}
                  <span className={style['exchange']}>{SummaryData.price.exchangeName}</span>
                </h2>

                <p className={style['current-price']}>
                  {SummaryData.price.regularMarketPrice.raw.toFixed(2)}
                </p>
              </div>
              <div className={style['top-price-change']}>
                {SummaryData.price.regularMarketChange.raw > 0 ? (
                  <div className={`${style['regular-market-change']} ${style['up']}`}>
                    +{SummaryData.price.regularMarketChange.raw.toFixed(2)}
                  </div>
                ) : (
                  <div className={`${style['regular-market-change']} ${style['down']}`}>
                    {SummaryData.price.regularMarketChange.raw.toFixed(2)}
                  </div>
                )}

                {SummaryData.price.regularMarketChangePercent.raw > 0 ? (
                  <div className={`${style['regular-market-change-percent']} ${style['up']}`}>
                    +{changePecent(SummaryData.price.regularMarketChangePercent.raw)}%
                  </div>
                ) : (
                  <div className={`${style['regular-market-change-percent']} ${style['down']}`}>
                    {changePecent(SummaryData.price.regularMarketChangePercent.raw)}%
                  </div>
                )}
              </div>
              <div className={style['top-right-box']}>
                <div className={style['day-high']}>
                  <span className={style['price-label']}>高値: </span>
                  <span className={style['price-num']}>
                    {SummaryData.price.regularMarketDayHigh.raw.toFixed(2)}
                  </span>
                </div>
                <div className={style['day-low']}>
                  <span className={style['price-label']}>安値: </span>
                  <span className={style['price-num']}>
                    {SummaryData.price.regularMarketDayLow.raw.toFixed(2)}
                  </span>
                </div>
                <div className={style['day-open']}>
                  <span className={style['price-label']}>始値: </span>
                  <span className={style['price-num']}>
                    {SummaryData.price.regularMarketOpen.raw.toFixed(2)}
                  </span>
                </div>
                <div className={style['day-close']}>
                  <span className={style['price-label']}>前日終値: </span>
                  <span className={style['price-num']}>
                    {SummaryData.price.regularMarketPreviousClose.raw.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h1 className={`style['quote-name'] style['loading']`}>
            <Loader></Loader>
          </h1>
          <div className={style['info-top-container']}>
            <span className={style['triangle1']}></span>
            <span className={style['triangle2']}></span>
            <Loader></Loader>
          </div>
        </>
      )}
    </>
  );
};

export default StockSummary;
