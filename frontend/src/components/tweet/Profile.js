import React, { useState, useEffect, useContext } from 'react';

const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
import profileStyle from './Profile.module.scss';
import postStyle from './PostTweet.module.scss';
//context data
import { AuthUserData } from '../../pages/_app';
import Router from 'next/router';
const Profile = ({ userID }) => {
  //profileデータ
  const [ProfileDisplayData, setProfileDisplayData] = React.useState({});
  const [ProfileUpdateState, setProfileUpdateState] = React.useState(0);
  const [ProfileUpdateData, setProfileUpdateData] = React.useState({});
  //editToggleState
  const [EditToggleState, setEditToggleState] = React.useState(false);

  const user_data_path = baseRequestUrl + '/user/' + userID;
  const { AuthUserProfile } = useContext(AuthUserData);
  const loggedin_userID = AuthUserProfile.id;

  //did mount 初期表示profileデータ
  React.useEffect(
    (ProfileUpdateState, userID) => {
      fetch(user_data_path, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          console.log(json);
          setProfileDisplayData(json);
          if (loggedin_userID == userID) {
            setProfileUpdateData(json);
          }
        });
    },
    [ProfileUpdateState, userID],
  );
  const handleInputChange = (e) => {
    const target = e.target;
    const name = target.name;

    setProfileUpdateData(() => {
      return { ...ProfileUpdateData, [name]: target.value };
    });
  };
  const editToggle = (e) => {
    setEditToggleState(!EditToggleState);
  };
  const setProfileImageFile = (e) => {
    e.preventDefault();
    let size_in_megabytes = e.target.files[0].size / 1024 / 1024;

    if (size_in_megabytes > 1) {
      alert('Maximum file size is 1MB. Please choose a smaller file.');
      setProfileUpdateData({ image: null, imageSelected: false });
      document.getElementById('profile-image-input').value = '';
      return;
    }
    setProfileUpdateData(() => {
      return { ...ProfileUpdateData, image: e.target.files[0], imageSelected: true };
    });
    console.log(ProfileUpdateData);
  };
  //update request
  async function UpdateProfile(e) {
    e.preventDefault();
    const { name, introduction, image } = ProfileUpdateData;
    console.log(ProfileUpdateData);
    let formData = new FormData();
    if (name != null) {
      formData.append('name', name);
    }
    if (introduction != null) {
      formData.append('introduction', introduction);
    }
    if (image !== undefined) {
      formData.append('profile_image', image);
    }
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_path = baseRequestUrl + '/user/update_profile';

    await fetch(api_path, {
      method: 'PATCH',
      mode: 'cors',
      credentials: 'include',
      body: formData,
    })
      .then((res) => {
        setProfileUpdateState(ProfileUpdateState + 1);
        console.log(ProfileUpdateState);
      })
      .then(() => {
        document.getElementById('profile-image-input').value = '';
        document.getElementById('profile-name-input').value = '';
        document.getElementById('profile-introduction-input').value = '';
        setProfileUpdateData(() => {
          return { ...ProfileUpdateData, imageSelected: false };
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    Router.reload();
  }
  const followUser = (e) => {
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_path = baseRequestUrl + `/user/follow/${userID}`;

    fetch(api_path, {
      method: 'PATCH',
      mode: 'cors',
      credentials: 'include',
    });
    setProfileDisplayData({
      ...ProfileDisplayData,
      following: true,
      followers_num: ProfileDisplayData.followers_num + 1,
    });
  };

  const unfollowUser = (e) => {
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_path = baseRequestUrl + `/user/unfollow/${userID}`;

    fetch(api_path, {
      method: 'PATCH',
      mode: 'cors',
      credentials: 'include',
    });
    setProfileDisplayData({
      ...ProfileUpdateData,
      following: false,
      followers_num: ProfileDisplayData.followers_num - 1,
    });
  };

  return (
    <div className={profileStyle['layout-top']}>
      <div className={profileStyle['wrap']}>
        <div className={profileStyle['image-wrap']}>
          {ProfileDisplayData.profile_image != null ? (
            <img src={ProfileDisplayData.profile_image} />
          ) : (
            <img src="/images/profile-default.png" />
          )}
        </div>
        <div className="info">
          <h2 className={profileStyle['name']}>{ProfileDisplayData.name}</h2>
          <div className={profileStyle['display-id']}> @{ProfileDisplayData.display_id}</div>
          <div className={profileStyle['introduction']}> {ProfileDisplayData.introduction}</div>
          <div className={profileStyle['relationship-info']}>
            <span className={profileStyle['relationship-num']}>
              Following: {ProfileDisplayData.following_num}
            </span>
            <span className={profileStyle['relationship-num']}>
              Follower: {ProfileDisplayData.followers_num}
            </span>
          </div>
        </div>
        {loggedin_userID == userID && !EditToggleState && (
          <button
            className={`submit-btn ${profileStyle['edit-profile']}`}
            onClick={(e) => editToggle(e)}
          >
            編集
          </button>
        )}
        {loggedin_userID == userID && EditToggleState && (
          <button
            className={`submit-btn ${profileStyle['edit-profile']} ${profileStyle['edit-profile-active']}`}
            onClick={(e) => editToggle(e)}
          >
            閉じる
          </button>
        )}
      </div>
      {loggedin_userID == userID && EditToggleState && (
        <form className={profileStyle['update-form']}>
          <div className="form-item">
            <label htmlFor="name">名前</label>
            <input
              type="text"
              placeholder={ProfileDisplayData.name}
              name="name"
              onChange={handleInputChange}
              id="profile-name-input"
            />
          </div>
          <div className="form-item">
            <label htmlFor="introduction">自己紹介</label>
            <input
              type="text"
              placeholder={ProfileDisplayData.introduction}
              name="introduction"
              onChange={handleInputChange}
              id="profile-introduction-input"
            />
          </div>
          <div className={`image-input-wrap ${postStyle['image-update']}`}>
            <label
              htmlFor="profile-image-input"
              className={`image-input-label ${postStyle['image-input-label']} ${
                ProfileUpdateData.imageSelected ? 'active' : ''
              }`}
            ></label>
            <input
              type="file"
              id="profile-image-input"
              name="profile-image"
              accept="image/png,image/jpeg"
              onChange={setProfileImageFile}
              className="image-input"
            />
          </div>

          <button className="submit-btn" onClick={(e) => UpdateProfile(e)}>
            更新
          </button>
        </form>
      )}

      {loggedin_userID != userID && !ProfileDisplayData.following && (
        <button className={profileStyle['follow-btn']} onClick={(e) => followUser(e)}>
          FOLLOW
        </button>
      )}
      {loggedin_userID != userID && ProfileDisplayData.following && (
        <button className={profileStyle['unfollow-btn']} onClick={(e) => unfollowUser(e)}>
          UNFOLLOW
        </button>
      )}
    </div>
  );
};

export default Profile;
