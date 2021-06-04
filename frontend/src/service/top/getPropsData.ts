const getPropsData = async (): Promise<{
  ActiveChartData: any;
  ActiveSummaryData: any;
  GainerChartData: any;
  GainerSummaryData: any;
}> => {
  const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;
  const get_movers_path =
    'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-movers?region=US&lang=en-US&start=0&count=4';

  //再取引高銘柄・再値上がり銘柄のticker取得
  const Movers = await fetch(get_movers_path, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST,
    },
  }).then((response) => {
    return response.json();
  });

  //再取引高銘柄
  let ActiveTickersArray: string[] = [];
  await Movers.finance.result[2].quotes
    .filter((quote: any) => {
      return quote.quoteType == 'EQUITY';
    })
    .map((quote: any) => {
      return ActiveTickersArray.push(quote.symbol);
    });
  ActiveTickersArray = ActiveTickersArray.slice(0, 3);

  const path_query = ActiveTickersArray.join(',');
  const encoded_query = encodeURI(path_query);
  const get_chart_path = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-spark?symbols=${encoded_query}&interval=15m&range=5d`;

  //Props
  let ActiveChartData: any;

  const getActiveChartRetryNum = 4;
  const getActiveChartData = async (retryNum: number): Promise<void> => {
    try {
      const rawActiveChartData = await fetch(get_chart_path, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST,
        },
      });
      //Props
      ActiveChartData = await rawActiveChartData.json();
      //console.log(ActiveChartData);
      if (!ActiveChartData[ActiveTickersArray[0]]) {
        console.log('try fetching chart again');
        throw 'fetch chart data error';
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
      if (retryNum === 0) {
        throw 'load chartdata error';
      }
      return await getActiveChartData(getActiveChartRetryNum - 1);
    }
  };
  getActiveChartData(getActiveChartRetryNum);

  let ActiveSummaryData = {};
  for (let i = 0; i < ActiveTickersArray.length; i++) {
    const Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${ActiveTickersArray[i]}`;
    const retryNum = 4;
    const getSummaryData = async (retryNum: number): Promise<void> => {
      try {
        const rawSummaryData = await fetch(Summary_Request, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
          },
        });

        const SummaryJson = await rawSummaryData.json();

        if ('defaultKeyStatistics' in SummaryJson == false) {
          throw 'fetch data error';
        }
        ActiveSummaryData = {
          ...ActiveSummaryData,
          [ActiveTickersArray[i]]: SummaryJson,
        };
      } catch {
        retryNum--;
        if (retryNum === 0) {
          throw 'load error';
        }
        await new Promise((r) => setTimeout(r, 1000));
        return await getSummaryData(retryNum - 1);
      }
    };
    await getSummaryData(retryNum);
  }

  //ここから再値上がり銘柄
  let GainerTickersArray: string[] = [];
  await Movers.finance.result[0].quotes
    .filter((quote: any) => {
      return quote.quoteType == 'EQUITY';
    })
    .map((quote: any) => {
      return GainerTickersArray.push(quote.symbol);
    });

  GainerTickersArray = GainerTickersArray.slice(0, 3);

  const path_query2 = GainerTickersArray.join(',');
  const encoded_query2 = encodeURI(path_query2);
  const get_chart_path2 = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-spark?symbols=${encoded_query2}&interval=15m&range=5d`;

  let getGainerChartRetryNum = 4;
  let GainerChartData;
  const getGainerChartData = async (retryNum: number): Promise<void> => {
    try {
      const rawGainerChartData = await fetch(get_chart_path2, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST,
        },
      });
      GainerChartData = await rawGainerChartData.json();
      //console.log(ActiveChartData);
      if (!ActiveChartData[ActiveTickersArray[0]]) {
        console.log('try fetching chart again');
        throw 'fetch chart data error';
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
      if (retryNum === 0) {
        throw 'load chartdata error';
      }
      getGainerChartRetryNum--;
      return await getGainerChartData(getGainerChartRetryNum);
    }
  };
  getGainerChartData(getGainerChartRetryNum);

  let GainerSummaryData = {};
  for (let i = 0; i < GainerTickersArray.length; i++) {
    const Summary_Request = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${GainerTickersArray[i]}`;
    const retryNum = 4;
    const getSummaryData = async (retryNum: number): Promise<void> => {
      try {
        const rawSummaryData = await fetch(Summary_Request, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
          },
        });

        const SummaryJson = await rawSummaryData.json();

        if ('defaultKeyStatistics' in SummaryJson == false) {
          throw 'fetch data error';
        }
        GainerSummaryData = {
          ...GainerSummaryData,
          [GainerTickersArray[i]]: SummaryJson,
        };
      } catch {
        if (retryNum === 0) {
          throw 'load error';
        }
        retryNum--;
        await new Promise((r) => setTimeout(r, 1000));
        return await getSummaryData(retryNum);
      }
    };
    await getSummaryData(retryNum);
  }
  return { ActiveChartData, ActiveSummaryData, GainerChartData, GainerSummaryData };
};

export { getPropsData };
