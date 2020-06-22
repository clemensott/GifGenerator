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
        this.previewDuration = null;

        this.typeRef = React.createRef();
        this.tagPositionRef = React.createRef();
        this.tagSizeRef = React.createRef();
        this.inputConfigs = {
            url: {
                ref: React.createRef(),
                type: 'text',
                defaultValue: '',
                setStateOnChange: true,
                getIsValid: r => !r && this.props.source.dataInvalid ? false : null,
                setValue: r => {
                    this.props.source.url = r || undefined;
                    this.props.source.dataInvalid = undefined;
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
                    this.props.source.dataInvalid = undefined;
                },
            },
            x: {
                ref: React.createRef(),
                type: 'number',
                defaultValue: '0',
                placeholder: 'Enter horizontal offset',
                getIsValid: r => Number.isNaN(parseInt(r, 10)) ? false : null,
                setValue: r => this.props.source.cropRect.x = parseInt(r, 10) || 0,
            },
            y: {
                ref: React.createRef(),
                type: 'number',
                defaultValue: '0',
                placeholder: 'Enter vertical offset',
                getIsValid: r => Number.isNaN(parseInt(r, 10)) ? false : null,
                setValue: r => this.props.source.cropRect.y = parseInt(r, 10) || 0,
            },
            width: {
                ref: React.createRef(),
                type: 'number',
                defaultValue: '200',
                min: '1',
                placeholder: 'Enter width',
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.cropRect.width = parseInt(r, 10) || null,
            },
            height: {
                ref: React.createRef(),
                type: 'number',
                defaultValue: '200',
                min: '1',
                placeholder: 'Enter height',
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.cropRect.height = parseInt(r, 10) || null,
            },
            frameDelay: {
                ref: React.createRef(),
                type: 'number',
                min: 0,
                placeholder: '0',
                defaultValue: this.props.source.frameDelay,
                getIsValid: r => !!r && parseInt(r, 10) < 0 ? false : null,
                setValue: r => this.props.source.frameDelay = parseInt(r, 10) || undefined,
            },
            begin: {
                ref: React.createRef(),
                type: 'number',
                min: 0,
                placeholder: '0',
                defaultValue: this.props.source.gifFrameSelection.start,
                getIsValid: r => parseInt(r, 10) < 0 ? false : null,
                setValue: r => this.props.source.gifFrameSelection.begin = parseInt(r, 10) || undefined,
            },
            count: {
                ref: React.createRef(),
                type: 'number',
                min: 1,
                placeholder: 'until end',
                defaultValue: this.props.source.gifFrameSelection.count,
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.gifFrameSelection.count = parseInt(r, 10) || undefined,
            },
            step: {
                ref: React.createRef(),
                type: 'number',
                min: 1,
                placeholder: '1',
                defaultValue: this.props.source.gifFrameSelection.step,
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.gifFrameSelection.step = parseInt(r, 10) || undefined,
            },
            beginSeconds: {
                ref: React.createRef(),
                type: 'number',
                min: 0,
                step: 0.1,
                placeholder: '0',
                defaultValue: this.props.source.videoFrameSelection.beginSeconds,
                getIsValid: r => {
                    const beginSeconds = parseFloat(r);
                    return beginSeconds && (beginSeconds < 0 || (this.previewDuration && beginSeconds > this.previewDuration)) ? false : null;
                },
                setValue: r => {
                    const beginSeconds = parseFloat(r) || 0;
                    const endSeconds = parseFloat(this.inputConfigs.endSeconds.ref.current.value) || 0;
                    this.props.source.videoFrameSelection.beginSeconds = beginSeconds || undefined;

                    this.props.source.videoFrameSelection.durationSeconds =
                        (endSeconds && Math.round(endSeconds - beginSeconds)) || undefined;

                    this.updateValidation(this.inputConfigs.endSeconds.ref.current, this.inputConfigs.endSeconds.getIsValid)
                },
            },
            endSeconds: {
                ref: React.createRef(),
                type: 'number',
                min: 0,
                step: 0.1,
                placeholder: 'until end',
                defaultValue: this.props.source.videoFrameSelection.endSeconds,
                getIsValid: r => {
                    if (r === '') return null;
                    const endSeconds = parseFloat(r);
                    const beginSeconds = parseFloat(this.inputConfigs.beginSeconds.ref.current.value) || 0;
                    return (!this.previewDuration || endSeconds <= this.previewDuration) && endSeconds > beginSeconds ? null : false;
                },
                setValue: r => {
                    const endSeconds = parseFloat(r);
                    const beginSeconds = parseFloat(this.inputConfigs.beginSeconds.ref.current.value) || 0;
                    this.props.source.videoFrameSelection.durationSeconds =
                        (endSeconds && Math.round(endSeconds - beginSeconds)) || undefined;
                },
            },
            frameRate: {
                ref: React.createRef(),
                type: 'number',
                min: 1,
                placeholder: '15',
                defaultValue: this.props.source.videoFrameSelection.frameRate,
                getIsValid: r => !r || parseInt(r, 10) > 0 ? null : false,
                setValue: r => this.props.source.videoFrameSelection.frameRate = parseInt(r, 10) || undefined,
            },
            tagText: {
                ref: React.createRef(),
                type: 'text',
                placeholder: 'Enter text',
                getIsValid: r => !r && this.props.source.tagTextInvalid ? false : null,
                setValue: r => {
                    this.props.source.tag.text = r;
                    this.props.source.tagTextInvalid = undefined;
                },
            },
        };
        this.state = {
            dataSource: dataSource.url,
            previewSize: null,
            file: null,
            isLoadingFile: false,
            fileData: null,
            previewPosition: null,
            lastValidated: null, // only set to rerender
        };
    }

    async setFile(files) {
        this.props.source.dataInvalid = false;

        if (files.length && this.state.file !== files[0]) {
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

    showCropExplanation(objectFit, name) {
        const src = 'cropping_example.jpg';
        return swal.show({
            title: `Example: ${name}`,
            icon: 'fa-info',
            content: (
                <div className="gif-create-crop-explanation-container">
                    <div className="gif-create-crop-explanation-center">
                        <div className="gif-create-crop-explanation-without p-1">
                            <h6>Without:</h6>
                            <img src={src} alt="error" className="gif-create-crop-explanation-img"
                                 style={{objectFit: 'fit'}}/>
                        </div>
                        <div className="gif-create-crop-explanation-with p-1">
                            <h6>{name}:</h6>
                            <img src={src} alt="error" className="gif-create-crop-explanation-img"
                                 style={{objectFit}}/>
                        </div>
                    </div>
                </div>
            ),
            buttons: 'Ok',
        });
    }

    setPreview(preview) {
        this.previewDuration = null;
        this.setState({
            preview,
            previewSize: null,
            previewPosition: null,
        });
    }

    setValue(inputConfig, value) {
        inputConfig.setValue(value, inputConfig.ref.current);
        inputConfig.ref.current.value = value;

        this.updateValidation(inputConfig.ref.current, inputConfig.getIsValid);
    }

    onChangeValue(setState, element, setValue, getIsValid) {
        setValue(element.value, element);

        this.updateValidation(element, getIsValid);

        if (setState) {
            this.setState({lastValidated: element.name});
        }
    }

    updateValidation(element, getIsValid) {
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
    }

    renderInput({
                    ref, type, classes = 'form-control', accept, defaultValue, min, step,
                    disabled, placeholder, setStateOnChange, setStateOnBlur, setValue, getIsValid
                }) {
        let validationClass = '';

        if (ref.current) {
            const isValid = getIsValid(ref.current.value);
            if (isValid === true) validationClass = 'is-valid';
            else if (isValid === false) validationClass = 'is-invalid';
        }

        return (
            <input ref={ref} type={type} className={`${classes} ${validationClass}`} accept={accept}
                   defaultValue={defaultValue} placeholder={placeholder} min={min} step={step} disabled={disabled}
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
        const isOfTypeGif = this.props.source.type === sourceMediaTypes.gif.value;
        const isOfTypeVideo = this.props.source.type === sourceMediaTypes.mp4.value;

        console.log(typeof this.state.previewPosition, this.state.previewPosition);

        return (
            <div className="form-group pb-1">
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
                                    onClick={() => this.setPreview({
                                        type: this.props.source.type,
                                        url: this.props.source.url,
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
                                    onClick={() => this.setPreview({
                                        type: this.props.source.type,
                                        url: this.state.fileUrl,
                                    })}>
                                Preview
                            </button>
                        </div>
                    </div>
                    <div className={`input-group ${this.state.dataSource === dataSource.base64 ? '' : 'd-none'}`}>
                        {this.renderInput(this.inputConfigs.base64)}
                        <div className="input-group-append">
                            <button className="btn btn-secondary" type="button" disabled={!this.props.source.data}
                                    onClick={() => this.setPreview({
                                        type: this.props.source.type,
                                        base64: this.props.source.data,
                                    })}>
                                Preview
                            </button>
                        </div>
                    </div>
                </div>

                {this.state.preview ?
                    <GifSourcePreview data={this.state.preview}
                                      onSizeLoaded={(width, height) => this.setState({
                                          previewSize: width || height ? {width, height,} : null,
                                      })}
                                      onPositionChanged={position => this.setState({previewPosition: position})}
                                      onDurationChanged={duration => this.previewDuration = duration}/> : null}

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
                    <div className="btn-group float-right" role="group">
                        <button className="btn btn-info ml-2" type="button"
                                disabled={!this.props.source.cropRect || !this.state.previewSize || !(this.props.targetWidth > 0) || !(this.props.targetHeight > 0)}
                                onClick={() => this.autoCrop()}>
                            Auto crop
                        </button>
                        <button type="button" className="btn btn-secondary"
                                onClick={() => this.showCropExplanation('cover', 'Auto crop')}>
                            <i className="fas fa-question"/>
                        </button>
                    </div>
                    <div className="btn-group float-right" role="group">
                        <button className="btn btn-info ml-2" type="button"
                                disabled={!this.props.source.cropRect || !this.state.previewSize || !(this.props.targetWidth > 0) || !(this.props.targetHeight > 0)}
                                onClick={() => this.autoFit()}>
                            Auto fit
                        </button>
                        <button type="button" className="btn btn-secondary"
                                onClick={() => this.showCropExplanation('contain', 'Auto fit')}>
                            <i className="fas fa-question"/>
                        </button>
                    </div>
                </div>


                <div className="form-row">
                    <div className="form-group col-md-3">
                        <label title="Time each frame of create GIF is shown in 1/100 of a second">
                            Frame delay
                        </label>
                        {this.renderInput(this.inputConfigs.frameDelay)}
                    </div>
                    <div className={`form-group col-md-3 ${isOfTypeGif ? '' : 'd-none'}`}>
                        <label title="First frame which is taken">
                            Begin frame
                        </label>
                        {this.renderInput(this.inputConfigs.begin)}
                    </div>
                    <div className={`form-group col-md-3 ${isOfTypeGif ? '' : 'd-none'}`}>
                        <label title="Amount of frames taken. Is independent of frame step size">
                            Frames count
                        </label>
                        {this.renderInput(this.inputConfigs.count)}
                    </div>
                    <div className={`form-group col-md-3 ${isOfTypeGif ? '' : 'd-none'}`}>
                        <label title="Size of frame step: Two means that every second frame is taken">
                            Frame step size
                        </label>
                        {this.renderInput(this.inputConfigs.step)}
                    </div>
                    <div className={`form-group col-md-3 ${isOfTypeVideo ? '' : 'd-none'}`}>
                        <label title="Beginning of the extracted part/frames in seconds">
                            Begin in seconds
                        </label>
                        <div className="input-group">
                            {this.renderInput(this.inputConfigs.beginSeconds)}
                            <div className="input-group-append">
                                <button className="btn btn-secondary" type="button"
                                        disabled={typeof this.state.previewPosition !== 'number'}
                                        onClick={() => {
                                            this.setValue(this.inputConfigs.beginSeconds, this.state.previewPosition);
                                            const endConfig = this.inputConfigs.endSeconds;
                                            this.updateValidation(endConfig.ref.current, endConfig.getIsValid)
                                        }}>
                                    <i className="fas fa-map-pin"/>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={`form-group col-md-3 ${isOfTypeVideo ? '' : 'd-none'}`}>
                        <label title="End of the extracted part/frames in seconds">
                            End in seconds
                        </label>
                        <div className="input-group">
                            {this.renderInput(this.inputConfigs.endSeconds)}
                            <div className="input-group-append">
                                <button className="btn btn-secondary" type="button"
                                        disabled={typeof this.state.previewPosition !== 'number'}
                                        onClick={() => this.setValue(this.inputConfigs.endSeconds, this.state.previewPosition)}>
                                    <i className="fas fa-map-pin"/>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={`form-group col-md-3 ${isOfTypeVideo ? '' : 'd-none'}`}>
                        <label title="Frame rate of the extracted part/frames in frames per seconds">
                            Frame rate in Hz
                        </label>
                        {this.renderInput(this.inputConfigs.frameRate)}
                    </div>
                </div>

                <div className="form-group">
                    <div className="custom-control custom-switch"
                         onClick={() => {
                             if (this.props.source.tag) {
                                 this.props.source.tag = null;
                                 this.setState({enableTag: false});
                             } else {
                                 this.props.source.tag = {
                                     text: this.inputConfigs.tagText.ref.current.value,
                                     position: parseInt(this.tagPositionRef.current.value),
                                     maxHeight: parseFloat(this.tagSizeRef.current.value),
                                 };
                                 this.setState({enableTag: true});
                             }
                         }}>
                        <input type="checkbox" className="custom-control-input" readOnly
                               checked={!!this.props.source.tag}/>
                        <label className="custom-control-label">
                            With tag
                        </label>
                    </div>
                </div>
                <div className={`form-row ${this.props.source.tag ? '' : 'd-none'}`}>
                    <div className="form-group col-md-8">
                        <label title="Text added to the GIF">
                            <strong>Text</strong> (*)
                        </label>
                        {this.renderInput(this.inputConfigs.tagText)}
                    </div>
                    <div className="form-group col-md-2">
                        <label title="Text added to the GIF">
                            Position
                        </label>
                        <select ref={this.tagPositionRef} className="form-control" defaultValue={2}
                                onChange={e => {
                                    this.props.source.tag.position = parseInt(e.target.value, 10);
                                    this.setState({lastValidated: e.target.name});
                                }}>
                            <option value={0}>Top</option>
                            <option value={1}>Center</option>
                            <option value={2}>Bottom</option>
                        </select>
                    </div>
                    <div className="form-group col-md-2">
                        <label title="Text added to the GIF">
                            Size
                        </label>
                        <select ref={this.tagSizeRef} className="form-control" defaultValue={0.2}
                                onChange={e => this.props.source.tag.maxHeight = parseFloat(e.target.value)}>
                            <option value={0.1}>Small</option>
                            <option value={0.2}>Middle</option>
                            <option value={0.4}>Large</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    componentWillUnmount() {
        this.fileReader.onload = null;
        this.fileReader.onerror = null;
        this.fileReader.abort();

        if (this.state.fileUrl) URL.revokeObjectURL(this.state.fileUrl);
    }
}