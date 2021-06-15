import React from 'react';
import Chart from './AreaChart';
/* eslint-disable */
import { TypeChooser } from 'react-stockcharts/lib/helper';
/* eslint-disable */
import { timeFormat, timeParse } from 'd3-time-format';
//components
import Loader from '../common/Loader';
const convertData = (data) => {
  let plotsData = [];
  let timestamps = data.timestamp;
  let closes = data.close;

  const formatDateData = (_timestamp) => {
    const formatDate = timeFormat('%Y-%m-%d');
    const parseDate = timeParse('%Y-%m-%d');
    let toDate = new Date(_timestamp * 1000);

    return parseDate(formatDate(toDate));
  };
  for (var i = 0; i < timestamps.length; i++) {
    let plot = new Object();
    plot.close = closes[i];
    plot.date = formatDateData(timestamps[i]);
    plotsData.push(plot);
  }
  return plotsData;
};

class ChartComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      dataState: 'unset',
    };
  }
  componentDidMount() {
    let data = convertData(this.props.chartData);
    this.setState({
      dataState: 'complete',
      data: data,
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.data !== this.props.data) {
      this.setState({
        dataState: 'reload',
      });
      let data = convertData(nextProps.data);
      this.setState({
        dataState: 'complete',
        data: data,
      });
    }
  };

  render() {
    const { width, height } = this.props;

    if (this.state.dataState !== 'complete') {
      return (
        <div>
          <Loader></Loader>
        </div>
      );
    }
    /* eslint-disable */
    return (
      <TypeChooser>
        {(type) => <Chart type={type} data={this.state.data} height={height} width={width} />}
      </TypeChooser>
    );
    /* eslint-disable */
  }
}

export default ChartComponent;
