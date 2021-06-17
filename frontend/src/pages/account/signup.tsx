import React, { useState, useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

//utils
import auth from '../../utils/auth';
//context
import { LoggedInContext } from '../_app';
//service
import { signupRequest } from 'src/service/auth/signup.service';
import { loginRequest } from 'src/service/auth/login.service';
//style
import style from './Auth.module.scss';

const Signup = () => {
  const { setLoggedInState } = useContext(LoggedInContext);
  const router = useRouter();
  const [data, setData] = useState({
    name: '',
    display_id: '',
    email: '',
    password: '',
  });

  const [messages, setMessages] = useState({
    name: '',
    display_id: '',
    email: '',
    password: '',
  });

  const [serverResponse, setServerResponse] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const formValidate = (name: string, value: string) => {
    switch (name) {
      case 'name':
        return nameValidation(value);
      case 'display_id':
        return idValidation(value);
      case 'email':
        return emailValidation(value);
      case 'password':
        return passwordValidation(value);
    }
  };
  const nameValidation = (name: string) => {
    if (!name) return 'nameを入力してください';
    return '';
  };

  const idValidation = (id: string) => {
    if (!id) return 'idを入力してください';
    if (id.length > 20) return 'IDは20文字以下でお願いします';
    const regex = /^[a-z_0-9]+$/i;
    if (!regex.test(id)) return 'IDに使える文字は 英・数字・_ のみです';

    return '';
  };

  const emailValidation = (email: string) => {
    if (!email) return 'メールアドレスを入力してください';

    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regex.test(email)) return '正しい形式でメールアドレスを入力してください';

    return '';
  };

  const passwordValidation = (password: string) => {
    if (!password) return 'passwordを入力してください';
    if (password.length < 4) return 'パスワードは4文字以上でお願いします';
    return '';
  };

  // 3. handleSignUpメソッドの定義
  async function handleSignUp(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const { name, display_id, email, password } = data;
    let siguUpSuccess = false;
    const formData = new FormData();
    formData.append('name', name);
    formData.append('display_id', display_id);
    formData.append('email', email);
    formData.append('password', password);

    //ユーザーデータ作成
    const signup = async (): Promise<void> => {
      const result = await signupRequest(formData);
      if (!result.error) {
        siguUpSuccess = true;
      } else {
        setServerResponse([]);
        if (typeof result.message == 'string') {
          setServerResponse([result.message]);
        } else {
          setServerResponse(result.message);
        }
        console.log(serverResponse);
      }
      console.log(result);
    };
    signup();
    //一秒待機
    await new Promise((r) => setTimeout(r, 1000));
    //そのあと自動でtoken発行してログイン処理
    if (siguUpSuccess) {
      const formData2 = new FormData();
      formData2.append('email', email);
      formData2.append('password', password);
      const login = async (): Promise<void> => {
        const result = await loginRequest(formData2);
        auth.login(result);
        setLoggedInState(auth.isAuthenticated());
        const userId = result.userId;
        router.push(`/user/${userId}`);
      };
      login();
    }
  }

  return (
    <>
      <Head>
        <title>Buzz Stock .com | Sign Up</title>
      </Head>
      <div className={style['auth-wrap']}>
        <h2 className={style['auth-title']}>Sign Up</h2>
        <div className={style['server-response-container']}>
          {serverResponse.map((message, index) => (
            <p className={style['server-response']} key={index}>
              {message}
            </p>
          ))}
        </div>
        <div className={style['form-container']}>
          <form className={style['form']}>
            <div className="form-item">
              <label htmlFor="name">
                名前<span className={style['validation-message']}>{messages.name}</span>
              </label>
              <input
                type="text"
                placeholder="name"
                name="name"
                value={data.name}
                onChange={handleInputChange}
                className={style['text-input']}
              />
            </div>
            <div className="form-item">
              <label htmlFor="display_id">
                ユーザーID (英・数字・_ )
                <span className={style['validation-message']}>{messages.display_id}</span>
              </label>
              <input
                required={true}
                type="text"
                placeholder="ID"
                name="display_id"
                value={data.display_id}
                onChange={handleInputChange}
                className={style['text-input']}
              />
            </div>
            <div className="form-item">
              <label htmlFor="email">
                メールアドレス
                <span className={style['validation-message']}>{messages.email}</span>
              </label>
              <input
                type="text"
                required={true}
                placeholder="email address"
                name="email"
                value={data.email}
                onChange={handleInputChange}
                className={style['text-input']}
              />
            </div>
            <div className="form-item">
              <label htmlFor="password">
                パスワード
                <span className={style['validation-message']}>{messages.password}</span>
              </label>
              <input
                type="password"
                required={true}
                placeholder="password"
                name="password"
                onChange={handleInputChange}
                className={style['text-input']}
              />
            </div>

            <button
              className={style['auth-submit']}
              onClick={(e) => handleSignUp(e)}
              data-test="signUp-submit"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
