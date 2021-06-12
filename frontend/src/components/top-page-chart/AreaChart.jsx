import React from 'react';
import PropTypes from 'prop-types';

import { curveMonotoneX } from 'd3-shape';
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale';
import { ChartCanvas, Chart } from 'react-stockcharts';
import { AreaSeries } from 'react-stockcharts/lib/series';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { last } from 'react-stockcharts/lib/utils';

class AreaChart extends React.Component {
  render() {
    const { data: initialData, type, width, height, ratio } = this.props;
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor((d) => d.date);
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData);
    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    let margin = { left: 40, right: 40, top: 0, bottom: 30 };
    let devise = 'pc';
    if (window.innerWidth < 600) {
      devise = 'sp';
      margin = { left: 40, right: 40, top: 0, bottom: 0 };
    }
    const xExtents = [start, end];
    const { gridProps } = this.props;
    //const gridHeight = height - margin.top - margin.bottom;
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
    // const xGrid = showGrid
    //   ? {
    //       innerTickSize: -1 * gridHeight,
    //       tickStrokeDasharray: 'Solid',
    //       tickStrokeOpacity: 0.2,
    //       tickStrokeWidth: 1,
    //     }
    //   : {};
    return (
      <ChartCanvas
        ratio={ratio}
        width={width}
        height={height}
        margin={margin}
        data={data}
        type={type}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
        panEvent={false}
        zoomEvent={false}
      >
        <Chart id={0} yExtents={(d) => d.close}>
          {devise == 'pc' && <XAxis axisAt="bottom" orient="bottom" />}
          {devise == 'sp' && <XAxis axisAt="bottom" orient="bottom" ticks={2} />}
          <YAxis axisAt="left" orient="left" ticks={5} {...gridProps} {...yGrid} />
          <AreaSeries
            yAccessor={(d) => d.close}
            fill="rgba(18, 217, 243, .5)"
            strokeWidth={2}
            stroke="rgba(18, 217, 243, 1)"
            interpolation={curveMonotoneX}
          />
        </Chart>
      </ChartCanvas>
    );
  }
}

AreaChart.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired,
};

AreaChart.defaultProps = {
  type: 'svg',
};
// eslint-disable-next-line
AreaChart = fitWidth(AreaChart);

export default AreaChart;
