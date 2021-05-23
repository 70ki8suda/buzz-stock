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
  const { setLoggedInState } = useContext(LoggedInContext);
  const router = useRouter();
  const [data, setData] = React.useState({
    email: '',
    password: '',
  });
  const [messages, setMessages] = React.useState({
    name: '',
    display_id: '',
    email: '',
    password: '',
  });
  const [serverResponse, setServerResponse] = React.useState([]);
  const handleInputChange = (e) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    setData(() => {
      return { ...data, [name]: value };
    });
    setMessages(() => {
      return { ...messages, [name]: formValidate(name, value) };
    });
  };
  const formValidate = (name, value) => {
    switch (name) {
      case 'email':
        return emailValidation(value);
      case 'password':
        return passwordValidation(value);
    }
  };

  const emailValidation = (email) => {
    if (!email) return 'メールアドレスを入力してください';

    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regex.test(email)) return '正しい形式でメールアドレスを入力してください';

    return '';
  };

  const passwordValidation = (password) => {
    if (!password) return 'passwordを入力してください';
    if (password.length < 4) return 'パスワードは4文字以上でお願いします';
    return '';
  };

  async function onSubmitHandler(e) {
    e.preventDefault();
    // stateからemailとpasswordを取得する
    const { email, password } = data;

    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_path = baseRequestUrl + '/auth/signin';
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
    console.log(result);
    if (!result.error) {
      auth.login(result);
      setLoggedInState(auth.isAuthenticated());
      let userID = result.userId;
      router.push(`/user/${userID}`);
    } else {
      if (typeof result.message == 'string') {
        setServerResponse([]);
        setServerResponse([result.message]);
      } else {
        setServerResponse([]);
        result.message.map((message) => {
          setServerResponse([...serverResponse, message]);
        });
      }
      console.log(data);
    }
  }

  return (
    <>
      <Head>
        <title>Buzz Stock .com | Log In</title>
      </Head>
      <div className={authStyle['auth-wrap']}>
        <h2 className={authStyle['auth-title']}>Log In</h2>
        <div className={authStyle['server-response-container']}>
          {serverResponse.map((message, index) => (
            <p className={authStyle['server-response']} key={index}>
              {message}
            </p>
          ))}
        </div>
        <div className={authStyle['form-container']}>
          <form className={authStyle['form']}>
            <div className="form-item">
              <label htmlFor="email">
                メールアドレス
                <span className={authStyle['validation-message']}>{messages.email}</span>
              </label>
              <input
                type="text"
                required={true}
                placeholder="email address"
                name="email"
                value={data.email}
                onChange={handleInputChange}
                className={authStyle['text-input']}
              />
            </div>
            <div className="form-item">
              <label htmlFor="password">
                パスワード
                <span className={authStyle['validation-message']}>{messages.password}</span>
              </label>
              <input
                type="password"
                required={true}
                placeholder="password"
                name="password"
                onChange={handleInputChange}
                className={authStyle['text-input']}
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
