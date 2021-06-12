import React from 'react';

//style
import style from './StockKeyData.module.scss';
//components
import Loader from '../common/Loader';

const StockKeyData = ({
  SummaryData,
  SummaryState,
}: {
  SummaryData: any;
  SummaryState: string;
}) => {
  return (
    <>
      {SummaryState === 'complete' &&
      SummaryData.financialData !== undefined &&
      SummaryData.summaryDetail !== undefined &&
      SummaryData.price !== undefined ? (
        <>
          <div className={style['container']}>
            <div className={style['group']}>
              <p className={style['group-ttl']}>参考値</p>
              <div className={style['group-item']}>
                <span className={style['item-label']}>50日平均</span>
                <span className={style['item-value']}>
                  {SummaryData.summaryDetail.fiftyDayAverage.fmt}
                </span>
              </div>
              <div className={style['group-item']}>
                <span className={style['item-label']}>52週高値</span>
                <span className={style['item-value']}>
                  {SummaryData.summaryDetail.fiftyTwoWeekHigh.fmt}
                </span>
              </div>
              <div className={style['group-item']}>
                <span className={style['item-label']}>52週安値</span>
                <span className={style['item-value']}>
                  {SummaryData.summaryDetail.fiftyTwoWeekLow.fmt}
                </span>
              </div>
            </div>

            {SummaryData.financialData.targetMeanPrice !== undefined && (
              <div className={style['group']}>
                <p className={style['group-ttl']}>年間目標価格</p>
                <div className={style['group-item']}>
                  <span className={style['item-label']}>平均</span>
                  <span className={style['item-value']}>
                    {SummaryData.financialData.targetMeanPrice.fmt}
                  </span>
                </div>
                <div className={style['group-item']}>
                  <span className={style['item-label']}>高値</span>
                  <span className={style['item-value']}>
                    {SummaryData.financialData.targetHighPrice.fmt}
                  </span>
                </div>
                <div className={style['group-item']}>
                  <span className={style['item-label']}>安値</span>
                  <span className={style['item-value']}>
                    {SummaryData.financialData.targetLowPrice.fmt}
                  </span>
                </div>
              </div>
            )}
            <div className={style['group']}>
              <p className={style['group-ttl']}>出来高</p>
              <div className={style['group-item']}>
                <span className={style['item-label']}>3ヶ月平均</span>
                <span className={style['item-value']}>
                  {SummaryData.price.averageDailyVolume3Month !== undefined &&
                    SummaryData.price.averageDailyVolume3Month.fmt}
                </span>
              </div>
              <div className={style['group-item']}>
                <span className={style['item-label']}>10日平均</span>
                <span className={style['item-value']}>
                  {SummaryData.price.averageDailyVolume10Day !== undefined &&
                    SummaryData.price.averageDailyVolume10Day.fmt}
                </span>
              </div>
              <div className={style['group-item']}>
                <span className={style['item-label']}>本日</span>
                <span className={style['item-value']}>
                  {SummaryData.summaryDetail.regularMarketVolume !== undefined &&
                    SummaryData.summaryDetail.regularMarketVolume.fmt}
                </span>
              </div>
            </div>
            <div className={style['group']}>
              <p className={style['group-ttl']}>参考指標</p>
              <div className={style['group-item']}>
                <span className={style['item-label']}>時価総額</span>
                <span className={style['item-value']}>
                  {SummaryData.price.marketCap.fmt !== undefined && SummaryData.price.marketCap.fmt}
                </span>
              </div>
              {SummaryData.summaryDetail.trailingPE !== undefined && (
                <div className={style['group-item']}>
                  <span className={style['item-label']}>PER</span>
                  <span className={style['item-value']}>
                    {SummaryData.summaryDetail.trailingPE.fmt}
                  </span>
                </div>
              )}
              {SummaryData.defaultKeyStatistics.trailingPE !== undefined && (
                <div className={style['group-item']}>
                  <span className={style['item-label']}>EPS</span>
                  <span className={style['item-value']}>
                    {SummaryData.defaultKeyStatistics.trailingEps.fmt}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div>
          <Loader></Loader>
        </div>
      )}
    </>
  );
};

export default StockKeyData;
