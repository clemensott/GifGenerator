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
import Swal from "./components/Swal";
import {addOnShowSwalListener, removeOnShowSwalListener} from "./helper/swal";

export default class App extends Component {
    displayName = App.name

    constructor(props) {
        super(props);

        this.cache = {
            categoryData: {},
            categories: {},
            gifs: {},
        }

        this.state = {
            set: (update) => this.setState(update),
            authToken: getCookieValue('auth'),
            user: {
                username: null,
            },
            swal: null,
        }

        this.onShowSwalListener = this.onShowSwalListener.bind(this);
        this.onSwalResolveListener = this.onSwalResolveListener.bind(this);
    }

    render() {
        const authToken = getCookieValue('auth');
        if (authToken !== this.state.authToken) this.setState({authToken});


        return (
            <div>
                <Switch>
                    <Route path='/login' render={(props) => <Login {...props} data={this.state}/>}/>
                    <Route path='/logout' render={(props) => <Logout {...props} data={this.state}/>}/>
                    <Route path='/signup' render={(props) => <SignUp {...props} data={this.state}/>}/>
                    <Route path='/account/edit'
                           render={(props) => <EditAccount {...props} data={this.state} cache={this.cache}/>}/>
                    <Route path='/edit/:categoryId'
                           render={(props) => <EditCategory {...props} data={this.state} cache={this.cache}/>}/>
                    <Route path='/gif/:gifId'
                           render={(props) => <Gif {...props} data={this.state} cache={this.cache}/>}/>
                    <Route path='/:categoryId'
                           render={(props) => <Home {...props} data={this.state} cache={this.cache}/>}/>
                    <Route path='/' render={(props) => <Home {...props} data={this.state} cache={this.cache}/>}/>
                </Switch>
                <Swal {...this.state.swal}/>
            </div>
        );
    }

    async componentDidMount() {
        addOnShowSwalListener(this.onShowSwalListener);
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

    componentWillUnmount() {
        removeOnShowSwalListener(this.onShowSwalListener);
    }

    onShowSwalListener(swal) {
        if (this.state.swal) {
            this.state.swal.removeOnResolveListener(this.onSwalResolveListener);
            this.state.swal.resolve('cancel');
        }

        swal.addOnResolveListener(this.onSwalResolveListener);
        this.setState({swal});
    }

    onSwalResolveListener() {
        this.state.swal.removeOnResolveListener(this.onSwalResolveListener);
        this.setState({swal: null});
    }
}
