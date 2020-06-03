﻿import React from 'react';
import Navbar from "../components/Navbar";
import {Redirect,} from "react-router-dom";
import DataCacheBase from "./DataCacheBase";
import {Swal} from "../helper/swal";
import getPathFromCache from "../helper/getPathFromCache";
import GifCreateSource from "../components/GifCreateSource";
import './CreateGif.css'

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

    async loadPreview() {
        if (!this.validate()) return;

        try {
            this.setState({isLoading: true, loadingStatus: 'Processing'});
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
                await new new Swal({
                    title: 'Error',
                    icon: 'fa-times',
                    color: 'danger',
                    text: `Status code: ${response.status}`,
                    textSecondary: response.statusText,
                    buttons: 'Ok',
                }).show();
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e);
            await new new Swal({
                title: 'Exception',
                icon: 'fa-times',
                color: 'danger',
                text: e.message,
                buttons: 'Ok',
            }).show();
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
                await new new Swal({
                    title: 'Error',
                    icon: 'fa-times',
                    color: 'danger',
                    text: `Status code: ${response.status}`,
                    textSecondary: response.statusText,
                    buttons: 'Ok',
                }).show();
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e);
            await new new Swal({
                title: 'Exception',
                icon: 'fa-times',
                color: 'danger',
                text: e.message,
                buttons: 'Ok',
            }).show();
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
        const customIcons = [{
            title: 'Add GIF',
            href: `/gif/create/${categoryId}`,
            icon: 'fa-plus',
        }, {
            title: 'Edit category',
            href: `/edit/${categoryId}`,
            icon: 'fa-edit',
        }];
        const path = getPathFromCache(this.props.cache.categories, categoryId, true);
        const sources = this.create.sources.map((source, index) => this.renderSource(source, index));

        const currentCategoryName = this.props.cache.categories[categoryId] && this.props.cache.categories[categoryId].name;
        if (currentCategoryName) document.title = `Add GIF - ${currentCategoryName}`;

        return (
            <div className="flex-container">
                <Navbar path={path} customIcons={customIcons}/>

                <div className="container content-container pt-4 pb-3">
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

                        <div className="form-row">
                            <button className="btn btn-primary float-left"
                                    onClick={() => this.addGif()}>
                                Add
                            </button>

                            <button className="btn btn-secondary float-left ml-2"
                                    onClick={() => this.loadPreview()}>
                                Preview
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

    getCurrentCategoryId() {
        return this.props.match.params.categoryId || (this.props.data.user && this.props.data.user.rootCategoryId);
    }
}