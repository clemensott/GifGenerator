export default function (dataUrl) {
    const key = ';base64,';
    const index = dataUrl.indexOf(key);
    return dataUrl.substring(index + key.length);
}