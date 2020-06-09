import React, {Component} from 'react';
import GifSourcePreview from "./GifSourcePreview";
import './GifCreateSource.css'
import {sourceMediaTypes} from "../constants";
import cropping from "../helper/cropping";
import {swal} from "./Swal";
import getBase64FromDataUrl from "../helper/getBase64FromDataUrl";

const dataSource = {
    url: 'URL',
    base64: 'BASE64',
    file: 'FILE',
};

export default class GifCreateSource extends Component {
    constructor(props) {
        super(props);

        this.onFileLoaded = this.onFileLoaded.bind(this);
        this.onFileError = this.onFileError.bind(this);
        this.fileReader = new FileReader();
        this.fileReader.onload = this.onFileLoaded;
        this.fileReader.onerror = this.onFileError;

        this.typeRef = React.createRef();
        this.inputConfigs = {
            url: {
                ref: React.createRef(),
                type: 'text',
                defaultValue: '',
                setStateOnChange: true,
                getIsValid: r => !r && this.props.source.dataInvalid ? false : null,
                setValue: r => {
                    this.props.source.url = r || undefined;
                    this.props.source.dataInvalid = false;
                },
            },
            file: {
                ref: React.createRef(),
                type: 'file',
                accept: 'video/*,image/*',
                classes: 'custom-file-input',
                setStateOnChange: true,
                getIsValid: r => !r && this.props.source.dataInvalid ? false : null,
                setValue: (_, input) => this.setFile(input.files),
            },
            base64: {
                ref: React.createRef(),
                type: 'text',
                defaultValue: '',
                setStateOnChange: true,
                getIsValid: r => !r && this.props.source.dataInvalid ? false : null,
                setValue: r => {
                    this.props.source.data = r || undefined;
                    this.props.source.dataInvalid = false;
                },
            },
            x: {
                ref: React.createRef(),
                type: 'number',
                defaultValue: '0',
                getIsValid: r => Number.isNaN(parseInt(r, 10)) ? false : null,
                setValue: r => this.props.source.cropRect.x = parseInt(r, 10) || 0,
            },
            y: {
                ref: React.createRef(),
                type: 'number',
                defaultValue: '0',
                getIsValid: r => Number.isNaN(parseInt(r, 10)) ? false : null,
                setValue: r => this.props.source.cropRect.y = parseInt(r, 10) || 0,
            },
            width: {
                ref: React.createRef(),
                type: 'number',
                defaultValue: '200',
                min: '1',
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.cropRect.width = parseInt(r, 10) || null,
            },
            height: {
                ref: React.createRef(),
                type: 'number',
                defaultValue: '200',
                min: '1',
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.cropRect.height = parseInt(r, 10) || null,
            },
            frameDelay: {
                ref: React.createRef(),
                type: 'number',
                min: 0,
                defaultValue: this.props.source.frameDelay,
                getIsValid: r => parseInt(r, 10) >= 0 ? null : false,
                setValue: r => this.props.source.frameDelay = parseInt(r, 10) || undefined,
            },
            start: {
                ref: React.createRef(),
                type: 'number',
                min: 0,
                defaultValue: this.props.source.start,
                getIsValid: r => parseInt(r, 10) < 0 ? false : null,
                setValue: r => this.props.source.start = parseInt(r, 10) || undefined,
            },
            count: {
                ref: React.createRef(),
                type: 'number',
                min: 1,
                defaultValue: this.props.source.count,
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.count = parseInt(r, 10) || undefined,
            },
            step: {
                ref: React.createRef(),
                type: 'number',
                min: 1,
                defaultValue: this.props.source.step,
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.step = parseInt(r, 10) || undefined,
            }
        };
        this.state = {
            dataSource: dataSource.url,
            previewSize: null,
            file: null,
            isLoadingFile: false,
            fileData: null,
            lastValidated: null, // only set to rerender
        };
    }

