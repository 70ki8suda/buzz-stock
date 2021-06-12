const getWindowWidth = () => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};
const convertData = (data: any) => {
  const plotsData = [];
  const timestamps = data.chart.result[0].timestamp;
  const quote = data.chart.result[0].indicators.quote[0];
  const opens = quote.open;
  const closes = quote.close;
  const lows = quote.low;
  const highs = quote.high;
  const volumes = quote.volume;

  const formatDateData = (_timestamp: number) => {
    const toDate = new Date(_timestamp * 1000);
    return toDate;
  };
  for (let i = 0; i < timestamps.length; i++) {
    const plot: any = new Object();
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

//配列のデータをまとめる(2日分のデータを1スティックに変換したりする)
const arrayChunk = ([...array], size: number = 1) => {
  return array.reduce(
    (acc, index) => (index % size ? acc : [...acc, array.slice(index, index + size)]),
    [],
  );
};

//スマホ用のデータ圧縮
const spConvertData = (_convertData: any, _spRange: string) => {
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

//pc用のデータ圧縮
const pcConvertData = (_convertData: any, _pcRange: string) => {
  if (_pcRange == '1m') {
    return arrayChunk(_convertData, 8);
  }
  if (_pcRange == '1y') {
    return arrayChunk(_convertData, 2);
  }
  if (_pcRange == '2y') {
    return arrayChunk(_convertData, 4);
  }
};

export { getWindowWidth, convertData, arrayChunk, spConvertData, pcConvertData };
