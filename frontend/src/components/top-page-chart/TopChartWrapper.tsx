import React from 'react';
React.useLayoutEffect = React.useEffect;
import useDimensions from 'react-use-dimensions';
import ChartFetch from './TopChartFetch';
//import useSWR from 'swr';

const ChartWrapper = React.memo(({ ticker, chartData }: { ticker: string; chartData: any }) => {
  const [ref, { width, height }] = useDimensions({ liveMeasure: false });

  return (
    <div ref={ref} className="chart-wrapper" style={{ width: '100%', height: '100%' }}>
      <ChartFetch height={height} width={width} ticker={ticker} chartData={chartData} />
    </div>
  );
});

export default ChartWrapper;
