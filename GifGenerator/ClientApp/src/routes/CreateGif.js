import React from 'react';
import {Redirect,} from "react-router-dom";
import DataCacheBase from "./DataCacheBase";
import getPathFromCache from "../helper/getPathFromCache";
import GifCreateSource from "../components/GifCreateSource";
import './CreateGif.css'
import {app} from "../App";
import {swal} from "../components/Swal";
import addCategory from "../helper/addCategory";
import {getLoggedInNav, getLoggedOutNav} from "../helper/defaultNav";

export default class CreateGif extends DataCacheBase {
    constructor(props) {
        super(props);

        this.nextSourceId = 0;

        this.state = {
            ...this.state,
            isLoading: false,
            loadingStatus: null,
            redirect: false,
            lastUpdated: null, // only set to rerender
            previewUrl: null,
        }

        this.create = {
            size: {
                width: 400,
                height: 400,
            },
            repeatCount: undefined,
            sources: [this.getSourceTemplate()],
        };
    }

    getSourceTemplate() {
        return {
            id: this.nextSourceId++,
            type: 0,
            url: null,
            data: null,
            begin: undefined,
            count: undefined,
            step: undefined,
            frameDelay: 5,
            cropRect: null,
            dataInvalid: false,
        };
    }

    validate() {
        if (this.create.sources.reduce((_, source) => source.dataInvalid = !source.data && !source.url, null)) {
            this.setState({lastUpdated: 'dataInvalid'});
            return false;
        }

        return true;
    }

    download() {
        window.location.assign(this.state.previewUrl);
        return;
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";

        const url = this.state.previewUrl;
        const id =  url.substr(url.lastIndexOf('/') + 1);
        a.href = this.state.previewUrl;
        a.download = `${id}.gif`;
        a.click();
    }

    async loadPreview() {
        if (!this.validate()) return;

        try {
            if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);

            this.setState({
                isLoading: true,
                loadingStatus: 'Processing',
                previewUrl: null,
            });
            const response = await fetch('/api/gif/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(this.create),
            });

