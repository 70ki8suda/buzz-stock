import React from 'react';
import Chart from './Chart';
/* eslint-disable */
import { TypeChooser } from 'react-stockcharts/lib/helper';
/* eslint-disable */
import { timeFormat, timeParse } from 'd3-time-format';

const convertData = (data) => {
  let plotsData = [];
  let timestamps = data.chart.result[0].timestamp;
  let quote = data.chart.result[0].indicators.quote[0];
  let opens = quote.open;
  let closes = quote.close;
  let lows = quote.low;
  let highs = quote.high;
  let volumes = quote.volume;

  const formatDateData = (_timestamp) => {
    const formatDate = timeFormat('%Y-%m-%d');
    const parseDate = timeParse('%Y-%m-%d');
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
const getChartData = async (ticker, retryNum) => {
  //request Params
  const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

  const IntervalOptions = ['1m', '2m', '5m', '15m', '60m', '1d'];
  const RangeOptions = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y'];
  //request option
  let Tikcer = ticker;
  let Interval = IntervalOptions[5];
  let Range = RangeOptions[3];
  let Chart_Data_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart?interval=${Interval}&symbol=${Tikcer}&range=${Range}`;

  try {
    console.log('count=', retryNum);
    return await fetch(Chart_Data_Request, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    })
      .then((response) => response.json())
      .then((response) => convertData(response))
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
    return await getChartData(retryNum - 1);
  }
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
    let self = this;
    let ticker = this.props.ticker;
    async function waitAndSet() {
      await getChartData(ticker, 2).then((data) => {
        self.setState({
          data: data,
          dataState: 'complete',
        });
      });
    }
    waitAndSet();
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.ticker !== this.props.ticker) {
      this.setState({
        dataState: 'reload',
      });
      let self = this;
      let ticker = nextProps.ticker;
      async function waitAndSet() {
        await getChartData(ticker, 2).then((data) => {
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
      return <div>Loading...</div>;
    }

    /* eslint-disable */
    return (
      <TypeChooser>
        {(type) => (
          <Chart type={type} data={this.state.data} height={height} width={width} ticker={ticker} />
        )}
      </TypeChooser>
    );
    /* eslint-disable */
  }
}

export default ChartComponent;
