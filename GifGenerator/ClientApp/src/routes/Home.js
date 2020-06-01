import React from 'react';
import {Redirect} from "react-router-dom";
import "./Home.css"
import Navbar from "../components/Navbar";
import GifsList from "../components/GifsList";
import ChildrenList from "../components/ChildrenList";
import DataCacheBase from "./DataCacheBase";
import {Swal} from "../helper/swal";
import getPathFromCache from "../helper/getPathFromCache";

export default class Home extends DataCacheBase {
    constructor(props) {
        super(props);

        this.addCategory = this.addCategory.bind(this);
    }

    async addCategory() {
        const result = await new new Swal({
            title: 'Add category',
            icon: 'fa-plus-square',
            text: 'Name:',
            input: {placeholder: 'Enter name'},
            buttons: [{
                type: 'success',
                text: 'Create',
            }, {
                type: 'primary',
                text: 'Cancel',
            }],
        }).show();
        if (result.type !== 'success') return;
        const name = result.value;

        try {
            const categoryId = this.getCurrentCategoryId();
            const url = categoryId ? `/api/category/${categoryId}/create` : '/api/category/create';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(name),
            });

            if (response.status === 200) {
                const newCategoryId = await response.text();

                this.props.cache.categories[newCategoryId] = {
                    id: newCategoryId,
                    name,
                    parentId: categoryId
                };

                const category = this.props.cache.categoryData[categoryId];
                if (category) {
                    category.children.push({
                        id: newCategoryId,
                        name,
                    });
                }

                this.setState({
                    categoryId,
                })

                await new new Swal({
                    title: 'Category added',
                    icon: 'fa-check-circle',
                    color: 'green',
                    buttons: 'Ok',
                }).show();
            } else {
                console.log(await response.json());
                await new new Swal({
                    title: 'Error',
                    icon: 'fa-times',
                    color: 'red',
                    text: `Status code: ${response.status}`,
                    buttons: 'Ok',
                }).show();
            }
        } catch (e) {
            console.log(e);
            await new new Swal({
                title: 'Exception',
                icon: 'fa-times',
                color: 'red',
                text: `Status code: ${e.message}`,
                buttons: 'Ok',
            }).show();
        }
    }

    render() {
        if (!this.props.data.authToken) {
            console.log('home login');
            return <Redirect to="/login"/>
        }
        if (this.state.logout) {
            console.log('home logout');
            return <Redirect to="/logout"/>
        }

        const categoryId = this.getCurrentCategoryId();
        const customIcons = [{
            title: 'Add category',
            onClick: this.addCategory,
            icon: 'fa-plus',
        }];
        if (categoryId) {
            customIcons.push({
                title: 'Edit category',
                href: `/edit/${categoryId}`,
                icon: 'fa-edit',
            });
        }
        const category = this.props.cache.categoryData[categoryId];
        const path = getPathFromCache(this.props.cache.categories, categoryId, false);
        const isEmpty = category && category.children.length === 0 && category.gifs.length === 0;

        const currentCategoryName = this.props.cache.categories[categoryId] && this.props.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `GIFs - ${currentCategoryName}`;

        return (
            <div>
                <Navbar path={path} customIcons={customIcons}/>

                <div className={`container ${category ? '' : 'd-none'}`}>
                    <ChildrenList children={category ? category.children : []}/>
                    <GifsList gifs={category ? category.gifs : []}/>
                    <h3 className={`p-2 ${isEmpty ? '' : 'd-none'}`}>
                        This category is empty.
                    </h3>
                </div>

                <div className={`center ${category ? 'd-none' : ''}`}>
                    <div className="spinner-border text-primary"/>
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
        const categoryId = this.getCurrentCategoryId();
        await Promise.all([this.checkUpdateCategory(categoryId), this.checkUpdatePath(categoryId)]);
    }

    getCurrentCategoryId() {
        return this.props.match.params.categoryId || (this.props.data.user && this.props.data.user.rootCategoryId);
    }
}