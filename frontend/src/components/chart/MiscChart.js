import React from 'react';
import PropTypes from 'prop-types';

import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

import { ChartCanvas, Chart } from 'react-stockcharts';
import { BarSeries, AreaSeries } from 'react-stockcharts/lib/series';
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';

import { SingleValueTooltip } from 'react-stockcharts/lib/tooltip';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { last } from 'react-stockcharts/lib/utils';

class AreaChartWithEdge extends React.Component {
  render() {
    const { type, data: initialData, width, height, ratio } = this.props;

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor((d) => d.date);
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData);

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];
    return (
      <ChartCanvas
        ratio={ratio}
        width={width}
        height={height}
        margin={{ left: 0, right: 0, top: 10, bottom: 30 }}
        type={type}
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
        panEvent={false}
        zoomEvent={false}
      >
        <Chart id={1} yExtents={(d) => [d.close, d.close]}>
          <XAxis axisAt="bottom" orient="bottom" />
          <YAxis axisAt="right" orient="right" ticks={5} />

          <AreaSeries
            yAccessor={(d) => d.close}
            stroke="rgba(18, 217, 243, 1)"
            fill="rgba(18, 217, 243, .5)"
          />
        </Chart>
      </ChartCanvas>
    );
  }
}

AreaChartWithEdge.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired,
};

AreaChartWithEdge.defaultProps = {
  type: 'svg',
};
AreaChartWithEdge = fitWidth(AreaChartWithEdge);

export default AreaChartWithEdge;
