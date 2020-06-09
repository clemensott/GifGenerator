import React from 'react';
import {app} from "../App";
import RouteBase from "./RouteBase";
import {getLoggedOutNav} from "../helper/defaultNav";
import {deleteCookie, getCookieValue} from "../helper/cookies";

export default class Logout extends RouteBase {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="center">
                <div>
                    <div className="spinner-border text-primary"/>
                </div>
                <label>Loging out</label>
            </div>
        );
    }

    async componentDidMount() {
        super.componentDidMount();

        const authToken = getCookieValue('auth');
        deleteCookie('auth');
        app.data.user = null;
        app.cache.categories = {};
        app.cache.categoryData = {};
        app.cache.gifs = {};

        try {
            if (authToken) {
                await fetch(`/api/auth/logout/${authToken}`, {
                    method: 'DELETE',
                });
            }
        } catch (e) {
            console.log(e);
        }

        if (this.isComponentMounted) {
            this.props.history.push('/login');
        }
    }

    getNavProps() {
        return getLoggedOutNav();
    }
}