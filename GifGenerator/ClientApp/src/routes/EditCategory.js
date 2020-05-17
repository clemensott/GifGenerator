import React from 'react';
import Navbar from "../components/Navbar";
import {Redirect} from "react-router-dom";
import CategoryBase from "./CategoryBase";
import swal from 'sweetalert';

export default class EditCategory extends CategoryBase {
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
                this.props.data.categoryData[categoryId] = category;
                this.props.data.categories[category.id].name = newName;
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
        const category = this.props.data.categoryData[categoryId];
        if (category) {
            const parentCategory = this.props.data.categoryData[category.parentId];
            if (parentCategory) {
                for (let i = parentCategory.children.length - 1; i >= 0; i--) {
                    if (parentCategory.children[i].id === categoryId) parentCategory.children.splice(i, 1);
                }
            }
        }

        const categoryIds = [categoryId];
        while (categoryIds.length > 0) {
            const deleteCategoryId = categoryIds.shift();
            const deleteCategory = this.props.data.categoryData[deleteCategoryId];

            if (!deleteCategory) continue;

            deleteCategory.children.forEach(child => categoryIds.push(child.id));
            deleteCategory.gifs.forEach(gif => delete this.props.data.gifs[gif.id]);

            delete this.props.data.categoryData[deleteCategoryId];
            delete this.props.data.categories[deleteCategoryId];
        }
    }

    async deleteCategory() {
        const willDelete = await swal({
            title: "Are you sure you?",
            text: "You are deleting all gifs and sub categories. Once deleted, you will not be able to recover all of this!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        });
        if (!willDelete) return;

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
        const path = this.getPathFromCache(categoryId, true);

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

                    <button className="btn bg-danger text-light float-right"
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

    componentDidMount() {
        this.checkUpdatePath();
    }

    componentDidUpdate() {
        this.checkUpdatePath();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (swal.getState().isOpen) swal.close();
    }
}