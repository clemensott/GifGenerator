import React, {Component} from 'react';
import {Redirect} from "react-router-dom";

export default class Logout extends Component {
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
        this.props.data.user = {
            username: null,
        };
        document.cookie = "";
    }
}