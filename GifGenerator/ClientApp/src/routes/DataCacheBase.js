import {Component} from "react";
import {withRouter} from "react-router-dom";

export default class DataCacheBase extends Component {
    constructor(props) {
        super(props);

        this.isComponentMounted = false;
        this.fetchPathId = null;
        this.fetchCategoryId = null;
        this.fetchGifId = null;

        this.state = {
            lastFetchPathId: null,
            lastFetchCategoryId: null,
            lastFetchGifId: null,
            logout: false,
        }
    }

    componentDidMount() {
        this.isComponentMounted = true;
    }

    componentWillUnmount() {
        this.isComponentMounted = true;
    }

    setState(state, callback) {
        if (this.isComponentMounted) super.setState(state, callback);
        else console.log('tried to set state in unmounted component:', state);
    }

    async checkUpdatePath(categoryId) {
        console.log('checkPath:', this.props.data.user.username, this.state.lastFetchPathId, categoryId);
        if (categoryId && categoryId !== this.state.lastFetchPathId) await this.updatePath(categoryId)
        else if (this.props.data.user.username && this.state.lastFetchPathId !== categoryId) {
            console.log('setPathWithRaw name');
            this.fetchPathId = categoryId;
            this.setPathWithRaw(categoryId, [{id: '', name: this.props.data.user.username}]);
        }
    }

    async updatePath(categoryId) {
        try {
            this.fetchPathId = categoryId;
            const response = await fetch(`/api/category/${categoryId}/path`);

            if (response.status === 200) {
                const path = await response.json();
                this.setPathWithRaw(categoryId, path);
            } else if (response.status === 401) {
                this.setState({logout: true});
            } else if (this.props.history.location.pathname !== '/') {
                this.props.history.push('/');
            }
        } catch (err) {
            console.log(err);
        }
    }

    setPathWithRaw(categoryId, rawPath) {
        rawPath.reduce((last, current) => {
            this.props.cache.categories[current.id || ''] = {
                id: current.id || '',
                name: current.name,
                parentId: last ? last.id || '' : null,
            }
            return current;
        }, null);

        if (categoryId === this.fetchPathId && this.state.lastFetchPathId !== categoryId) {
            this.setState({
                lastFetchPathId: categoryId
            });
        }
    }

    async checkUpdateCategory(categoryId) {
        if (categoryId !== this.state.lastFetchCategoryId && categoryId !== this.fetchCategoryId) {
            await this.updateCategory(categoryId);
        }
    }

    async updateCategory(categoryId) {
        try {
            this.fetchCategoryId = categoryId;
            const response = await fetch(`/api/category/${categoryId}`);

            if (response.status === 200) {
                const category = await response.json();
                console.log('update cat:', category);
                this.props.cache.categoryData[categoryId] = category;
                this.props.cache.categories[category.id] = {
                    id: category.id || '',
                    name: category.name,
                    parentId: category.parentId,
                }
                category.children.forEach(child => {
                    this.props.cache.categories[child.id] = {
                        id: child.id || '',
                        name: child.name,
                        parentId: category.id || '',
                    }
                });
                category.gifs.forEach(child => {
                    this.props.cache.gifs[child.id] = {...child};
                });

                if (categoryId === this.fetchCategoryId) {
                    this.setState({
                        lastFetchCategoryId: categoryId,
                    });
                }
            } else if (response.status === 401) {
                this.setState({logout: true});
            } else if (this.props.history.location.pathname !== '/') {
                this.props.history.push('/');
            }
        } catch (err) {
            console.log(err);
        }
    }

    async checkGif(gifId) {
        if (gifId !== this.state.lastFetchGifId && gifId !== this.fetchGifId) {
            await this.updateGif(gifId);
        }
    }

    async updateGif(gifId) {
        try {
            this.fetchGifId = gifId;
            const response = await fetch(`/api/gif/${gifId}/meta`);

            if (response.status === 200) {
                this.props.cache.gifs[gifId] = await response.json();
                this.setState({
                    lastFetchGifId: gifId,
                });
            } else if (response.status === 401) {
                this.setState({logout: true});
            } else if (this.props.history.location.pathname !== '/') {
                this.props.history.push('/');
            }
        } catch (err) {
            console.log(err);
        }
    }
}