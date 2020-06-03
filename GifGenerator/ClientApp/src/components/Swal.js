import React, {Component} from 'react';
import './Swal.css'

export const swal = {
    show: props => null,
};

export class Swal extends Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
        this.state = {
            swal: null,
        };
        
        swal.show = props => this.onShowSwal(new SwalProps(props));
        this.onSwalResolveListener= this.onSwalResolveListener.bind(this);
    }

    onShowSwal(swal) {
        if (this.state.swal) {
            this.state.swal.removeOnResolveListener(this.onSwalResolveListener);
            this.state.swal.resolve('cancel');
        }

        swal.addOnResolveListener(this.onSwalResolveListener);
        this.setState({swal});
        return swal.show();
    }

    onSwalResolveListener() {
        this.state.swal.removeOnResolveListener(this.onSwalResolveListener);
        this.state.swal = null;
        this.setState({swal:null});
    }

    renderButton(btn) {
        const id = btn.id || btn.type;
        return (
            <button key={id}
                    type="button"
                    className={`btn btn-${btn.type}`}
                    onClick={() => this.state.swal.resolve(id, this.inputRef.current.value)}>
                {btn.text}
            </button>
        );
    }

    render() {
        if (!this.state.swal) return null;
        const swal = this.state.swal;

        let buttons = null;
        if (typeof swal.buttons === 'string') {
            buttons = this.renderButton({
                type: 'primary',
                text: swal.buttons
            });
        } else if (swal.buttons) {
            if (typeof swal.buttons.length === 'number') {
                buttons = swal.buttons && swal.buttons.map(btn => this.renderButton(btn));
            } else {
                buttons = this.renderButton(swal.buttons);
            }
        }
        return (
            <div>
                <div className="modal fade show swal-container" tabIndex="-1"
                     onClick={(e) => {
                         if (e.target.classList.contains('swal-container')) {
                             swal.resolve('close', this.inputRef.current.value);
                         }
                     }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                            <span className={`text-${swal.color}`}>
                                <i className={`fas ${swal.icon ? swal.icon : 'd-none'} fa-2x pr-3`}/>
                            </span>
                                <h5 className="modal-title">{swal.title}</h5>
                                <button type="button" className="close"
                                        onClick={() => swal.resolve('close', this.inputRef.current.value)}>
                                    &times;
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>{swal.text}</p>
                                <p className={`text-secondary ${swal.textSecondary ? '' : 'd-none'}`}>
                                    <small>{swal.textSecondary}</small>
                                </p>
                                <input ref={this.inputRef} type={swal.input && swal.input.type || 'text'}
                                       className={`form-control ${swal.input ? '' : 'd-none'}`}
                                       placeholder={swal.input && swal.input.placeholder}/>
                            </div>
                            <div className="modal-footer">
                                {buttons}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function getSwalAddOnResolveListenerFunction(swal) {
    return function (callback) {
        swal.onResolveListeners.push(callback);
    };
}

function getSwalRemoveOnResolveListenerFunction(swal) {
    return function (callback) {
        const index = swal.onResolveListeners.indexOf(callback);
        if (index > -1) {
            swal.onResolveListeners.splice(index, 1);
        }
    };
}

function getSwalShowFunction(swal) {
    return function () {
        swal.promise = new Promise(resolve => {
            swal.resolve = (type, value) => {
                const result = {type, value};
                resolve(result);
                swal.onResolveListeners.forEach(listener => listener(swal, result))
            }
        });

        return swal.promise;
    }
}

export function SwalProps({title, icon, color, text, textSecondary, input, buttons}) {
    this.title = title;
    this.icon = icon;
    this.color = color;
    this.text = text;
    this.textSecondary = textSecondary;
    this.input = input;
    this.buttons = buttons;

    this.onResolveListeners = [];

    this.addOnResolveListener = getSwalAddOnResolveListenerFunction(this);
    this.removeOnResolveListener = getSwalRemoveOnResolveListenerFunction(this);
    this.show = getSwalShowFunction(this);
}