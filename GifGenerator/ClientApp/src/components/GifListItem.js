import React from 'react';
import {Link} from "react-router-dom";
import './GifListItem.css'
import getRandomColor from "../helper/getRandomColor";

export default function (props) {
    const pt = 100 / props.gif.ratio;
    const background = getRandomColor();
    return (
        <Link to={`/gif/${props.gif.id}`}>
            <div className="gif-list-item-container rounded" style={{paddingTop: `${pt}%`, background,}}>
                <div className="gif-list-item-content">
                    <img src={`/api/gif/${props.gif.id}`} alt={props.gif.id} className="gif-list-item-image rounded"/>
                </div>
            </div>
        </Link>
    );
}