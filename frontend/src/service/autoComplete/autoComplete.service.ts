const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

const fetchAutoCompleteData = async (searchQuery: string): Promise<any> => {
  const url = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete?q=${searchQuery}&region=US`;
  const data = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST,
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.error(err);
    });
  return data;
};

export { fetchAutoCompleteData };
