import React from "react";
import {app} from "../App";
import RouteBase from "./RouteBase";

export default class DataCacheBase extends RouteBase {
    constructor(props) {
        super(props);

        this.fetchPathId = null;
        this.fetchCategoryId = null;
        this.fetchGifId = null;

        this.state = {
            lastFetchPathId: null,
            lastFetchCategoryId: null,
            lastFetchGifId: null,
        }
    }

    componentDidMount() {
        super.componentDidMount();
    }

    setState(state, callback) {
        if (this.isComponentMounted) super.setState(state, callback);
        else console.log('tried to set state in unmounted component:', state);
    }

    async checkUpdatePath(categoryId) {
        if (categoryId && categoryId !== this.state.fetchPathId && categoryId !== this.state.lastFetchPathId) {
            await this.updatePath(categoryId);
        }
    }

    async updatePath(categoryId) {
        try {
            this.fetchPathId = categoryId;
            const response = await fetch(`/api/category/${categoryId}/path`);

            if (response.ok) {
                const path = await response.json();
                path.reduce((last, current) => {
                    app.cache.categories[current.id] = {
                        id: current.id,
                        name: current.name,
                        parentId: last ? last.id : null,
                    }
                    return current;
                }, null);

                this.setState({
                    lastFetchPathId: categoryId
                });
            } else if (response.status === 401) {
                this.props.history.push('/logout');
            } else if (this.props.history.location.pathname !== '/') {
                this.props.history.push('/');
            }
        } catch (err) {
            console.log(err);
        }
    }

    async checkUpdateCategory(categoryId) {
        if (categoryId && categoryId !== this.state.lastFetchCategoryId && categoryId !== this.fetchCategoryId) {
            await this.updateCategory(categoryId);
        }
    }

    async updateCategory(categoryId) {
        try {
            this.fetchCategoryId = categoryId;
            const response = await fetch(`/api/category/${categoryId}`);

            if (response.ok) {
                const category = await response.json();

                app.cache.categoryData[categoryId] = category;
                app.cache.categories[category.id] = {
                    id: category.id || '',
                    name: category.name,
                    parentId: category.parentId,
                }
                category.children.forEach(child => {
                    app.cache.categories[child.id] = {
                        id: child.id || '',
                        name: child.name,
                        parentId: category.id || '',
                    }
                });
                category.gifs.forEach(child => {
                    app.cache.gifs[child.id] = {...child};
                });

                if (categoryId === this.fetchCategoryId) {
                    this.setState({
                        lastFetchCategoryId: categoryId,
                    });
                }
            } else if (response.status === 401) {
                this.props.history.push('/logout');
            } else if (this.props.history.location.pathname !== '/') {
                this.props.history.push('/');
            }
        } catch (err) {
            console.log(err);
        }
    }

    async checkGif(gifId) {
        if (gifId && gifId !== this.state.lastFetchGifId && gifId !== this.fetchGifId) {
            await this.updateGif(gifId);
        }
    }

    async updateGif(gifId) {
        try {
            this.fetchGifId = gifId;
            const response = await fetch(`/api/gif/${gifId}/meta`);

            if (response.ok) {
                app.cache.gifs[gifId] = await response.json();
                this.setState({
                    lastFetchGifId: gifId,
                });
            } else if (response.status === 401) {
                this.props.history.push('/logout');
            } else if (this.props.history.location.pathname !== '/') {
                this.props.history.push('/');
            }
        } catch (err) {
            console.log(err);
        }
    }
}