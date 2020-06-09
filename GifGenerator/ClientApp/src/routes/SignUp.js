import React from 'react';
import {getLoggedOutNav} from "../helper/defaultNav";
import RouteBase from "./RouteBase";

export default class SignUp extends RouteBase {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            passwordDiffer: false,
            isLoggingIn: false,
            errors: null,
        };

        this.usernameRef = React.createRef();
        this.passwordRef = React.createRef();
        this.repeatRef = React.createRef();
    }

    async signUp() {
        const username = this.usernameRef.current.value;
        const password = this.passwordRef.current.value;
        const repeat = this.repeatRef.current.value;

        if (password !== repeat) {
            this.setState({
                passwordDiffer: true,
                error: null,
            });
            return;
        }

        try {
            this.setState({
                username,
                passwordDiffer: false,
                isLoggingIn: true,
                error: null,
            });

            const body = {
                username,
                password,
            };
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(body),
            });

            if (!this.isComponentMounted) {
                return;
            }
            if (response.ok) {
                this.props.history.push('/login');
            } else {
                const error = await response.text();
                this.setState({
                    isLoggingIn: false,
                    error: error,
                });
            }
        } catch (e) {
            this.setState({
                isLoggingIn: false,
                error: e.message,
            });
        }
    }

    render() {
        document.title = 'GIFs - Sign up';

        if (this.state.isLoggingIn) {
            return (
                <div className="center">
                    <div>
                        <div className="spinner-border text-primary"/>
                    </div>
                    <label>Signing up</label>
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
                    <input ref={this.passwordRef} type="password"
                           className="form-control" placeholder="Enter password"/>
                </div>
                <div className="form-group">
                    <label>Repeat password:</label>
                    <input ref={this.repeatRef} type="password" placeholder="Enter password again"
                           className="form-control"/>

                    <p className={`text-danger ${this.state.passwordDiffer ? '' : 'd-none'}`}>
                        Passwords do not match.
                    </p>
                </div>

                <div className={`form-group form-check  ${this.state.error ? '' : 'd-none'}`}>
                    <label className="form-check-label">
                        <input className="is-invalid d-none"/>
                        <div className="invalid-feedback">{this.state.error}</div>
                    </label>
                </div>

                <button className="btn bg-primary text-light float-left"
                        onClick={async () => await this.signUp()}>
                    Sign up
                </button>
            </div>
        );
    }

    getNavProps() {
        return getLoggedOutNav();
    }
}