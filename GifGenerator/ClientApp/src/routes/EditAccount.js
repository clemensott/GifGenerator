import React from 'react';
import DataCacheBase from "./DataCacheBase";
import {app} from "../App";
import {getLoggedInNav} from "../helper/defaultNav";

export default class EditAccount extends DataCacheBase {
    constructor(props) {
        super(props);

        this.state = {
            passwordDiffer: false,
            isChangingPassword: false,
            changePasswordSuccessfully: false,
            error: null,
        }

        this.newPasswordRef = React.createRef();
        this.repeatPasswordRef = React.createRef();
    }

    async changePassword() {
        const newPassword = this.newPasswordRef.current.value;
        const repeatPassword = this.repeatPasswordRef.current.value;

        if (newPassword !== repeatPassword) {
            this.setState({
                passwordDiffer: true,
                isChangingPassword: false,
                changePasswordSuccessfully: false,
                error: null,
            });
            return;
        }
        try {
            this.setState({
                passwordDiffer: false,
                isChangingPassword: true,
                changePasswordSuccessfully: false,
                error: null,
            });

            const body = {
                newPassword,
            };
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                this.setState({
                    passwordDiffer: false,
                    isChangingPassword: false,
                    changePasswordSuccessfully: true,
                    error: null,
                });
            } else {
                const error = await response.text();
                this.setState({
                    passwordDiffer: false,
                    isChangingPassword: false,
                    changePasswordSuccessfully: false,
                    error: error,
                });
            }
        } catch (e) {
            this.setState({
                isChangingPassword: false,
                changePasswordSuccessfully: false,
                error: e.message,
            });
        }
    }

    render() {
        return (
            <div className="pt-2">
                <div className={this.state.isChangingPassword ? 'd-none' : ''}>
                    <div className="form-group">
                        <label>New password:</label>
                        <input ref={this.newPasswordRef} type="password"
                               className="form-control" placeholder="Enter new password"/>
                    </div>
                    <div className="form-group">
                        <label>Repeat new password:</label>
                        <input ref={this.repeatPasswordRef} type="password" placeholder="Enter new password again"
                               className="form-control"/>
                    </div>

                    <div className={`form-group form-check  ${this.state.passwordDiffer ? '' : 'd-none'}`}>
                        <label className="form-check-label">
                            <input className="is-invalid d-none"/>
                            <div className="invalid-feedback">New passwords do not match.</div>
                        </label>
                    </div>

                    <div className={`form-group form-check  ${this.state.error ? '' : 'd-none'}`}>
                        <label className="form-check-label">
                            <input className="is-invalid d-none"/>
                            <div className="invalid-feedback">{this.state.error}</div>
                        </label>
                    </div>

                    <div
                        className={`form-group form-check  ${this.state.changePasswordSuccessfully ? '' : 'd-none'}`}>
                        <label className="form-check-label">
                            <input className="is-valid d-none"/>
                            <div className="valid-feedback">Password changed successfully.</div>
                        </label>
                    </div>

                    <button className="btn bg-primary text-light"
                            onClick={async () => await this.changePassword()}>
                        Change Password
                    </button>
                </div>

                <div className={`center ${this.state.isChangingPassword ? '' : 'd-none'}`}>
                    <div className="spinner-border text-primary"/>
                </div>
            </div>
        );
    }

    async componentDidMount() {
        super.componentDidMount();
        document.title = 'GIFs - Edit Account';
        await this.checkRootCategory();
    }

    async componentDidUpdate() {
        super.componentDidUpdate();
        await this.checkRootCategory();
    }

    async checkRootCategory() {
        if (app.data.user) await this.checkUpdatePath(app.data.user.rootCategoryId);
    }

    getNavProps() {
        return getLoggedInNav(this.getPath());
    }

    getPath() {
        return {
            links: [{
                href: `/${app.data.user && app.data.user.rootCategoryId || ''}`,
                text: 'GIFs',
            }],
        }
    }
}