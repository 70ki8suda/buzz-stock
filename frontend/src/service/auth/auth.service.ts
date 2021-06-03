import auth from '../../utils/auth';
import { UserDataType } from '../../type/UserDataType';
const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

const getAuthUserData = async (): Promise<UserDataType> => {
  const url = baseRequestUrl + '/auth/current_user';
  const authUserData = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: auth.bearerToken(),
    },
  }).then((response) => response.json());
  return authUserData;
};

export { getAuthUserData };
