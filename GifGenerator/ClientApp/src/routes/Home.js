import React from 'react';
import {Redirect} from "react-router-dom";
import "./Home.css"
import Navbar from "../components/Navbar";
import GifsList from "../components/GifsList";
import ChildrenList from "../components/ChildrenList";
import CategoryBase from "./CategoryBase";
import swal from 'sweetalert';

export default class Home extends CategoryBase {
    constructor(props) {
        super(props);

        this.addCategory = this.addCategory.bind(this);
    }

    async addCategory() {
        const name = await swal({
            title: 'Enter name of new category',
            content: "input",
            buttons: true,
        });
        if (!name) return;

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
                console.log('new', newCategoryId);

                this.props.data.categories[newCategoryId] = {
                    id: newCategoryId,
                    name,
                    parentId: categoryId
                };

                const category = this.props.data.categoryData[categoryId];
                if (category) {
                    category.children.push({
                        id: newCategoryId,
                        name,
                    });
                }

                this.setState({
                    categoryId,
                })

                await swal({
                    title: "Category added",
                    icon: "success",
                });
            } else {
                console.log(await response.json());
                await swal({
                    title: "Error",
                    text: `Status code: ${response.status}`,
                    icon: "error",
                });

            }
        } catch (e) {
            console.log(e);
            await swal({
                title: "Exception",
                text: `Status code: ${e.message}`,
                icon: "error",
            });
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
        }, {
            title: 'Edit category',
            href: `/edit/${categoryId}`,
            icon: 'fa-edit',
        }];
        const category = this.props.data.categoryData[categoryId];
        const path = this.getPathFromCache(categoryId, false);
        const isEmpty = category && category.children.length === 0 && category.gifs.length === 0;

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

    componentDidMount() {
        this.checkUpdateCategory();
        this.checkUpdatePath();
    }

    componentDidUpdate() {
        this.checkUpdateCategory();
        this.checkUpdatePath();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (swal.getState().isOpen) swal.close();
    }
}