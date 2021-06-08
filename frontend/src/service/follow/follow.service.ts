const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import auth from '../../utils/auth';

const followUserRequest = async (userId: string): Promise<void> => {
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

const unfollowUserRequest = async (userId: string): Promise<void> => {
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
