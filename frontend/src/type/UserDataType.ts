export type UserDataType = {
  id: number;
  display_id: string;
  email: string;
  followers_num: number;
  following_num: number;
  following: boolean;
  introduction: string;
  name: string;
  profile_image?: string | null | undefined;
};

export const InitialUserData = {
  id: 0,
  display_id: '',
  email: '',
  followers_num: 0,
  following_num: 0,
  following: false,
  introduction: '',
  name: '',
};
