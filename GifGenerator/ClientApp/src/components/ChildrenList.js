import React from 'react';
import CategoryListItem from "./CategoryListItem";
import './ChildrenList.css'

function groupChildren(src, groupSize = 4) {
    const groups = [];
    src.forEach((item, i) => {
        if (i % groupSize === 0) groups.push([item]);
        else groups[groups.length - 1].push(item);
    });

    return groups;
}

function renderChildItem(child) {
    return (
        <div key={child.id} className="children-list-column children-list-item">
            <CategoryListItem category={child}/>
        </div>
    );
}

function renderChildrenRow(children) {
    return (
        <div key={children[0].id} className="children-list-row">
            {children.map(renderChildItem)}
        </div>
    )
}

export default function (props) {
    return groupChildren(props.children).map(child => renderChildrenRow(child));
}