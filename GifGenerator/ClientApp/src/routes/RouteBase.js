import React,{Component} from "react";
import {nav} from "../components/Navbar";

export default class RouteBase extends Component {
    constructor(props) {
        super(props);

        this.isComponentMounted = false;
    }

    componentDidMount() {
        this.updateNav();
        this.isComponentMounted = true;
    }

    componentDidUpdate() {
        this.updateNav();
    }

    updateNav() {
        nav.set(this.getNavProps())
    }

    getNavProps() {
        console.log('get no nav');
        return null;
    }
    
    componentWillUnmount() {
        this.isComponentMounted = false;
    }
}