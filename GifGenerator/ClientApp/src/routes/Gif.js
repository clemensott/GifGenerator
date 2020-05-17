import React, {Component} from 'react';
import Navbar from "../components/Navbar";

export default class Gif extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {
        return (
            <div>
                <Navbar data={this.props.data}/>
                <div className="container">
                    <h1>GIFFFFFFFFFFFF</h1>
                </div>
            </div>
        );
    }
}