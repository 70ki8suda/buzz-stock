import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
//components
//utils
import auth from '../../utils/auth';
//style
import authStyle from '../../styles/pages/Auth.module.scss';
//Context
import { LoggedInContext } from '../_app';
const Login = () => {
  const { LoggedInState, setLoggedInState } = useContext(LoggedInContext);
  const router = useRouter();
  const [data, setData] = React.useState({
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

  async function onSubmitHandler(e) {
    e.preventDefault();
    // stateからemailとpasswordを取得する
    const { email, password } = data;
    console.log('clicked');
    console.log('email' + email);
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_path = baseRequestUrl + '/api/v1/user_token';
    // 4. firebaseにemailとpasswordをPOST
    let formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    const loginApi = await fetch(api_path, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      body: formData,
    }).catch((error) => {
      console.error('Error:', error);
    });
    const result = await loginApi.json();
    auth.login(result);
    setLoggedInState(auth.isAuthenticated());
    let userID = auth.loggedin_userID();
    router.push(`/user/${userID}`);
  }

  return (
    <>
      <Head>
        <title>Buzz Stock .com | Log In</title>
      </Head>
      <div className={authStyle['auth-wrap']}>
        <h2 className={authStyle['auth-title']}>Log In</h2>
        <div className={authStyle['auth-form']}>
          <form className="register-form">
            <div className="form-item">
              <label htmlFor="email">メールアドレス</label>
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
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                required={true}
                placeholder="password"
                name="password"
                onChange={handleInputChange}
              />
            </div>
            <button className={authStyle['auth-submit']} onClick={(e) => onSubmitHandler(e)}>
              Log In
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
