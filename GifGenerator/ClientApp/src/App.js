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
            authToken: getCookieValue('auth'),
            user: null,
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
                <Route path='/login' render={(props) => <Login {...props} data={this.state}/>}/>
                <Route path='/signup' render={(props) => <SignUp {...props} data={this.state}/>}/>
                <Route path='/' render={() => <Redirect to="/login"/>}/>
            </Switch>
        )
    }

    renderLoggedInRouting() {
        return (
            <Switch>
                <Route path='/logout' render={(props) => <Logout {...props}/>}/>
                <Route path='/account/edit'
                       render={(props) => <EditAccount {...props} />}/>
                <Route path='/edit/:categoryId'
                       render={(props) => <EditCategory {...props} data={this.state} cache={this.cache}/>}/>
                <Route path='/gif/create/:categoryId'
                       render={(props) => <CreateGif {...props} data={this.state} cache={this.cache}/>}/>
                <Route path='/gif/:gifId'
                       render={(props) => <Gif {...props} data={this.state} cache={this.cache}/>}/>
                <Route path='/:categoryId'
                       render={(props) => <Home {...props} />}/>
                <Route exact path='/' render={(props) => <Home {...props} data={this.state} cache={this.cache}/>}/>
                <Route path='/' render={() => <Redirect to="/"/>}/>
            </Switch>
        )
    }

    render() {
        const authToken = getCookieValue('auth');
        if (authToken !== this.state.authToken) this.state.authToken = authToken;

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
        if (!this.state.user && this.state.authToken) {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const user = await response.json();
                    this.setState({user,});
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
}
