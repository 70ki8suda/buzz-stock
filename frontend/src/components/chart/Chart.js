import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

import { ChartCanvas, Chart } from 'react-stockcharts';
import { BarSeries, CandlestickSeries } from 'react-stockcharts/lib/series';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';

import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { last } from 'react-stockcharts/lib/utils';

class CandleStickChart extends React.Component {
  render() {
    const { type, data: initialData, width, height, ratio, ticker } = this.props;

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor((d) => d.date);
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData);

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];
    const { gridProps } = this.props;
    let margin = { left: 40, right: 40, top: 10, bottom: 40 };
    let devise = 'pc';
    if (window.innerWidth < 600) {
      devise = 'sp';
      margin = { left: 40, right: 40, top: 10, bottom: 30 };
    }
    const gridHeight = height - margin.top - margin.bottom;
    const gridWidth = width - margin.left - margin.right;

    const showGrid = true;
    const yGrid = showGrid
      ? {
          innerTickSize: -1 * gridWidth,
          tickStrokeDasharray: 'Solid',
          tickStrokeOpacity: 0.2,
          tickStrokeWidth: 1,
        }
      : {};
    const xGrid = showGrid
      ? {
          innerTickSize: -1 * gridHeight,
          tickStrokeDasharray: 'Solid',
          tickStrokeOpacity: 0.2,
          tickStrokeWidth: 1,
        }
      : {};
    return (
      <>
        <ChartCanvas
          ratio={ratio}
          width={width}
          height={height}
          margin={margin}
          type={type}
          seriesName={ticker}
          data={data}
          xScale={xScale}
          xAccessor={xAccessor}
          displayXAccessor={displayXAccessor}
          xExtents={xExtents}
          panEvent={false}
          zoomEvent={false}
        >
          <Chart id={1} height={height * 0.6} yExtents={[(d) => [d.high, d.low]]}>
            <CandlestickSeries
              fill={(d) => (d.close > d.open ? 'rgba(255, 34, 13, 1)' : 'rgba(18, 217, 243, 1)')}
              wickStroke="#555555"
              stroke="rgba(0,0,0,.4)"
              candleStrokeWidth="1"
            />
            <YAxis axisAt="right" orient="right" ticks={5} {...gridProps} {...yGrid} />
          </Chart>
          <Chart
            id={2}
            height={height * 0.3}
            yExtents={(d) => d.volume}
            origin={(w, h) => [0, h - height * 0.3]}
          >
            {devise == 'pc' && (
              <XAxis axisAt="bottom" orient="bottom" {...gridProps} {...xGrid} outerTickSize={10} />
            )}

            <YAxis axisAt="left" orient="left" ticks={5} tickFormat={format('.2s')} />

            <BarSeries
              yAccessor={(d) => d.volume}
              fill={(d) => (d.close > d.open ? 'rgba(255, 34, 13, .5)' : 'rgba(18, 217, 243, .4)')}
            />
          </Chart>
        </ChartCanvas>
      </>
    );
  }
}

CandleStickChart.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired,
};

CandleStickChart.defaultProps = {
  type: 'hybrid',
};
CandleStickChart = fitWidth(CandleStickChart);

export default CandleStickChart;
