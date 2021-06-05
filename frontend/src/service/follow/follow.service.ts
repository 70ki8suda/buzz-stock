const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import auth from '../../utils/auth.js';

const followUserRequest = async (userId: number): Promise<void> => {
  const url = baseRequestUrl + `/user/follow/${userId}`;
  await fetch(url, {
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: auth.bearerToken(),
    },
  });
};

const unfollowUserRequest = async (userId: number): Promise<void> => {
  const url = baseRequestUrl + `/user/unfollow/${userId}`;
  await fetch(url, {
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Authorization: auth.bearerToken(),
    },
  });
};

export { followUserRequest, unfollowUserRequest };
