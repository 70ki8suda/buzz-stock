import React from 'react';
React.useLayoutEffect = React.useEffect;
import useDimensions from 'react-use-dimensions';
import ChartFetch from './ChartFetch';
//import useSWR from 'swr';

const ChartWrapper = React.memo((props) => {
  const [ref, { width, height }] = useDimensions({ liveMeasure: false });
  const { ticker, type } = props;

  return (
    <div ref={ref} className="chart-wrapper" style={{ width: '100%', height: '100%' }}>
      <ChartFetch height={height} width={width} ticker={ticker} />
    </div>
  );
});

export default ChartWrapper;
