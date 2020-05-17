import React from 'react';
import {Link} from "react-router-dom";
import "./PathBar.css"

function renderText(name, className = '') {
    return (
        <h2 className={`path-bar-text ${className}`}>
            {name}
        </h2>
    );
}

function renderCategory(link, withSplit) {
    return (
        <div key={link.href} className="path-bar-category">
            <Link to={link.href}>
                {renderText(link.text, 'path-bar-category-text')}
            </Link>
            {withSplit ? renderText(' / ', 'path-bar-split') : ''}
        </div>
    )
}

export default function (props) {
    const linkWithoutSpit = props.current || !props.links ? undefined : props.links[props.links.length - 1];
    const parents = props.links && props.links.map(link => renderCategory(link, link !== linkWithoutSpit));
    const current = props.current && renderText(props.current, 'path-bar-current');

    return (
        <div>
            {parents}
            {current}
        </div>
    );
}