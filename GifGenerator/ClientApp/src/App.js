import React, {Component} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import Login from "./routes/Login";
import Logout from "./routes/Logout";
import Home from "./routes/Home";
import Gif from "./routes/Gif";
import SignUp from "./routes/SignUp";
import EditAccount from "./routes/EditAccount";
import EditCategory from "./routes/EditCategory";
import {getCookieValue} from "./helper/cookies";
import {Swal} from "./components/Swal";
import CreateGif from "./routes/CreateGif";
import {Navbar} from "./components/Navbar";

export const app = {
    data: null,
    cache: null,
};

export default class App extends Component {
    displayName = App.name

    constructor(props) {
        super(props);

        this.state = {
            user: null,
            logout: false,
        }

        app.data = this.state;
        app.cache = {
            categoryData: {},
            categories: {},
            gifs: {},
        }
    }

    setState(state, callback) {
        app.data = state;
        super.setState(state, callback);
    }

    renderLoggedOutRouting() {
        return (
            <Switch>
                <Route path='/login' component={Login}/>
                <Route path='/signup' component={SignUp}/>
                <Route path='/' render={() => <Redirect to="/login"/>}/>
            </Switch>
        )
    }

    renderLoggedInRouting() {
        return (
            <Switch>
                <Route path='/logout' component={Logout}/>
                <Route path='/account/edit' component={EditAccount}/>
                <Route path='/edit/:categoryId' component={EditCategory}/>
                <Route path='/gif/create/:categoryId' component={CreateGif}/>
                <Route path='/gif/:gifId' component={Gif}/>
                <Route path='/:categoryId' component={Home}/>
                <Route exact path='/' component={Home}/>
                <Route path='/' render={() => <Redirect to="/"/>}/>
            </Switch>
        )
    }

    render() {
        if (this.state.logout) {
            this.state.logout = false;
            return <Logout/>;
        }

        const authToken = getCookieValue('auth');
        if (this.state.user && authToken) {
            return (
                <div className="center">
                    <div className="spinner-border text-primary"/>
                </div>
            );
        }

        return (
            <div className="flex-container">
                <Navbar/>

                <div className="container content-container">
                    {authToken ?
                        this.renderLoggedInRouting() :
                        this.renderLoggedOutRouting()}
                    <Swal/>
                </div>
            </div>
        );
    }

    async componentDidMount() {
        await this.checkUser();
    }

    async checkUser() {
        const authToken = getCookieValue('auth');
        if (!this.state.user && authToken) {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const user = await response.json();
                    this.setState({user,});
                } else {
                    this.setState({logout: true});
                }
            } catch (e) {
                console.log(e);
                this.setState({logout: true});
            }
        }
    }
}
