import React from 'react';
import Chart from './Chart';
/* eslint-disable */
import { TypeChooser } from 'react-stockcharts/lib/helper';
/* eslint-disable */
import { timeFormat, timeParse } from 'd3-time-format';
//components
import Loader from '../common/Loader';

const IntervalOptions = ['1m', '2m', '5m', '15m', '60m', '1d'];
const RangeOptions = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y'];

const getWindowWidth = () => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

const convertData = (data, Range) => {
  let plotsData = [];
  let timestamps = data.chart.result[0].timestamp;
  let quote = data.chart.result[0].indicators.quote[0];
  let opens = quote.open;
  let closes = quote.close;
  let lows = quote.low;
  let highs = quote.high;
  let volumes = quote.volume;

  const formatDateData = (_timestamp) => {
    let formatDate;
    let parseDate;
    if (Range == RangeOptions[0] || RangeOptions[1]) {
      formatDate = timeFormat('%a %d,%I %p %I:%M');
      parseDate = timeParse('%a %d,%I %p %I:%M');
    } else {
      formatDate = timeFormat('%Y-%m-%d');
      parseDate = timeParse('%Y-%m-%d');
    }

    let toDate = new Date(_timestamp * 1000);

    return parseDate(formatDate(toDate));
  };
  for (var i = 0; i < timestamps.length; i++) {
    let plot = new Object();
    plot.open = opens[i];
    plot.close = closes[i];
    plot.high = highs[i];
    plot.low = lows[i];
    plot.volume = volumes[i];
    plot.date = formatDateData(timestamps[i]);
    plotsData.push(plot);
  }
  return plotsData;
};

const arrayChunk = ([...array], size = 1) => {
  return array.reduce(
    (acc, value, index) => (index % size ? acc : [...acc, array.slice(index, index + size)]),
    [],
  );
};
const spConvertData = (_convertData, _spRange) => {
  if (_spRange == '1d' || _spRange == '5d' || _spRange == '6mo') {
    return arrayChunk(_convertData, 2);
  }
  if (_spRange == '1y') {
    return arrayChunk(_convertData, 4);
  }
  if (_spRange == '2y') {
    return arrayChunk(_convertData, 8);
  }
};
const getChartData = async (ticker, range, retryNum) => {
  //request Params
  const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

  //request option
  let Tikcer = ticker;
  let Range = range;
  let Interval;
  let spRange;
  if (getWindowWidth() > 600) {
    //pc
    if (Range == RangeOptions[0]) {
      Interval = IntervalOptions[2];
    } else if (Range == RangeOptions[1] || Range == RangeOptions[2]) {
      Interval = IntervalOptions[4];
    } else {
      Interval = IntervalOptions[5];
    }
  } else {
    //sp
    if (Range == RangeOptions[0]) {
      //1day -15m
      spRange = '1d';
      Interval = IntervalOptions[3];
    } else if (Range == RangeOptions[1]) {
      //5day -60m
      spRange = '5d';
      Interval = IntervalOptions[4];
    } else if (Range == RangeOptions[2] || Range == RangeOptions[3]) {
      Interval = IntervalOptions[5];
    } else if (Range == RangeOptions[4]) {
      spRange = '6mo';
      Interval = IntervalOptions[5];
    } else if (Range == RangeOptions[5]) {
      spRange = '1y';
      Interval = IntervalOptions[5];
    } else if (Range == RangeOptions[6]) {
      spRange = '2y';
      Interval = IntervalOptions[5];
    }
  }

  let Chart_Data_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart?interval=${Interval}&symbol=${Tikcer}&range=${Range}`;

  try {
    console.log('count=', retryNum);
    console.log('count=', Chart_Data_Request);
    return await fetch(Chart_Data_Request, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (spRange == undefined) {
          return convertData(response, Range);
        } else {
          let data1 = convertData(response, Range);
          let data2 = spConvertData(data1, spRange);
          console.log(data2);
          let data3 = [];
          for (var i = 0; i < data2.length; i++) {
            //console.log(data2[i]);
            let convertedData = new Object();
            convertedData.date = data2[i][0].date;
            convertedData.open = data2[i][0].open;
            convertedData.close = data2[i][data2[i].length - 1].close;
            let highs = [];
            let lows = [];
            let volumes = [];
            for (var j = 0; j < data2[i].length; j++) {
              highs.push(data2[i][j].high);
              lows.push(data2[i][j].low);

              //なぜか一度変数に代入してからじゃないと配列に入らない メモリの問題?
              let volume = data2[i][j].volume;
              volumes.push(volume);
            }
            const arrayMax = function (a, b) {
              return Math.max(a, b);
            };
            const arrayMin = function (a, b) {
              return Math.min(a, b);
            };
            const arraySum = function (arr) {
              return arr.reduce(function (prev, current, i, arr) {
                return prev + current;
              });
            };
            let max = highs.reduce(arrayMax);
            let min = lows.reduce(arrayMin);
            let sum = arraySum(volumes);
            convertedData.high = max;
            convertedData.low = min;
            convertedData.volume = sum;
            data3.push(convertedData);
          }

          return data3;
        }
      })
      .then((data) => {
        console.log(data);
        if (data.length == 0) {
          console.log('0 data');
          throw 'No data error';
        }

        return data;
      });
  } catch (err) {
    await new Promise((r) => setTimeout(r, 3000));
    if (retryNum === 0) {
      throw 'load error';
    }
    return await getChartData(Tikcer, Range, retryNum - 1);
  }
};
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
      await getChartData(ticker, range, 2).then((data) => {
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
