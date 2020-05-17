import {Component} from "react";

export default class CategoryBase extends Component {
    constructor(props) {
        super(props);

        this.isUnmounted = false;
        this.fetchPathId = null;
        this.fetchCategoryId = null;

        this.state = {
            pathId: null,
            categoryId: null,
            logout: false,
        }
    }

    getPathFromCache(categoryId, withLinkToCurrent) {
        const categories = this.props.data.categories;
        let category = categories[categoryId];

        if (!category) return null;

        const path = withLinkToCurrent ? {
            links: [{
                href: `/${category.id}`,
                text: category.name,
            }],
            current: null,
        } : {
            links: [],
            current: category.name,
        }

        while (true) {
            if (!category.parentId && category.parentId !== '') break;

            category = categories[category.parentId];
            if (!category) return null;

            path.links.unshift({
                href: `/${category.id}`,
                text: category.name,
            });
        }

        return path;
    }

    checkUpdateCategory() {
        const categoryId = this.getCurrentCategoryId();
        if (categoryId !== this.state.categoryId && categoryId !== this.fetchCategoryId) this.updateCategory(categoryId);
    }

    async updateCategory(categoryId) {
        try {
            this.fetchCategoryId = categoryId;
            const response = await fetch(`/api/category/${categoryId}`);

            if (response.status === 200) {
                const category = await response.json();
                if (this.getCurrentCategoryId() === categoryId) {
                    this.props.data.categoryData[categoryId] = category;
                    this.props.data.categories[category.id] = {
                        id: category.id || '',
                        name: category.name,
                        parentId: category.parentId,
                    }
                    category.children.forEach(child =>
                        this.props.data.categories[child.id] = {
                            id: child.id || '',
                            name: child.name,
                            parentId: category.id || '',
                        });

                    if (!this.isUnmounted) {
                        this.setState({
                            categoryId,
                        });
                    }
                }
            } else if (response.status === 401 && !this.isUnmounted) {
                this.setState({logout: true});
            }
        } catch (err) {
            console.log(err);
        } finally {
            if (this.getCurrentCategoryId() === this.fetchCategoryId) this.fetchCategoryId = null;
        }
    }

    checkUpdatePath() {
        const categoryId = this.getCurrentCategoryId();
        if (categoryId && categoryId !== this.state.pathId) this.updatePath(categoryId)
        else if (this.props.data.user.username && this.state.pathId !== categoryId) {
            this.setPathWithRaw(categoryId, [{id: '', name: this.props.data.user.username}]);
        }
    }

    async updatePath(categoryId) {
        try {
            this.fetchPathId = categoryId;
            const response = await fetch(`/api/category/${categoryId}/path`);

            if (response.status === 200) {
                const path = await response.json();
                if (this.getCurrentCategoryId() === categoryId) {
                    this.setPathWithRaw(categoryId, path);
                }
            } else if (response.status === 401 && !this.isUnmounted) {
                this.setState({logout: true});
            }
        } catch (err) {
            console.log(err);
        } finally {
            if (this.getCurrentCategoryId() === this.fetchPathId) this.fetchPathId = null;
        }
    }

    setPathWithRaw(categoryId, rawPath) {
        rawPath.reduce((last, current) => {
            this.props.data.categories[current.id || ''] = {
                id: current.id || '',
                name: current.name,
                parentId: last ? last.id || '' : null,
            }
            return current;
        }, null);

        if (!this.isUnmounted) {
            this.setState({
                pathId: categoryId
            });
        }
    }

    getCurrentCategoryId() {
        return this.props.match.params.categoryId || '';
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }
}