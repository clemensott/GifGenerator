import React from 'react';
import {getLoggedOutNav} from "../helper/defaultNav";
import RouteBase from "./RouteBase";

export default class SignUp extends RouteBase {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            isLoggingIn: false,
            error: null,
        };

        this.usernameRef = React.createRef();
        this.passwordRef = React.createRef();
        this.repeatRef = React.createRef();
    }

    async signUp() {
        const username = this.usernameRef.current.value;
        const password = this.passwordRef.current.value;
        const repeat = this.repeatRef.current.value;

        if(!username){
            this.setState({
                error: 'Username is missing',
            });
            return;
        }
        if(!password){
            this.setState({
                error: 'Password is missing',
            });
            return;
        }
        if(!repeat){
            this.setState({
                error: 'Repeated password is missing',
            });
            return;
        }
        if (password !== repeat) {
            this.setState({
                error: 'Passwords do not match',
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
            <form className="pt-2" onSubmit={async e => {
                e.preventDefault();
                await this.signUp();
            }}>
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
                </div>

                <div className={`alert alert-danger ${this.state.error ? '' : 'd-none'}`}>
                    {this.state.error}
                </div>

                <button className="btn bg-primary text-light float-left" type="submit">
                    Sign up
                </button>
            </form>
        );
    }

    getNavProps() {
        return getLoggedOutNav();
    }
}