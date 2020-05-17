import React from 'react';
import {Link} from "react-router-dom";
import './CategoryListItem.css'

export default function (props) {
    document.cookie = "";

    return (
        <div className="category-list-item">
            <Link to={props.category.id}>
                <h1 className="category-list-item-name">{props.category.name}</h1>
            </Link>
        </div>
    );
}