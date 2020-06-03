import React from 'react';
import Navbar from "../components/Navbar";
import DataCacheBase from "./DataCacheBase";
import getPathFromCache from "../helper/getPathFromCache";
import GifsList from "../components/GifsList";
import './Gif.css'

export default class Gif extends DataCacheBase {
    constructor(props) {
        super(props);

        this.state = {}
    }

    render() {
        const {gifId, categoryId} = this.getCurrentData();
        let path = null;
        let siblings = null;
        let customIcons = [];
        if (categoryId) {
            path = getPathFromCache(this.props.cache.categories, categoryId, true);
            siblings = this.props.cache.categoryData[categoryId] &&
                this.props.cache.categoryData[categoryId].gifs.filter(gif => gif.id !== gifId);

            customIcons = [{
                title: 'Add GIF',
                href: `/gif/create/${categoryId}`,
                icon: 'fa-plus',
            }, {
                title: 'Edit category',
                href: `/edit/${categoryId}`,
                icon: 'fa-edit',
            }];
        }

        const currentCategoryName = this.props.cache.categories[categoryId] && this.props.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `GIF - ${currentCategoryName}`;

        return (
            <div>
                <Navbar path={path} customIcons={customIcons}/>

                <div className="container">
                    <div className="gif-item-container">
                        <a target="_blank" rel="noopener noreferrer" href={`/api/gif/${gifId}`}>
                            <img src={`/api/gif/${gifId}`} alt={gifId} className="gif-item"/>
                        </a>
                    </div>

                    <GifsList gifs={siblings || []}/>
                </div>
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

    getCurrentData() {
        const gifId = this.props.match.params.gifId;
        const meta = this.props.cache.gifs[gifId];
        const categoryId = meta && meta.categoryId;
        return {gifId, meta, categoryId};
    }
}