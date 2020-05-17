import React from 'react';
import {Link} from "react-router-dom";
import "./Navbar.css"
import PathBar from "./PathBar";

function renderCustomIcon(custom) {
    if (custom.href) {
        return (
            <div key={custom.title} className="nav-icon" title={custom.title}>
                <Link to={custom.href}>
                    <i className={`fa ${custom.icon} fa-2x pr-3`}/>
                </Link>
            </div>
        )
    }
    return (
        <div key={custom.title} className="nav-click" title={custom.title}>
            <i className={`fa ${custom.icon} fa-2x pr-3`} onClick={custom.onClick}/>
        </div>
    )
}

export default function (props) {
    const customIcons = props.customIcons && props.customIcons.map(renderCustomIcon);
    return (
        <div className="nav-bar-container">
            <div className="container">
                <div className="nav-path">
                    <PathBar links={props.path && props.path.links} current={props.path && props.path.current}/>
                </div>
                <div className="nav-actions">
                    {customIcons}
                    <div className="nav-icon" title="Edit account">
                        <Link to="/account/edit">
                            <i className="fa fa-user fa-2x pr-3"/>
                        </Link>
                    </div>
                    <div className="nav-icon" title="Logout">
                        <Link to="/logout">
                            <i className="fa fa-sign-in fa-2x"/>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}