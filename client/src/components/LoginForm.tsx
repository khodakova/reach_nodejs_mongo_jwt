import React, {useContext, useState} from 'react';
import {Context} from "../index";

interface IHandleClick {
    fn(arg?: any): any
}

interface InputFunction extends Function {
    (n:string):any;
}

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const {store} = useContext(Context);

    const handleClick = (e: React.ChangeEvent<HTMLInputElement>, fn: InputFunction) => {
        e.preventDefault();
        fn(e.target.value);
    };

    return (
        <div>
            <input type='text'
                   placeholder='Введите e-mail'
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
            />
            <input type='password'
                   placeholder='Введите пароль'
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => store.login(email, password)}>
                Войти
            </button>
            <button onClick={() => store.registration(email, password)}>
                Зарегистрироваться
            </button>
        </div>
    );
};

export default LoginForm;
