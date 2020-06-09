import React from 'react';
import {Redirect} from "react-router-dom";
import DataCacheBase from "./DataCacheBase";
import getPathFromCache from "../helper/getPathFromCache";
import {app} from "../App";
import {swal} from "../components/Swal";
import addCategory from "../helper/addCategory";
import {getLoggedInNav} from "../helper/defaultNav";
import uploadGif from "../helper/uploadGif";

export default class EditCategory extends DataCacheBase {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            isLoading: false,
            loadingText: null,
            changeNameSuccessfully: false,
            changeNameError: null,
            redirectToHome: false,
        }

        this.newNameRef = React.createRef();
    }

    async changeName() {
        const newName = this.newNameRef.current.value;

        try {
            this.setState({
                isLoading: true,
                loadingText: 'Changing name',
                changeNameSuccessfully: false,
                changeNameError: null,
            });

            const categoryId = this.getCurrentCategoryId();
            const url = `/api/category/${categoryId}/rename`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(newName),
            });

            if (response.ok) {
                const category = await response.json();
                app.cache.categoryData[categoryId] = category;
                app.cache.categories[category.id].name = newName;
                this.setState({
                    isLoading: false,
                    loadingText: null,
                    changeNameSuccessfully: true,
                    changeNameError: null,
                });
            } else {
                const changeNameError = await response.text();
                this.setState({
                    isLoading: false,
                    loadingText: null,
                    changeNameSuccessfully: false,
                    changeNameError,
                });
            }
        } catch (e) {
            this.setState({
                isLoading: false,
                loadingText: null,
                changeNameSuccessfully: false,
                changeNameError: e.message,
            });
        }
    }

    deleteCategoryFromCache(categoryId) {
        const category = app.cache.categoryData[categoryId];
        if (category) {
            const parentCategory = app.cache.categoryData[category.parentId];
            if (parentCategory) {
                for (let i = parentCategory.children.length - 1; i >= 0; i--) {
                    if (parentCategory.children[i].id === categoryId) parentCategory.children.splice(i, 1);
                }
            }
        }

        const categoryIds = [categoryId];
        while (categoryIds.length > 0) {
            const deleteCategoryId = categoryIds.shift();
            const deleteCategory = app.cache.categoryData[deleteCategoryId];

            if (!deleteCategory) continue;

            deleteCategory.children.forEach(child => categoryIds.push(child.id));
            deleteCategory.gifs.forEach(gif => delete this.props.data.gifs[gif.id]);

            delete app.cache.categoryData[deleteCategoryId];
            delete app.cache.categories[deleteCategoryId];
        }
    }

    async deleteCategory() {
        const result = await swal.show({
            title: 'Are you sure?',
            text: 'You are deleting all gifs and sub categories. Once deleted, you will not be able to recover all of this!',
            icon: 'fa-exclamation-triangle',
            color: 'danger',
            buttons: [{
                type: 'danger',
                text: 'Delete',
            }, {
                type: 'primary',
                text: 'Cancel',
            }],
        });
        if (result.type !== 'danger') return;

        const categoryId = this.getCurrentCategoryId();
        this.setState({
            isLoading: true,
            loadingText: 'Deleting',
        });
        try {
            await fetch('/api/category/' + categoryId, {method: 'DELETE'});
        } catch (e) {
            console.log(e);
        }

        this.deleteCategoryFromCache(categoryId);
        this.setState({
            isLoading: false,
            loadingText: null,
            redirectToHome: true
        });
    }

    render() {
        if (this.state.logout) return <Redirect to="/logout"/>
        if (this.state.redirectToHome) return <Redirect to="/"/>

        const categoryId = this.getCurrentCategoryId();
        const currentCategoryName = app.cache.categories[categoryId] && app.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `GIFs - Edit - ${currentCategoryName}`;

        const hideDeleteButton = !app.data.user || app.data.user.rootCategoryId === categoryId;

        return (
            <div className="pt-2">
                <div className={this.state.isLoading ? 'd-none' : ''}>
                    <div className="form-group">
                        <label>New name:</label>
                        <input ref={this.newNameRef} type="text"
                               className="form-control" placeholder="Enter new name"/>
                    </div>

                    <div className={`alert alert-danger  ${this.state.changeNameError ? '' : 'd-none'}`}
                         role="alert">
                        {this.state.changeNameError}
                    </div>

                    <div className={`alert alert-success  ${this.state.changeNameSuccessfully ? '' : 'd-none'}`}
                         role="alert">
                        Name changed successfully.
                    </div>

                    <button className="btn bg-primary text-light float-left"
                            onClick={async () => await this.changeName()}>
                        Change name
                    </button>

                    <button className={`btn bg-danger text-light float-right ${hideDeleteButton ? 'd-none' : ''}`}
                            onClick={async () => await this.deleteCategory()}>
                        Delete Category
                    </button>

                </div>
                <div className={`center ${this.state.isLoading ? '' : 'd-none'}`}>
                    <div>
                        <div className="spinner-border text-primary"/>
                    </div>
                    <label>{this.state.loadingText}</label>
                </div>
            </div>
        );
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.checkUpdatePath(this.getCurrentCategoryId())
    }

    async componentDidUpdate() {
        super.componentDidMount()
        await this.checkUpdatePath(this.getCurrentCategoryId())
    }

    getNavProps() {
        const categoryId = this.getCurrentCategoryId();
        return getLoggedInNav(
            getPathFromCache(app.cache.categories, categoryId, true),
            [{
                title: 'Create GIF',
                href: `/gif/create/${categoryId}`,
                icon: 'fa-plus',
            }, {
                title: 'Upload GIF',
                onClick: async () => {
                    const gif = await uploadGif(categoryId, this);
                    if (gif) this.props.history.push(`/gif/${gif.id}`);
                },
                icon: 'fa-upload',
            }, {
                title: 'Add category',
                onClick: () => addCategory(categoryId, this),
                icon: 'fa-folder-plus',
            }, {
                title: 'Edit category',
                href: `/edit/${categoryId}`,
                icon: 'fa-edit',
            }]
        );
    }

    getCurrentCategoryId() {
        return this.props.match.params.categoryId || (app.data.user && app.data.user.rootCategoryId);
    }
}