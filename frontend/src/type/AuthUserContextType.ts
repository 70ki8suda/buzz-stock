import { UserDataType } from './UserDataType';

export type AuthUserContextType = {
  authUserData: UserDataType;
  // eslint-disable-next-line no-unused-vars
  setAuthUserData: (c: UserDataType) => void;
};
