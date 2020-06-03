import React, {useRef} from 'react';
import './Swal.css'

function renderButton(btn, inputRef, resolve) {
    const id = btn.id || btn.type;
    return (
        <button key={id}
                type="button"
                className={`btn btn-${btn.type}`}
                onClick={() => resolve(id, inputRef.current.value)}>
            {btn.text}
        </button>
    );
}

export default function (props) {
    if (!props.title) return null;

    const inputRef = useRef('');

    let buttons = null;
    if (typeof props.buttons === 'string') {
        buttons = renderButton({
            type: 'primary',
            text: props.buttons
        }, inputRef, props.resolve);
    } else if (props.buttons) {
        if (typeof props.buttons.length === 'number') {
            buttons = props.buttons && props.buttons.map(btn => renderButton(btn, inputRef, props.resolve));
        } else {
            buttons = renderButton(props.buttons, inputRef, props.resolve);
        }
    }
    return (
        <div>
            <div className="modal fade show swal-container" tabIndex="-1"
                 onClick={(e) => {
                     if (e.target.classList.contains('swal-container')) props.resolve('close', inputRef.current.value);
                 }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className={`text-${props.color}`}>
                                <i className={`fas ${props.icon ? props.icon : 'd-none'} fa-2x pr-3`}/>
                            </span>
                            <h5 className="modal-title">{props.title}</h5>
                            <button type="button" className="close"
                                    onClick={() => props.resolve('close', inputRef.current.value)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{props.text}</p>
                            <p className={`text-secondary ${props.textSecondary ? '' : 'd-none'}`}>
                                <small>{props.textSecondary}</small>
                            </p>
                            <input ref={inputRef} type={props.input && props.input.type || 'text'}
                                   className={`form-control ${props.input ? '' : 'd-none'}`}
                                   placeholder={props.input && props.input.placeholder}/>
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