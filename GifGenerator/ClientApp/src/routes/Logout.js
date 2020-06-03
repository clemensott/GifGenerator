import React from 'react';
import {Redirect} from "react-router-dom";
import {app} from "../App";
import RouteBase from "./RouteBase";
import {getLoggedOutNav} from "../helper/defaultNav";

export default class Logout extends RouteBase {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
        }
    }

    render() {
        if (this.state.redirect) return <Redirect to="/login"/>

        return (
            <div className="center">
                <div className="spinner-border text-primary"/>
            </div>
        );
    }

    async componentDidMount() {
        super.componentDidMount();

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
        } catch (e) {
            console.log(e);
        }

        this.deleteAllCachedData();

        this.setState({
            redirect: true,
        });
    }

    deleteAllCachedData() {
        app.data.user = null;
        document.cookie = "";
    }

    getNavProps() {
        return getLoggedOutNav();
    }
}