const API_KEY: string = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const API_HOST: string = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

const getSummary = async (url: string): Promise<[]> => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set('x-rapidapi-key', API_KEY);
  requestHeaders.set('x-rapidapi-key', API_HOST);
  const SummaryData = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST,
    },
  }).then((response) => response.json());
  return SummaryData;
};

export { getSummary };
