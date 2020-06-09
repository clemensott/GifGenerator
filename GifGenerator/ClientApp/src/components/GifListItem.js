import React, {Component} from 'react';
import {Link} from "react-router-dom";
import './GifListItem.css'
import getRandomColor from "../helper/getRandomColor";
import {swal} from "./Swal";
import {app} from "../App";

export default class GifListItem extends Component {
    constructor(props) {
        super(props);
        this.pt = 100 / props.gif.ratio;
        this.background = getRandomColor();

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
            const gifId = this.props.gif.id;
            this.setState({isDeleting: true});
            const response = await fetch(`/api/gif/${gifId}`, {method: 'DELETE'});

            if (response.ok) {
                const category = app.cache.categoryData[this.props.gif.categoryId];
                for (let i = 0; i < category.gifs.length; i++) {
                    if (category.gifs[i].id === gifId) category.gifs.splice(i, 1);
                }

                delete app.cache.gifs[gifId];
                this.setState({isDeleting: false});
                app.rerender();
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
        return (
            <div className="gif-list-item-container rounded"
                 style={{paddingTop: `${this.pt}%`, background: this.background,}}>
                <Link to={`/gif/${this.props.gif.id}`}>
                    <div className="gif-list-item-content">
                        <img src={`/api/gif/${this.props.gif.id}`} alt={this.props.gif.id}
                             className="gif-list-item-image rounded"/>
                    </div>
                </Link>

                <button className="btn btn-light gif-list-item-delete-icon"
                        onClick={() => this.delete()}>
                    <i className="fas fa-trash-alt"/>
                </button>

                <div className={`gif-list-item-spinner-container ${this.state.isDeleting ? '' : 'd-none'}`}>
                    <div className="center">
                        <div className="spinner-border text-primary"/>
                    </div>
                </div>
            </div>
        );
    }
}