    async setFile(files) {
        this.props.source.dataInvalid = false;

        if (!files.length) {
            this.fileReader.abort();
            if (this.state.fileUrl) URL.revokeObjectURL(this.state.fileUrl);

            this.setState({
                file: null,
                fileUrl: null,
                fileData: null,
                isLoadingFile: false
            });
        } else if (this.state.file !== files[0]) {
            const file = files[0];

            this.fileReader.abort();
            this.fileReader.readAsDataURL(file);
            this.setState({
                file,
                fileUrl: URL.createObjectURL(file),
                fileData: null,
                isLoadingFile: true
            });

            const fileSourceType = Object.values(sourceMediaTypes)
                .find(type => type.mediaType === file.type);
            if (!file.type) {
                await swal.show({
                    title: 'Unknown file type',
                    icon: 'fa-exclamation-triangle',
                    color: 'warning',
                    text: `The type may not be supported.`,
                    buttons: 'Ok',
                });
            } else if (!fileSourceType) {
                await swal.show({
                    title: 'Unsupported file type',
                    icon: 'fa-exclamation-triangle',
                    color: 'warning',
                    text: `The type '${file.type}' may not be supported.`,
                    buttons: 'Ok',
                });
            } else if (fileSourceType.value !== this.props.source.type) {
                const result = await swal.show({
                    title: 'Wrong file type',
                    icon: 'fa-question-circle',
                    color: 'warning',
                    text: `The selected type is different from the file type '${file.type}'. Should it be changed?`,
                    buttons: [{
                        type: 'primary',
                        text: 'Yes',
                    }, {
                        type: 'secondary',
                        text: 'No',
                    }],
                });

                if (result.type === 'primary') {
                    this.props.source.type = this.typeRef.current.value = fileSourceType.value;
                    this.setState({lastValidated: 'type'});
                }
            }
        }
    }

    onFileLoaded(e) {
        const data = getBase64FromDataUrl(e.target.result);

        if (this.state.dataSource === dataSource.file) this.props.source.data = data;
        this.setState({fileData: data, isLoadingFile: false});
    }

    onFileError() {
        this.setState({fileData: null, isLoadingFile: false});
    }

    formatFile(file) {
        let size;
        if (file.size < 1000000) size = `${(file.size / 1000.0).toPrecision(3)} KB`;
        else size = `${(file.size / 1000000.0).toPrecision(3)} MB`;
        return `${file.name} (${size})`;
    }

    setValue(inputConfig, value) {
        inputConfig.setValue(value, inputConfig.ref.current);

        inputConfig.ref.current.value = value;
        const isValid = inputConfig.getIsValid(value);
        if (isValid === true) {
            inputConfig.ref.current.classList.remove('is-invalid');
            inputConfig.ref.current.classList.add('is-valid');
        } else if (isValid === false) {
            inputConfig.ref.current.classList.remove('is-valid');
            inputConfig.ref.current.classList.add('is-invalid');
        } else {
            inputConfig.ref.current.classList.remove('is-valid', 'is-invalid');
        }
    }

    autoFit() {
        const {x, y, width, height} = cropping.getFitRect(this.state.previewSize.width,
            this.state.previewSize.height, this.props.targetWidth, this.props.targetHeight);
        this.setValue(this.inputConfigs.x, x);
        this.setValue(this.inputConfigs.y, y);
        this.setValue(this.inputConfigs.width, width);
        this.setValue(this.inputConfigs.height, height);
    }

    autoCrop() {
        const {x, y, width, height} = cropping.getCropRect(this.state.previewSize.width,
            this.state.previewSize.height, this.props.targetWidth, this.props.targetHeight);
        this.setValue(this.inputConfigs.x, x);
        this.setValue(this.inputConfigs.y, y);
        this.setValue(this.inputConfigs.width, width);
        this.setValue(this.inputConfigs.height, height);
    }

    onChangeValue(setState, element, setValue, getIsValid) {
        setValue(element.value, element);

        const isValid = getIsValid(element.value);
        if (isValid === true) {
            element.classList.remove('is-invalid');
            element.classList.add('is-valid');
        } else if (isValid === false) {
            element.classList.remove('is-valid');
            element.classList.add('is-invalid');
        } else {
            element.classList.remove('is-valid', 'is-invalid');
        }

        if (setState) {
            this.setState({lastValidated: element.name});
        }
    }

