import React from 'react';
import Navbar from "../components/Navbar";
import DataCacheBase from "./DataCacheBase";
import getPathFromCache from "../helper/getPathFromCache";
import GifsList from "../components/GifsList";
import './Gif.css'

export default class Gif extends DataCacheBase {
    constructor(props) {
        super(props);

        this.state = {}
    }

    render() {
        const {gifId, categoryId} = this.getCurrentData();
        let path = null;
        let siblings = null;
        if (typeof categoryId === 'string') {
            path = getPathFromCache(this.props.cache.categories, categoryId, true);
            siblings = this.props.cache.categoryData[categoryId] &&
                this.props.cache.categoryData[categoryId].gifs.filter(gif => gif.id !== gifId);
        }


        return (
            <div>
                <Navbar path={path}/>

                <div className="container">
                    <div className="gif-item-container">
                        <a target="_blank" rel="noopener noreferrer" href={`/api/gif/${gifId}`}>
                            <img src={`/api/gif/${gifId}`} alt={gifId} className="gif-item"/>
                        </a>
                    </div>
                    
                    <GifsList gifs={siblings || []}/>
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
        const {gifId, categoryId} = this.getCurrentData();
        const promises = [this.checkGif(gifId)];
        if (typeof categoryId === 'string') {
            promises.push(this.checkUpdateCategory(categoryId));
            promises.push(this.checkUpdatePath(categoryId));
        }
        await Promise.all(promises);
    }

    getCurrentData() {
        const gifId = this.props.match.params.gifId;
        const meta = this.props.cache.gifs[gifId];
        const categoryId = meta && meta.categoryId;
        return {gifId, meta, categoryId};
    }
}