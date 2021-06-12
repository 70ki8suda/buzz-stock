import React from 'react';
import Chart from './Chart';
/* eslint-disable */
import { TypeChooser } from 'react-stockcharts/lib/helper';

//components
import Loader from '../common/Loader';
//service
import { getChartData } from '../../service/tweet/getChartData.service';

class ChartComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      dataState: 'unset',
      dataRange: '3mo',
    };
  }
  handleRangeChange = (e) => {
    const target = e.target;
    const range = target.value;
    let self = this;
    let ticker = this.props.ticker;
    if (range !== this.state.dataRange) {
      self.setState({
        dataState: 'reload',
        dataRange: range,
      });
    }
    async function waitAndSet() {
      await getChartData(ticker, range, 4).then((data) => {
        self.setState({
          data: data,
          dataState: 'complete',
        });
      });
    }
    waitAndSet();
  };
  componentDidMount() {
    let self = this;
    let ticker = this.props.ticker;
    async function waitAndSet() {
      await getChartData(ticker, self.state.dataRange, 2).then((data) => {
        self.setState({
          data: data,
          dataState: 'complete',
        });
      });
    }
    waitAndSet();
  }

  componentWillReceiveProps = (nextProps) => {
    let self = this;
    if (nextProps.ticker !== this.props.ticker) {
      this.setState({
        dataState: 'reload',
      });
      let self = this;
      let ticker = nextProps.ticker;
      async function waitAndSet() {
        await getChartData(ticker, self.state.dataRange, 2).then((data) => {
          self.setState({
            data: data,
            dataState: 'complete',
          });
        });
      }
      waitAndSet();
    }
  };

  render() {
    const { width, height, ticker } = this.props;

    if (this.state.dataState !== 'complete') {
      return (
        <div className="chartFetch-wrap">
          <Loader></Loader>
        </div>
      );
    }

    /* eslint-disable */
    return (
      <>
        <TypeChooser>
          {(type) => (
            <Chart
              type={type}
              data={this.state.data}
              height={height}
              width={width}
              ticker={ticker}
              dataRange={this.state.dataRange}
            />
          )}
        </TypeChooser>

        <div className="interval-select-wrapper">
          <select
            id="rangeSelect"
            name="range-select"
            className="range-select"
            onChange={this.handleRangeChange}
            value={this.state.dataRange}
          >
            <option value="1d">1日</option>
            <option value="5d">5日</option>
            <option value="1mo">1ヶ月</option>
            <option value="3mo">3ヶ月</option>
            <option value="6mo">6ヶ月</option>
            <option value="1y">1年</option>
            <option value="2y">2年</option>
          </select>
        </div>
      </>
    );
    /* eslint-disable */
  }
}

export default ChartComponent;
