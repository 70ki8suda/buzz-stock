export type ProfileUpdateDataType = {
  name: string | null;
  introduction: string | null;
  image: string | null;
  imageSelected: boolean;
};

export const InitialProfileUpdateData = {
  name: null,
  introduction: null,
  image: null,
  imageSelected: false,
};