    renderInput({
                    ref, type, classes = 'form-control', accept, defaultValue, min, disabled,
                    placeHolder, setStateOnChange, setStateOnBlur, setValue, getIsValid
                }) {
        let validationClass = '';

        if (ref.current) {
            const isValid = getIsValid(ref.current.value);
            if (isValid === true) validationClass = 'is-valid';
            else if (isValid === false) validationClass = 'is-invalid';
        }

        return (
            <input ref={ref} type={type} className={`${classes} ${validationClass}`} accept={accept}
                   defaultValue={defaultValue} placeholder={placeHolder} min={min} disabled={disabled}
                   onChange={e => this.onChangeValue(setStateOnChange, e.target, setValue, getIsValid)}
                   onBlur={e => this.onChangeValue(setStateOnBlur, e.target, setValue, getIsValid)}/>
        )
    }

    renderType(type) {
        return (
            <option key={type.value} value={type.value}>{type.name}</option>
        );
    }

    render() {
        const typeOptions = Object.values(sourceMediaTypes).map(this.renderType);
        const enableFrames = this.props.source.type === sourceMediaTypes.gif.value ||
            this.props.source.type === sourceMediaTypes.mp4.value;

        return (
            <div className="form-group">
                <div className="form-group">
                    <label><strong>Type</strong> (*)</label>
                    <select ref={this.typeRef} className="form-control" defaultValue={this.props.source.type}
                            name="type"
                            onChange={e => {
                                this.props.source.type = parseInt(e.target.value, 10);
                                this.setState({lastValidated: e.target.name});
                            }}>
                        {typeOptions}
                    </select>
                </div>

                <div className="form-group">
                    <label><strong>Data source</strong> (*)</label>
                    <div className="pb-2">
                        <div className="custom-control custom-radio custom-control-inline"
                             onClick={() => {
                                 this.props.source.url = this.inputConfigs.url.ref.current.value;
                                 this.props.source.data = null;
                                 this.setState({dataSource: dataSource.url});
                             }}>
                            <input type="radio" className="custom-control-input" readOnly
                                   checked={this.state.dataSource === dataSource.url}/>
                            <label className="custom-control-label">Url</label>
                        </div>

                        <div className="custom-control custom-radio custom-control-inline"
                             onClick={() => {
                                 this.props.source.url = null;
                                 this.props.source.data = this.state.fileData || null;
                                 this.setState({dataSource: dataSource.file});
                             }}>
                            <input type="radio" className="custom-control-input" readOnly
                                   checked={this.state.dataSource === dataSource.file}/>
                            <label className="custom-control-label">File</label>
                        </div>

                        <div className="custom-control custom-radio custom-control-inline"
                             onClick={() => {
                                 this.props.source.url = null;
                                 this.props.source.data = this.inputConfigs.base64.ref.current.value;
                                 this.setState({dataSource: dataSource.base64});
                             }}>
                            <input type="radio" className="custom-control-input" readOnly
                                   checked={this.state.dataSource === dataSource.base64}/>
                            <label className="custom-control-label">Base64</label>
                        </div>
                    </div>
                    <div className={`input-group ${this.state.dataSource === dataSource.url ? '' : 'd-none'}`}>
                        {this.renderInput(this.inputConfigs.url)}
                        <div className="input-group-append">
                            <button className="btn btn-secondary" type="button" disabled={!this.props.source.url}
                                    onClick={() => this.setState({
                                        preview: {
                                            type: this.props.source.type,
                                            url: this.props.source.url,
                                        }
                                    })}>
                                Preview
                            </button>
                        </div>
                    </div>
                    <div className={`input-group ${this.state.dataSource === dataSource.file ? '' : 'd-none'}`}>
                        <div className="custom-file">
                            {this.renderInput(this.inputConfigs.file)}
                            <label className="custom-file-label">
                                {this.state.file ? this.formatFile(this.state.file) : 'Choose file'}
                            </label>
                        </div>
                        <div className="input-group-append">
                            <button className="btn btn-secondary" type="button"
                                    disabled={!this.state.file || this.state.isLoadingFile}
                                    onClick={() => {
                                        this.fileReader.readAsDataURL(this.state.file);
                                        this.setState({fileData: null, isLoadingFile: true});
                                    }}>
                                Reupload
                            </button>
                            <button className="btn btn-secondary" type="button"
                                    disabled={!this.state.fileUrl}
                                    onClick={() => this.setState({
                                        preview: {
                                            type: this.props.source.type,
                                            url: this.state.fileUrl,
                                        }
                                    })}>
                                Preview
                            </button>
                        </div>
                    </div>
                    <div className={`input-group ${this.state.dataSource === dataSource.base64 ? '' : 'd-none'}`}>
                        {this.renderInput(this.inputConfigs.base64)}
                        <div className="input-group-append">
                            <button className="btn btn-secondary" type="button" disabled={!this.props.source.data}
                                    onClick={() => this.setState({
                                        preview: {
                                            type: this.props.source.type,
                                            base64: this.props.source.data,
                                        }
                                    })}>
                                Preview
                            </button>
                        </div>
                    </div>
                </div>

                {this.state.preview ?
                    <GifSourcePreview data={this.state.preview}
                                      onSizeLoaded={(width, height) => this.setState({
                                          previewSize: {width, height,}
                                      })}/> : null}

                <div className="form-group">
                    <div className="custom-control custom-switch"
                         onClick={() => {
                             if (this.props.source.cropRect) {
                                 this.props.source.cropRect = null;
                                 this.setState({enableCrop: false});
                             } else {
                                 this.props.source.cropRect = {
                                     x: parseInt(this.inputConfigs.x.ref.current.value, 10),
                                     y: parseInt(this.inputConfigs.y.ref.current.value, 10),
                                     width: parseInt(this.inputConfigs.width.ref.current.value, 10),
                                     height: parseInt(this.inputConfigs.height.ref.current.value, 10),
                                 };
                                 this.setState({enableCrop: false});
                             }
                         }}>
                        <input type="checkbox" className="custom-control-input" readOnly
                               checked={!!this.props.source.cropRect}/>
                        <label className="custom-control-label">
                            Crop source
                        </label>
                        <label className={`float-right ${this.state.previewSize ? '' : 'd-none'}`}>
                            {"Size: "}
                            {this.state.previewSize && this.state.previewSize.width}
                            {" x "}
                            {this.state.previewSize && this.state.previewSize.height}
                        </label>
                    </div>
                </div>
                <div className={`form-row ${this.props.source.cropRect ? '' : 'd-none'}`}>
                    <div className="form-group col-md-3">
                        <label><strong>X</strong> (*)</label>
                        {this.renderInput(this.inputConfigs.x)}
                    </div>
                    <div className="form-group col-md-3">
                        <label><strong>Y</strong> (*)</label>
                        {this.renderInput(this.inputConfigs.y)}
                    </div>
                    <div className="form-group col-md-3">
                        <label> <strong>Width </strong> (*)</label>
                        {this.renderInput(this.inputConfigs.width)}
                    </div>
                    <div className="form-group col-md-3">
                        <label> <strong>Height</strong> (*)</label>
                        {this.renderInput(this.inputConfigs.height)}
                    </div>
                </div>

                <div className={`clearfix pb-1 ${this.props.source.cropRect ? '' : 'd-none'}`}>
                    <button className="btn btn-info ml-2 float-right" type="button"
                            disabled={!this.props.source.cropRect || !this.state.previewSize || !(this.props.targetWidth > 0) || !(this.props.targetHeight > 0)}
                            onClick={() => this.autoCrop()}>
                        Crop
                    </button>
                    <button className="btn btn-info ml-2 float-right" type="button"
                            disabled={!this.props.source.cropRect || !this.state.previewSize || !(this.props.targetWidth > 0) || !(this.props.targetHeight > 0)}
                            onClick={() => this.autoFit()}>
                        Fit
                    </button>
                </div>


                <div className="form-row">
                    <div className="form-group col-md-3">
                        <label><strong>Frame delay</strong> (*)</label>
                        {this.renderInput(this.inputConfigs.frameDelay)}
                    </div>
                    <div className="form-group col-md-3">
                        <label>Start frame</label>
                        {this.renderInput({
                            ...this.inputConfigs.start,
                            disabled: !enableFrames,
                        })}
                    </div>
                    <div className="form-group col-md-3">
                        <label>Frame count</label>
                        {this.renderInput({
                            ...this.inputConfigs.count,
                            disabled: !enableFrames,
                        })}
                    </div>
                    <div className="form-group col-md-3">
                        <label>Frame step size</label>
                        {this.renderInput({
                            ...this.inputConfigs.step,
                            disabled: !enableFrames,
                        })}
                    </div>
                </div>
            </div>
        );
    }

    componentWillUnmount() {
        this.fileReader.onload = null;
        this.fileReader.onerror = null;

        if (this.state.fileUrl) URL.revokeObjectURL(this.state.fileUrl);
    }
}