const onShowSwalListeners = [];

function addOnShowSwalListener(callback) {
    onShowSwalListeners.push(callback);
}

function removeOnShowSwalListener(callback) {
    const index = onShowSwalListeners.indexOf(callback);
    if (index > -1) {
        onShowSwalListeners.splice(index, 1);
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

        onShowSwalListeners.forEach(listener => {
            listener(swal);
        });

        return swal.promise;
    }
}

function Swal({title, icon, color, text, textSecondary, input, buttons}) {
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


export {
    addOnShowSwalListener,
    removeOnShowSwalListener,
    Swal,
}