const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import auth from '../../utils/auth';

const signupRequest = async (formData: FormData): Promise<any> => {
  const url = baseRequestUrl + '/auth/signup';
  const result = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: auth.bearerToken(),
    },
    body: formData,
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
  return result;
};

export { signupRequest };
