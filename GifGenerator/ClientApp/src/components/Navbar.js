import React, {Component} from 'react';
import {Link} from "react-router-dom";
import "./Navbar.css"
import PathBar from "./PathBar";

export const nav = {
    set: nav => null,
};

export class Navbar extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        nav.set = nav => this.setState({nav});
    }

    renderCustomIcon(icon) {
        if (icon.href) {
            return (
                <div key={icon.title} className="nav-icon-element" title={icon.title}>
                    <Link to={icon.href}>
                        <i className={`fas ${icon.icon} fa-2x pl-3 nav-icon`}/>
                    </Link>
                </div>
            )
        }
        return (
            <div key={icon.title} className="nav-icon-element" title={icon.title}>
                <i className={`fas ${icon.icon} fa-2x pl-3 nav-icon`} onClick={icon.onClick}/>
            </div>
        );
    }

    renderButtons(btn) {
        if (btn.href) {
            return (
                <div key={btn.text} className="pl-2 nav-icon-element nav-btn">
                    <Link to={btn.href}>
                        <button className={`${btn.classes}`}>{btn.text}</button>
                    </Link>
                </div>
            );
        }
        return (
            <div key={btn.text} className="pl-2 nav-btn">
                <button className={`${btn.classes}`} onClick={btn.onClick}>{btn.text}</button>
            </div>
        );
    }

    render() {
        const nav = this.state.nav;
        if (!nav) return null;

        const customIcons = (nav.customIcons && nav.customIcons.map(this.renderCustomIcon)) || [];
        const customButtons = (nav.buttons && nav.buttons.map(this.renderButtons)) || [];

        return (
            <div className="nav-bar-container">
                <div className="container">
                    <div className="nav-path">
                        <PathBar links={(nav.path && nav.path.links) || []}
                                 current={(nav.path && nav.path.current) || null}/>
                    </div>
                    <div className="nav-actions">
                        {customIcons}
                        {customButtons}
                    </div>
                </div>
            </div>
        );
    }
}