            if (response.ok) {
                this.setState({isLoading: true, loadingStatus: 'Fetching'});

                const blob = await response.blob();
                const previewUrl = URL.createObjectURL(blob);

                this.setState({previewUrl, isLoading: false});
            } else {
                this.setState({isLoading: false});
                await swal.show({
                    title: 'Error',
                    icon: 'fa-times',
                    color: 'danger',
                    text: `Status code: ${response.status}`,
                    textSecondary: response.statusText,
                    buttons: 'Ok',
                });
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e);
            await swal.show({
                title: 'Exception',
                icon: 'fa-times',
                color: 'danger',
                text: e.message,
                buttons: 'Ok',
            });
        }
    }

    async addGif() {
        if (!this.validate()) return;

        try {
            this.setState({isLoading: true, loadingStatus: 'Processing'});
            const url = `/api/gif/create/add/${this.getCurrentCategoryId()}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(this.create),
            });

            if (response.ok) {
                const gifId = await response.text();
                this.setState({redirect: `/gif/${gifId}`});
            } else {
                this.setState({isLoading: false});
                await swal.show({
                    title: 'Error',
                    icon: 'fa-times',
                    color: 'danger',
                    text: `Status code: ${response.status}`,
                    textSecondary: response.statusText,
                    buttons: 'Ok',
                });
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e);
            await swal.show({
                title: 'Exception',
                icon: 'fa-times',
                color: 'danger',
                text: e.message,
                buttons: 'Ok',
            });
        }
    }

    renderSource(source, index) {
        const canRemove = this.create.sources.length > 1;
        const isFirst = index === 0;
        const isLast = index + 1 === this.create.sources.length;
        return (
            <div key={source.id} className="add-gif-source-item pl-3 pr-3 pt-2 rounded">
                <GifCreateSource source={source}
                                 targetWidth={this.create.size.width}
                                 targetHeight={this.create.size.height}/>
                <div className={`add-gif-source-item-controls ${canRemove ? '' : 'd-none'}`}>
                    <i className={`fas fa-arrow-down fa-2x pt-1 pr-2 add-gif-source-item-icon ${isLast ? 'd-none' : ''}`}
                       onClick={() => {
                           const tmp = this.create.sources[index];
                           this.create.sources[index] = this.create.sources[index + 1];
                           this.create.sources[index + 1] = tmp;

                           this.setState({lastUpdated: 'source'});
                       }}/>
                    <i className={`fas fa-arrow-up fa-2x pt-1 pr-2 add-gif-source-item-icon ${isFirst ? 'd-none' : ''}`}
                       onClick={() => {
                           const tmp = this.create.sources[index];
                           this.create.sources[index] = this.create.sources[index - 1];
                           this.create.sources[index - 1] = tmp;

                           this.setState({lastUpdated: 'source'});
                       }}/>
                    <i className="fas fa-times fa-2x pt-1 pr-2 add-gif-source-item-icon"
                       onClick={() => {
                           this.create.sources.splice(index, 1);
                           this.setState({lastUpdated: 'source'});
                       }}/>
                </div>
            </div>
        )
    }

    render() {
        if (this.state.logout) return <Redirect to="/logout"/>
        if (this.state.redirect) return <Redirect to={this.state.redirect}/>

        const categoryId = this.getCurrentCategoryId();
        const sources = this.create.sources.map((source, index) => this.renderSource(source, index));

        const currentCategoryName = app.cache.categories[categoryId] && app.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `Add GIF - ${currentCategoryName}`;

        return (
            <div className="pt-3 pb-3">
                <div className={this.state.isLoading ? 'd-none' : ''}>
                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label><strong>Width</strong> (*)</label>
                            <input type="number" className="form-control"
                                   defaultValue={this.create.size.width} min="1" max="3000"
                                   onBlur={e => {
                                       this.create.size.width = parseInt(e.target.value, 10);
                                       this.setState({lastUpdated: 'width'});
                                   }}/>
                        </div>
                        <div className="form-group col-md-4">
                            <label><strong>Height</strong> (*)</label>
                            <input type="number" className="form-control" defaultValue={this.create.size.height}
                                   min="1" max="3000" onBlur={e => {
                                this.create.size.height = parseInt(e.target.value, 10);
                                this.setState({lastUpdated: 'height'});
                            }}/>
                        </div>
                        <div className="form-group col-md-4">
                            <label>Repeat count</label>
                            <input type="text" className="form-control" min="1"
                                   defaultValue={this.create.repeatCount || ''}
                                   onBlur={e => this.create.repeatCount = parseInt(e.target.value, 10) || 65536}/>
                        </div>
                    </div>

                    {sources}

                    <div className="clearfix">
                        <button className="btn btn-outline-primary float-right ml-2"
                                onClick={async () => {
                                    this.create.sources.push(this.getSourceTemplate());
                                    this.setState({lastUpdated: 'source'});
                                }}>
                            Add source
                        </button>
                    </div>

                    <div className={`text-center p-2 ${this.state.previewUrl ? '' : 'd-none'}`}>
                        <img src={this.state.previewUrl} alt="None" className="add-gif-source-preview-img"/>
                    </div>

                    <div className="form-group pt-2">
                        <label className="form-check-label">
                            <strong>
                                * Mandatory
                            </strong>
                        </label>
                    </div>

                    <div className="form-row pl-2">
                        <button className={`btn btn-primary float-left mr-2 ${categoryId ? '' : 'd-none'}`}
                                onClick={() => this.addGif()}>
                            Add
                        </button>

                        <button className={`btn float-left mr-2 ${categoryId ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => this.loadPreview()}>
                            Preview
                        </button>

                        <button className={`btn btn-success float-left mr-2 ${this.state.previewUrl ? '' : 'd-none'}`}
                                onClick={() => this.download()}>
                            Download
                        </button>
                    </div>
                </div>

                <div className={`center ${this.state.isLoading ? '' : 'd-none'}`}>
                    <div>
                        <div className="spinner-border text-primary"/>
                    </div>
                    <label>{this.state.loadingStatus}</label>
                </div>
            </div>
        );
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.checkUpdatePath(this.getCurrentCategoryId())
    }

    async componentDidUpdate() {
        super.componentDidMount();
        await this.checkUpdatePath(this.getCurrentCategoryId())
    }

    getNavProps() {
        const categoryId = this.getCurrentCategoryId();
        if (categoryId) {
            return getLoggedInNav(
                getPathFromCache(app.cache.categories, categoryId, true),
                [{
                    title: 'Add GIF',
                    href: `/gif/create/${categoryId}`,
                    icon: 'fa-plus',
                }, {
                    title: 'Add category',
                    onClick: () => addCategory(categoryId),
                    icon: 'fa-folder-plus',
                }, {
                    title: 'Edit category',
                    href: `/edit/${categoryId}`,
                    icon: 'fa-edit',
                }],
            );
        }
        return getLoggedOutNav();
    }

    getCurrentCategoryId() {
        return this.props.match.params.categoryId;
    }
}