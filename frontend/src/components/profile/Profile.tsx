import React, { useState, useEffect, useContext } from 'react';
import style from './Profile.module.scss';
//context data
import { AuthUserContext } from '../../pages/_app';
//type
import {
  ProfileDisplayDataType,
  InitialProfileDisplayData,
} from 'src/type/ProfileDisplayData.type';
import { InitialProfileUpdateData, ProfileUpdateDataType } from 'src/type/ProfileUpdateData.type';
//service
import { getProfileData, updateProfileRequest } from 'src/service/profile/profile.service';
import { followUserRequest, unfollowUserRequest } from 'src/service/follow/follow.service';
const Profile = ({ userId }: { userId: string }) => {
  //profileデータ
  const [profileDisplayData, setProfileDisplayData] =
    useState<ProfileDisplayDataType>(InitialProfileDisplayData);
  const [profileUpdateState, setProfileUpdateState] = useState<number>(0);
  const [profileUpdateData, setProfileUpdateData] =
    useState<ProfileUpdateDataType>(InitialProfileUpdateData);
  //editToggleState
  const [editToggleState, setEditToggleState] = useState(false);

  const { authUserData } = useContext(AuthUserContext);
  const loggedin_userId = authUserData.id;

  //did mount 初期表示profileデータ
  useEffect(() => {
    const fetchProfileData = async (userId: string): Promise<void> => {
      const profileData = await getProfileData(userId);
      setProfileDisplayData(profileData);
    };
    fetchProfileData(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUpdateState, userId]);
  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLButtonElement;

    setProfileUpdateData(() => {
      return { ...profileUpdateData, [name]: value };
    });
  };
  const editToggle = () => {
    setEditToggleState(!editToggleState);
  };
  const setProfileImageFile = (targetImage: any) => {
    const image = targetImage;
    if (image !== null) {
      const size_in_megabytes = image.size / 1024 / 1024;

      if (size_in_megabytes > 1) {
        alert('Maximum file size is 1MB. Please choose a smaller file.');
        setProfileUpdateData({ ...profileUpdateData, image: null, imageSelected: false });
        (document.getElementById('profile-image-input')! as HTMLInputElement).value = '';
        return;
      }
      setProfileUpdateData(() => {
        return { ...profileUpdateData, image: image, imageSelected: true };
      });
    }
  };
  //update request
  async function UpdateProfile(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const { name, introduction, image } = profileUpdateData;
    const formData: FormData = new FormData();
    if (name != null) {
      formData.append('name', name);
    }
    if (introduction != null) {
      formData.append('introduction', introduction);
    }
    if (image != null) {
      formData.append('profile_image', image);
    }

    await updateProfileRequest(formData);

    setProfileUpdateState(profileUpdateState + 1);
    (document.getElementById('profile-image-input')! as HTMLInputElement).value = '';
    (document.getElementById('profile-name-input')! as HTMLInputElement).value = '';
    (document.getElementById('profile-introduction-input')! as HTMLInputElement).value = '';
    setProfileUpdateData(() => {
      return { ...profileUpdateData, imageSelected: false };
    });
  }
  const followUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await followUserRequest(userId);
    setProfileDisplayData({
      ...profileDisplayData,
      following: true,
      followers_num: profileDisplayData.followers_num + 1,
    });
  };

  const unfollowUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await unfollowUserRequest(userId);
    setProfileDisplayData({
      ...profileDisplayData,
      following: false,
      followers_num: profileDisplayData.followers_num - 1,
    });
  };

  return (
    <div className={style['layout-top']}>
      <div className={style['wrap']}>
        <div className={style['image-wrap']}>
          {profileDisplayData.profile_image != null ? (
            <img src={profileDisplayData.profile_image} />
          ) : (
            <img src="/images/profile-default.png" />
          )}
        </div>
        <div className="info">
          <h2 className={style['name']} data-test="display-name">
            {profileDisplayData.name}
          </h2>
          <div className={style['display-id']}> @{profileDisplayData.display_id}</div>
          <div className={style['introduction']}> {profileDisplayData.introduction}</div>
          <div className={style['relationship-info']}>
            <span className={style['relationship-num']} data-test="following-num">
              Following: {profileDisplayData.following_num}
            </span>
            <span className={style['relationship-num']} data-test="follower-num">
              Follower: {profileDisplayData.followers_num}
            </span>
          </div>
        </div>
        {loggedin_userId === parseInt(userId) && !editToggleState && (
          <button className={`submit-btn ${style['edit-profile']}`} onClick={() => editToggle()}>
            編集
          </button>
        )}
        {loggedin_userId === parseInt(userId) && editToggleState && (
          <button
            className={`submit-btn ${style['edit-profile']} ${style['edit-profile-active']}`}
            onClick={() => editToggle()}
          >
            閉じる
          </button>
        )}
      </div>
      {loggedin_userId === parseInt(userId) && editToggleState && (
        <form className={style['update-form']}>
          <div className="form-item">
            <label htmlFor="name">名前</label>
            <input
              id="profile-name-input"
              type="text"
              name="name"
              placeholder={profileDisplayData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="introduction">自己紹介</label>
            <input
              type="text"
              placeholder={profileDisplayData.introduction}
              name="introduction"
              onChange={handleInputChange}
              id="profile-introduction-input"
            />
          </div>
          <div className={`image-input-wrap`}>
            <label
              htmlFor="profile-image-input"
              className={`image-input-label ${profileUpdateData.imageSelected ? 'active' : ''}`}
            ></label>
            <input
              type="file"
              className="image-input"
              id="profile-image-input"
              name="profile-image"
              accept="image/png,image/jpeg"
              onChange={(e) =>
                setProfileImageFile(e.target.files !== null ? e.target.files[0] : null)
              }
            />
          </div>

          <button
            className="submit-btn"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => UpdateProfile(e)}
          >
            更新
          </button>
        </form>
      )}

      {loggedin_userId !== parseInt(userId) && !profileDisplayData.following && (
        <button
          className={style['follow-btn']}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => followUser(e)}
          data-test="follow-btn"
        >
          FOLLOW
        </button>
      )}
      {loggedin_userId !== parseInt(userId) && profileDisplayData.following && (
        <button
          className={style['unfollow-btn']}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => unfollowUser(e)}
        >
          UNFOLLOW
        </button>
      )}
    </div>
  );
};

export default Profile;
