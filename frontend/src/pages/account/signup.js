import React, { useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
//components
//utils
import auth from '../../utils/auth';
//style
import authStyle from '../../styles/pages/Auth.module.scss';
//context
import { LoggedInContext } from '../_app';
import { AuthUserData } from '../_app';
const Signup = () => {
  const { setLoggedInState } = useContext(LoggedInContext);
  const { AuthUserProfile } = useContext(AuthUserData);
  const router = useRouter();
  const [data, setData] = React.useState({
    name: '',
    display_id: '',
    email: '',
    password: '',
  });
  const handleInputChange = (e) => {
    const target = e.target;
    const name = target.name;
    setData(() => {
      return { ...data, [name]: target.value };
    });
  };

  // 3. handleSignUpメソッドの定義
  async function handleSignUp(e) {
    e.preventDefault();

    const { name, display_id, email, password } = data;
    let siguUpSuccess = false;
    let formData = new FormData();
    formData.append('name', name);
    formData.append('display_id', display_id);
    formData.append('email', email);
    formData.append('password', password);
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const signup_api_path = baseRequestUrl + '/auth/signup';

    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      body: formData,
    };

    //ユーザーデータ作成
    await fetch(signup_api_path, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        siguUpSuccess = true;
        console.log(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    //そのあと自動でtoken発行してログイン処理
    if (siguUpSuccess) {
      const login_api_path = baseRequestUrl + '/auth/signin';
      let formData2 = new FormData();
      formData2.append('email', email);
      formData2.append('password', password);
      const loginApi = await fetch(login_api_path, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: formData2,
      }).catch((error) => {
        console.error('Error:', error);
      });

      const result = await loginApi.json();
      auth.login(result);

      setLoggedInState(auth.isAuthenticated());
      //console.log(AuthUserProfile);
      let userID = result.userId;
      router.push(`/user/${userID}`);
    }
  }

  return (
    <>
      <Head>
        <title>Buzz Stock .com | Sign Up</title>
      </Head>
      <div className={authStyle['auth-wrap']}>
        <h2 className={authStyle['auth-title']}>Sign Up</h2>
        <div className={authStyle['auth-form']}>
          <form className="register-form">
            <div className="form-item">
              <label htmlFor="name">名前</label>
              <input
                required={true}
                type="text"
                placeholder="name"
                name="name"
                value={data.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="name">ユーザーID</label>
              <input
                required={true}
                type="text"
                placeholder="ID"
                name="display_id"
                value={data.display_id}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="name">メールアドレス</label>
              <input
                type="text"
                required={true}
                placeholder="email address"
                name="email"
                value={data.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="name">パスワード</label>
              <input
                type="password"
                required={true}
                placeholder="password"
                name="password"
                onChange={handleInputChange}
              />
            </div>
            <button className={authStyle['auth-submit']} onClick={(e) => handleSignUp(e)}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
