import React from 'react';
import {app} from "../App";
import {getLoggedOutNav} from "../helper/defaultNav";
import RouteBase from "./RouteBase";

export default class Login extends RouteBase {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            keepLoggedIn: false,
            isLoggingIn: false,
            error: null,
        };

        this.usernameRef = React.createRef();
        this.passwordRef = React.createRef();
        this.keepLoggedInRef = React.createRef();
    }

    async login() {
        const username = this.usernameRef.current.value;
        const password = this.passwordRef.current.value;
        const keepLoggedIn = this.keepLoggedInRef.current.checked;

        try {
            this.setState({
                username,
                password,
                keepLoggedIn,
                isLoggingIn: true,
            });

            const body = {
                username,
                password,
            };
            let loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(body),
            });

            if (loginResponse.ok) {
                const token = await loginResponse.text();
                document.cookie = `auth=${token}`;

                const userResponse = await fetch('/api/user');
                if (userResponse.ok) {
                    app.data.user = await userResponse.json();
                    app.data.authToken = token;
                    this.props.history.push('/');
                } else {
                    this.setError('A error occured');
                }
            } else if (loginResponse.status === 400) {
                this.setError('Please enter a correct Username and password');
            } else {
                this.setError('A error occured');
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    setError(message) {
        this.setState({
            isLoggingIn: false,
            error: message,
        });
    }

    render() {
        document.title = 'GIFs - Login';

        if (this.state.isLoggingIn) {
            return (
                <div className="center">
                    <div className="spinner-border text-primary"/>
                </div>
            );
        }

        return (
            <div className="pt-2">
                <div className="form-group">
                    <label>Username:</label>
                    <input ref={this.usernameRef} type="text" defaultValue={this.state.username}
                           className="form-control" placeholder="Enter username"/>
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input ref={this.passwordRef} type="password" defaultValue={this.state.password}
                           className="form-control" placeholder="Enter password"/>
                </div>
                <div className="form-group form-check">
                    <label className="form-check-label">
                        <input ref={this.keepLoggedInRef} type="checkbox"
                               defaultChecked={this.state.keepLoggedIn}
                               className="form-check-input"/>
                        Remember me
                    </label>
                </div>

                <div className={`form-group form-check  ${this.state.error ? '' : 'd-none'}`}>
                    <label className="form-check-label">
                        <input className="is-invalid d-none"/>
                        <div className="invalid-feedback">{this.state.error}</div>
                    </label>
                </div>

                <button className="btn bg-primary text-light float-left"
                        onClick={async () => await this.login()}>
                    Login
                </button>
            </div>
        );
    }

    getNavProps() {
        return getLoggedOutNav();
    }
}