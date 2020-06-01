import React, {Component} from 'react';
import {Link, withRouter} from "react-router-dom";

export default class Login extends Component {
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

            if (loginResponse.status === 200) {
                const token = await loginResponse.text();
                document.cookie = `auth=${token}`;

                const userResponse = await fetch('/api/user');
                if (userResponse.status === 200) {
                    this.props.data.user = await userResponse.json();
                    this.props.data.authToken = token;
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
        if (this.state.isLoggingIn) {
            return (
                <div className="center">
                    <div className="spinner-border text-primary"/>
                </div>
            );
        }

        return (
            <div className="container">
                <div className="center w-50">
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
                            <input ref={this.keepLoggedInRef} type="checkbox" defaultChecked={this.state.keepLoggedIn}
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

                    <Link to="/signup">
                        <button className="btn bg-secondary text-light float-right">
                            Sign up
                        </button>
                    </Link>
                </div>
            </div>
        );
    }
}