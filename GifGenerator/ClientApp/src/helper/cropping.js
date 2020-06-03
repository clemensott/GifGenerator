function getCropRect(width, height, targetWidth, targetHeight) {
    const targetRatio = targetWidth / targetHeight;
    const ratio = width / height;

    if (targetRatio > ratio) {
        const cropHeight = (width / targetRatio).toFixed(0);
        return {
            x: 0,
            y: ((height - cropHeight) / 2).toFixed(0),
            width,
            height: cropHeight,
        };
    }

    const cropWidth = (height * targetRatio).toFixed(0);
    return {
        x: ((width - cropWidth) / 2).toFixed(0),
        y: 0,
        width: cropWidth,
        height,
    };
}

function getFitRect(width, height, targetWidth, targetHeight) {
    const targetRatio = targetWidth / targetHeight;
    const ratio = width / height;

    if (targetRatio > ratio) {
        const fitWidth = (height * targetRatio).toFixed(0);
        return {
            x: ((width - fitWidth) / 2).toFixed(0),
            y: 0,
            width: fitWidth,
            height,
        };
    }

    const fitHeight = (width / targetRatio).toFixed(0);
    return {
        x: 0,
        y: ((height - fitHeight) / 2).toFixed(0),
        width,
        height: fitHeight,
    };
}

export default {
    getCropRect,
    getFitRect,
}