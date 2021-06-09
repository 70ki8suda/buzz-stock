const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

const loginRequest = async (formData: FormData): Promise<any> => {
  const url = baseRequestUrl + '/auth/signin';
  const result = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
  return result;
};

export { loginRequest };
