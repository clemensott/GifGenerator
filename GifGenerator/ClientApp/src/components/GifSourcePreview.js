import React, {Component} from 'react';
import './GifSourcePreview.css'
import {sourceMediaTypes} from "../constants";

export default class GifSourcePreview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            error: false,
            data: null,
            fileData: null,
        };

        this.currentId = 0;     // Used to force react to create a new img/video element.
                                // Does not mean that image or video gets completely reloaded.  
        
        this.onFileLoaded = this.onFileLoaded.bind(this);
        this.fileLoading = null;
        this.fileReader = new FileReader();
        this.fileReader.onload = this.onFileLoaded;
    }

    setLoaded(width, height) {
        this.setState({
            loaded: true,
            error: false,
            data: this.props.data,
        });

        if (this.props.onSizeLoaded) this.props.onSizeLoaded(width, height);
    }

    setError(error) {
        this.setState({
            loaded: true,
            error,
            data: this.props.data,
        });

        if (this.props.onSizeLoaded) this.props.onSizeLoaded(null, null);
    }

    getSelectedMediaType() {
        return Object.values(sourceMediaTypes).find(type => type.value === this.props.data.type).mediaType;
    }

    onFileLoaded(e) {
        console.log(e.target.result);
        this.setState({fileData: e.target.result});
    }

    getSrc() {
        if (this.props.data.url) return this.props.data.url;
        if (this.props.data.base64) return `data:${this.getSelectedMediaType()};base64,${this.props.data.base64}`;
        if (this.state.fileData) return this.state.fileData;
        if (this.props.data.file && this.props.data.file !== this.fileLoading) {
            this.fileReader.abort();
            this.fileLoading = this.props.data.file;
            this.fileReader.readAsDataURL(this.fileLoading);
        }

        return null;
    }

    renderItem() {
        const src = this.getSrc();
        if (!src) return null;

        if (this.props.data.type === 4) {
            return (
                <video key={this.currentId} src={src} controls={true} className="gif-source-preview-video"
                       onCanPlay={e => {
                           this.setLoaded(e.target.videoWidth, e.target.videoHeight);
                           if (this.props.onPositionChanged) this.props.onPositionChanged(0);
                       }}
                       onError={e => this.setError(e.target.error)}
                       onTimeUpdate={e => {
                           if (this.props.onPositionChanged) this.props.onPositionChanged(e.target.currentTime);
                       }}
                       onDurationChange={e => {
                           if (this.props.onDurationChanged) this.props.onDurationChanged(e.target.duration);
                       }}/>
            )
        }
        return (
            <img key={this.currentId} src={src} alt="Error" className="gif-source-preview-image"
                 onLoad={e => this.setLoaded(e.target.naturalWidth, e.target.naturalHeight)}
                 onError={() => this.setError(true)}/>
        )
    }

    render() {
        if (this.state.loaded && this.props.data !== this.state.data) {
            this.currentId++;
            this.state.loaded = false;
            this.state.error = false;
            this.state.fileData = null;
        }

        return (
            <div className="gif-create-source-preview-container">
                <div className={this.state.loaded ? 'd-none' : ''}>
                    <div className="spinner-border text-primary"/>
                </div>
                <div className={this.state.loaded && !this.state.error ? '' : 'd-none'}>
                    {this.renderItem()}
                </div>
                <label className={`text-danger ${this.state.error ? '' : 'd-none'}`}>
                    {this.state.error.message || 'Could not load preview!'}
                </label>
            </div>
        )
    }

    componentWillUnmount() {
        this.fileReader.onload = null;
        this.fileReader.abort();
    }
}