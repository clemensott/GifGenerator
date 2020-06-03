import React from 'react';
import DataCacheBase from "./DataCacheBase";
import getPathFromCache from "../helper/getPathFromCache";
import GifsList from "../components/GifsList";
import {app} from "../App";
import './Gif.css'
import {getLoggedInNav} from "../helper/defaultNav";

export default class Gif extends DataCacheBase {
    constructor(props) {
        super(props);

        this.state = {}
    }

    render() {
        const {gifId, categoryId} = this.getCurrentData();
        let siblings = null;
        if (categoryId) {
            siblings = app.cache.categoryData[categoryId] &&
                app.cache.categoryData[categoryId].gifs.filter(gif => gif.id !== gifId);
        }

        const currentCategoryName = app.cache.categories[categoryId] && app.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `GIF - ${currentCategoryName}`;

        return (
            <div className="pb-2">
                <div className="gif-item-container">
                    <a target="_blank" rel="noopener noreferrer" href={`/api/gif/${gifId}`}>
                        <img src={`/api/gif/${gifId}`} alt={gifId} className="gif-item p-2"/>
                    </a>
                </div>

                <GifsList gifs={siblings || []}/>
            </div>
        );
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.checkData();
    }

    async componentDidUpdate() {
        super.componentDidMount()
        await this.checkData();
    }

    async checkData() {
        const {gifId, categoryId} = this.getCurrentData();
        const promises = [this.checkGif(gifId)];
        if (categoryId) {
            promises.push(this.checkUpdateCategory(categoryId));
            promises.push(this.checkUpdatePath(categoryId));
        }
        await Promise.all(promises);
    }

    getNavProps() {
        const {categoryId} = this.getCurrentData();
        return getLoggedInNav(
            getPathFromCache(app.cache.categories, categoryId, true),
            [{
                title: 'Add GIF',
                href: `/gif/create/${categoryId}`,
                icon: 'fa-plus',
            }, {
                title: 'Edit category',
                href: `/edit/${categoryId}`,
                icon: 'fa-edit',
            }],
        );
    }

    getCurrentData() {
        const gifId = this.props.match.params.gifId;
        const meta = app.cache.gifs[gifId];
        const categoryId = meta && meta.categoryId;
        return {gifId, meta, categoryId};
    }
}