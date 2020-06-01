import React from 'react';
import Navbar from "../components/Navbar";
import {Redirect} from "react-router-dom";
import DataCacheBase from "./DataCacheBase";
import {Swal} from "../helper/swal";
import getPathFromCache from "../helper/getPathFromCache";

export default class EditCategory extends DataCacheBase {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            isLoading: false,
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

            if (response.status === 200) {
                const category = await response.json();
                this.props.cache.categoryData[categoryId] = category;
                this.props.cache.categories[category.id].name = newName;
                this.setState({
                    isLoading: false,
                    changeNameSuccessfully: true,
                    changeNameError: null,
                });
            } else {
                const changeNameError = await response.text();
                this.setState({
                    isLoading: false,
                    changeNameSuccessfully: false,
                    changeNameError,
                });
            }
        } catch (e) {
            this.setState({
                isLoading: false,
                changeNameSuccessfully: false,
                changeNameError: e.message,
            });
        }
    }

    deleteCategoryFromCache(categoryId) {
        const category = this.props.cache.categoryData[categoryId];
        if (category) {
            const parentCategory = this.props.cache.categoryData[category.parentId];
            if (parentCategory) {
                for (let i = parentCategory.children.length - 1; i >= 0; i--) {
                    if (parentCategory.children[i].id === categoryId) parentCategory.children.splice(i, 1);
                }
            }
        }

        const categoryIds = [categoryId];
        while (categoryIds.length > 0) {
            const deleteCategoryId = categoryIds.shift();
            const deleteCategory = this.props.cache.categoryData[deleteCategoryId];

            if (!deleteCategory) continue;

            deleteCategory.children.forEach(child => categoryIds.push(child.id));
            deleteCategory.gifs.forEach(gif => delete this.props.data.gifs[gif.id]);

            delete this.props.cache.categoryData[deleteCategoryId];
            delete this.props.cache.categories[deleteCategoryId];
        }
    }

    async deleteCategory() {
        const result = await new Swal({
            title: 'Are you sure you?',
            text: 'You are deleting all gifs and sub categories. Once deleted, you will not be able to recover all of this!',
            icon: 'fa-exclamation-triangle',
            color: 'red',
            buttons: [{
                type: 'danger',
                text: 'Delete',
            }, {
                type: 'primary',
                text: 'Cancel',
            }],
        }).show();
        if (result.type !== 'danger') return;

        const categoryId = this.getCurrentCategoryId();
        this.setState({
            isLoading: true,
        });
        try {
            await fetch('/api/category/' + categoryId, {method: 'DELETE'});
        } catch (e) {
            console.log(e);
        }

        this.deleteCategoryFromCache(categoryId);
        this.setState({
            isLoading: false,
            redirectToHome: true
        });
    }

    render() {
        if (this.state.logout) return <Redirect to="/logout"/>
        if (this.state.redirectToHome) return <Redirect to="/"/>

        const categoryId = this.getCurrentCategoryId();
        const customIcons = [{
            title: 'Edit category',
            href: `/edit/${categoryId}`,
            icon: 'fa-edit',
        }];
        const path = getPathFromCache(this.props.cache.categories, categoryId, true);

        const currentCategoryName = this.props.cache.categories[categoryId] && this.props.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `GIFs - Edit - ${currentCategoryName}`;

        const isRootCategory = categoryId === (this.props.data.user && this.props.data.user.rootCategoryId);

        return (
            <div>
                <Navbar path={path} customIcons={customIcons}/>

                <div className={`container pt-4 ${this.state.isLoading ? 'd-none' : ''}`}>
                    <div className="form-group">
                        <label>New name:</label>
                        <input ref={this.newNameRef} type="text"
                               className="form-control" placeholder="Enter new name"/>
                    </div>

                    <div className={`alert alert-danger  ${this.state.changeNameError ? '' : 'd-none'}`} role="alert">
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

                    <button className={`btn bg-danger text-light float-right ${isRootCategory ? 'd-none' : ''}`}
                            onClick={async () => await this.deleteCategory()}>
                        Delete Category
                    </button>
                </div>

                <div className={`center ${this.state.isLoading ? '' : 'd-none'}`}>
                    <div className="spinner-border text-primary"/>
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

    getCurrentCategoryId() {
        return this.props.match.params.categoryId || (this.props.data.user && this.props.data.user.rootCategoryId);
    }
}