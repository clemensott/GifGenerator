import React from 'react';
import "./Home.css"
import GifsList from "../components/GifsList";
import ChildrenList from "../components/ChildrenList";
import DataCacheBase from "./DataCacheBase";
import getPathFromCache from "../helper/getPathFromCache";
import {app} from "../App";
import addCategory from "../helper/addCategory";
import {getLoggedInNav} from "../helper/defaultNav";
import uploadGif from "../helper/uploadGif";

export default class Home extends DataCacheBase {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            isLoading: false,
            loadingText: null,
        };
    }

    render() {
        const categoryId = this.getCurrentCategoryId();
        const category = app.cache.categoryData[categoryId];
        const isEmpty = category && category.children.length === 0 && category.gifs.length === 0;

        const currentCategoryName = app.cache.categories[categoryId] && app.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `GIFs - ${currentCategoryName}`;

        return (
            <div className="pt-1 pb-2">
                <div className={category && !this.state.isLoading ? '' : 'd-none'}>
                    <ChildrenList children={category ? category.children : []}/>
                    <GifsList gifs={category ? category.gifs : []}/>
                    <h3 className={`p-2 ${isEmpty ? '' : 'd-none'}`}>
                        This category is empty.
                    </h3>
                </div>

                <div className={`center ${category && !this.state.isLoading ? 'd-none' : ''}`}>
                    <div>
                        <div className="spinner-border text-primary"/>
                    </div>
                    <label>
                        {this.state.isLoading ? this.state.loadingText : 'Loading category'}
                    </label>
                </div>
            </div>
        );
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.checkData();
    }

    async componentDidUpdate() {
        super.componentDidMount();
        await this.checkData();
    }

    getNavProps() {
        const categoryId = this.getCurrentCategoryId();
        return getLoggedInNav(
            getPathFromCache(app.cache.categories, categoryId, false),
            [{
                title: 'Create GIF',
                href: `/gif/create/${categoryId}`,
                icon: 'fa-plus',
            }, {
                title: 'Upload GIF',
                onClick: () => uploadGif(categoryId, this),
                icon: 'fa-upload',
            }, {
                title: 'Add category',
                onClick: () => addCategory(categoryId, this),
                icon: 'fa-folder-plus',
            }, {
                title: 'Edit category',
                href: `/edit/${categoryId}`,
                icon: 'fa-edit',
            }],
        );
    }

    async checkData() {
        const categoryId = this.getCurrentCategoryId();
        await Promise.all([this.checkUpdateCategory(categoryId), this.checkUpdatePath(categoryId)]);
    }

    getCurrentCategoryId() {
        return this.props.match.params.categoryId || (app.data.user && app.data.user.rootCategoryId);
    }
}