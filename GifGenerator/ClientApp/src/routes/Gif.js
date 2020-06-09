import React from 'react';
import DataCacheBase from "./DataCacheBase";
import getPathFromCache from "../helper/getPathFromCache";
import GifsList from "../components/GifsList";
import {app} from "../App";
import './Gif.css'
import {getLoggedInNav} from "../helper/defaultNav";
import {swal} from "../components/Swal";
import uploadGif from "../helper/uploadGif";

export default class Gif extends DataCacheBase {
    constructor(props) {
        super(props);

        this.state = {
            isDeleting: false,
        };
    }

    async delete() {
        const result = await swal.show({
            title: 'Are you sure?',
            text: 'You are about to delete this GIF. Once deleted, you will not be able to recover it!',
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

        try {
            const {gifId, categoryId} = this.getCurrentData();
            this.setState({isDeleting: true});
            const response = await fetch(`/api/gif/${gifId}`, {method: 'DELETE'});

            if (response.ok) {
                const category = app.cache.categoryData[categoryId];
                let gifIndex = null;
                if (category) {
                    for (let i = 0; i < category.gifs.length; i++) {
                        if (category.gifs[i].id === gifId) {
                            gifIndex = i;
                            category.gifs.splice(gifIndex, 1);
                        }
                    }
                }

                delete app.cache.gifs[gifId];
                this.setState({isDeleting: false});

                if (category && category.gifs.length) {
                    let nextGifIndex;
                    if (gifIndex === null) nextGifIndex = 0;
                    else if (gifIndex >= category.gifs.length) nextGifIndex = category.gifs.length - 1;
                    else nextGifIndex = gifIndex;

                    const nextGifId = category.gifs[nextGifIndex].id;
                    this.props.history.push(`/gif/${nextGifId}`);
                } else {
                    this.props.history.push(`/category/${categoryId}`);
                }
            } else {
                console.log(await response.json());
                await swal.show({
                    title: 'Error',
                    icon: 'fa-times',
                    color: 'danger',
                    text: `Status code: ${response.status}`,
                    buttons: 'Ok',
                });
            }
        } catch (e) {
            this.setState({isDeleting: false});
            console.log(e);
            await swal.show({
                title: 'Exception',
                icon: 'fa-times',
                color: 'danger',
                text: `Status code: ${e.message}`,
                buttons: 'Ok',
            });
        }
    }

    render() {
        const {gifId, categoryId} = this.getCurrentData();
        let siblings = null;
        if (categoryId) {
            siblings = app.cache.categoryData[categoryId] &&
                app.cache.categoryData[categoryId].gifs.filter(gif => gif.id !== gifId);
        }

        const currentCategoryName = app.cache.categories[categoryId] && app.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `GIF - ${currentCategoryName}`;

        return (
            <div className="pb-2">
                <div className="gif-item-container m-2">
                    <a target="_blank" rel="noopener noreferrer" href={`/api/gif/${gifId}`}>
                        <img src={`/api/gif/${gifId}`} alt={gifId} className="gif-item"/>
                    </a>

                    <div className={`center ${this.state.isDeleting ? '' : 'd-none'}`}>
                        <div className="spinner-border text-primary"/>
                    </div>

                    <button className="btn btn-outline-danger gif-delete-button" disabled={this.state.isDeleting}
                            onClick={() => this.delete()}>
                        Delete
                    </button>
                </div>

                <GifsList gifs={siblings || []}/>
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

    getNavProps() {
        const {categoryId} = this.getCurrentData();
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
                title: 'Edit category',
                href: `/edit/${categoryId}`,
                icon: 'fa-edit',
            }],
        );
    }

    getCurrentData() {
        const gifId = this.props.match.params.gifId;
        const meta = app.cache.gifs[gifId];
        const categoryId = meta && meta.categoryId;
        return {gifId, meta, categoryId};
    }
}