const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import auth from '../../utils/auth.js';

const getProfileData = async (userId: string): Promise<any> => {
  const url = baseRequestUrl + '/user/' + userId;
  const profileData = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  }).then((response) => response.json());
  return profileData;
};

const updateProfileRequest = async (formData: FormData): Promise<void> => {
  const url = baseRequestUrl + '/user/update_profile';
  await fetch(url, {
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: {
      Authorization: auth.bearerToken(),
    },
  });
};

export { getProfileData, updateProfileRequest };
