export type ProfileDisplayDataType = {
  id: number;
  name: string;
  display_id: string;
  introduction: string;
  profile_image?: string;
  following_num: number;
  followers_num: number;
  following: boolean;
};

export const InitialProfileDisplayData = {
  id: 0,
  name: '',
  display_id: '',
  introduction: '',
  following_num: 0,
  followers_num: 0,
  following: false,
};
