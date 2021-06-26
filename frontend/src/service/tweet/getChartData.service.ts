import { getWindowWidth, convertData, spConvertData, pcConvertData } from '../../utils/chartUtil';

const IntervalOptions = ['1m', '2m', '5m', '15m', '60m', '1d'];
const RangeOptions = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y'];

const getChartData = async (ticker: string, range: string, retryNum: number): Promise<any> => {
  //request Params
  const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

  //request option
  const Tikcer = ticker;
  const Range = range;
  let Interval;
  let pcRange: string;
  let spRange: string;
  if (getWindowWidth() > 600) {
    //pc
    if (Range == RangeOptions[0]) {
      Interval = IntervalOptions[2];
    } else if (Range == RangeOptions[1]) {
      Interval = IntervalOptions[4];
    } else if (Range == RangeOptions[2]) {
      pcRange = '1m';
      Interval = IntervalOptions[4];
    } else if (Range == RangeOptions[5]) {
      pcRange = '1y';
      Interval = IntervalOptions[5];
    } else if (Range == RangeOptions[6]) {
      pcRange = '2y';
      Interval = IntervalOptions[5];
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

  const Chart_Data_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart?interval=${Interval}&symbol=${Tikcer}&range=${Range}`;

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
        if (spRange == undefined && pcRange == undefined) {
          return convertData(response);
        } else {
          const data1 = convertData(response);
          console.log('data1');
          console.log(data1);
          let data2;
          if (spRange !== undefined) {
            data2 = spConvertData(data1, spRange);
          } else if (!pcRange !== undefined) {
            data2 = pcConvertData(data1, pcRange);
          }
          console.log('data2');
          console.log(data2);
          const data3 = [];
          for (let i = 0; i < data2.length; i++) {
            //console.log(data2[i]);
            const convertedData: any = new Object();
            convertedData.date = data2[i][0].date;
            convertedData.open = data2[i][0].open;
            convertedData.close = data2[i][data2[i].length - 1].close;
            const highs = [];
            const lows = [];
            const volumes = [];
            for (let j = 0; j < data2[i].length; j++) {
              highs.push(data2[i][j].high);
              lows.push(data2[i][j].low);

              //なぜか一度変数に代入してからじゃないと配列に入らない メモリの問題?
              const volume = data2[i][j].volume;
              volumes.push(volume);
            }
            const arrayMax = function (a: number, b: number) {
              return Math.max(a, b);
            };
            const arrayMin = function (a: number, b: number) {
              return Math.min(a, b);
            };
            const arraySum = function (arr: number[]) {
              return arr.reduce(function (prev, current) {
                return prev + current;
              });
            };
            const max = highs.reduce(arrayMax);
            const min = lows.reduce(arrayMin);
            const sum = arraySum(volumes);
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
    await new Promise((r) => setTimeout(r, 1000));
    if (retryNum === 0) {
      throw 'load error';
    }
    return await getChartData(Tikcer, Range, retryNum - 1);
  }
};

export { getChartData };
