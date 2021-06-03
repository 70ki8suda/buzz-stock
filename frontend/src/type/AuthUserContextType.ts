import { UserDataType } from './UserDataType';

export type AuthUserContextType = {
  authUserData: UserDataType;
  setAuthUserData: (c: UserDataType) => void;
};
