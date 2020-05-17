import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import Login from "./routes/Login";
import Logout from "./routes/Logout";
import Home from "./routes/Home";
import Gif from "./routes/Gif";
import SignUp from "./routes/SignUp";
import EditAccount from "./routes/EditAccount";
import EditCategory from "./routes/EditCategory";
import {getCookieValue} from "./helper/cookies";
import swal from 'sweetalert';

export default class App extends Component {
    displayName = App.name

    constructor(props) {
        super(props);

        this.lastUrl = null;

        this.state = {
            authToken: getCookieValue('auth'),
            user: {
                username: null,
            },
            categoryData: {},
            categories: {},
            gifs: {}
        }
    }

    render() {
        const authToken = getCookieValue('auth');
        if (authToken !== this.state.authToken) this.setState({authToken});
        console.log('app state:', this.state);


        return (
            <Switch>
                <Route path='/login' render={(props) => <Login {...props} data={this.state}/>}/>
                <Route path='/logout' render={(props) => <Logout {...props} data={this.state}/>}/>
                <Route path='/signup' render={(props) => <SignUp {...props} data={this.state}/>}/>
                <Route path='/account/edit' render={(props) => <EditAccount {...props} data={this.state}/>}/>
                <Route path='/edit/:categoryId' render={(props) => <EditCategory {...props} data={this.state}/>}/>
                <Route path='/gif/:gifId' render={(props) => <Gif {...props} data={this.state}/>}/>
                <Route path='/:categoryId' render={(props) => <Home {...props} data={this.state}/>}/>
                <Route path='/' render={(props) => <Home {...props} data={this.state}/>}/>
            </Switch>
        );
    }

    async componentDidMount() {
        if (!this.state.user.username && this.state.authToken) {
            try {
                const response = await fetch('/api/user');
                if (response.status === 200) {
                    const user = await response.json();
                    this.setState({user,});
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
}
