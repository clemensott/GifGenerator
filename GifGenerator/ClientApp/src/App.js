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
import LoggedOutRoute from "./Routing/LoggedOutRoute";
import LoggedInRoute from "./Routing/LoggedInRoute";
import AuthStateRoute from "./Routing/AuthStateRoute";

export const app = {
    data: null,
    cache: null,
    rerender: () => null,
};

export default class App extends Component {
    displayName = App.name

    constructor(props) {
        super(props);

        this.state = {
            user: null,
            logout: false,
            rerender: false, // only used to rerender app
        }

        app.data = this.state;
        app.cache = {
            categoryData: {},
            categories: {},
            gifs: {},
        }
        app.rerender = () => this.setState({rerender: true});
    }

    setState(state, callback) {
        app.data = {...app.data, ...state};
        super.setState(state, callback);
    }

    render() {
        if (this.state.logout) {
            this.state.logout = false;
            return <Logout/>;
        }

        const authToken = getCookieValue('auth');
        if (!this.state.user && authToken) {
            return (
                <div className="center">
                    <div>
                        <div className="spinner-border text-primary"/>
                    </div>
                    <label>Loading</label>
                </div>
            );
        }

        return (
            <div className="flex-container">
                <Navbar/>

                <div className="container content-container">
                    <Switch>
                        <LoggedOutRoute path='/login' component={Login}/>
                        <LoggedOutRoute path='/signup' component={SignUp}/>
                        <LoggedInRoute path='/logout' component={Logout}/>
                        <LoggedInRoute path='/account/edit' component={EditAccount}/>
                        <LoggedInRoute path='/edit/:categoryId' component={EditCategory}/>
                        <LoggedInRoute path='/gif/create/:categoryId' component={CreateGif}/>
                        <Route path='/gif/create/' component={CreateGif}/>
                        <LoggedInRoute path='/gif/:gifId' component={Gif}/>
                        <LoggedInRoute path='/category/:categoryId' component={Home}/>
                        <AuthStateRoute exact path='/' component={Home} isPrivate={true} redirectTo="/gif/create"/>
                        <Route path='/' render={() => <Redirect to={getCookieValue('auth') ? '/' : 'gif/create'}/>}/>
                    </Switch>
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

    componentDidUpdate() {
        const authToken = getCookieValue('auth');
        if (this.state.user && !authToken) {
            // Happens after authToken has expired
            this.setState({logout: true});
        }
    }
}
