import {swal} from "../components/Swal";
import {app} from "../App";
import React from "react";
import getBase64FromDataUrl from "./getBase64FromDataUrl";
import readDataUrlFromFile from "./readDataUrlFromFile";

function formatFile(file) {
    let size;
    if (file.size < 1000000) size = `${(file.size / 1000.0).toPrecision(3)} KB`;
    else size = `${(file.size / 1000000.0).toPrecision(3)} MB`;
    return `${file.name} (${size})`;
}

export default async function (categoryId, page) {
    const simpleCategory = app.cache.categories[categoryId];
    let file = null;
    const result = await swal.show({
        title: `Upload GIF to: ${simpleCategory && simpleCategory.name}`,
        icon: 'fa-plus-square',
        text: 'File:',
        content: (
            <div className="custom-file">
                <input type="file" className="custom-file-input" accept="image/gif"
                       onChange={e => {
                           const label = document.getElementById('gif-upload-label');
                           if (e.target.files.length) {
                               file = e.target.files[0];
                               if (label) label.innerText = formatFile(file);
                           } else {
                               file = null;
                               if (label) label.innerText = 'Choose file';
                           }
                       }}/>
                <label id="gif-upload-label" className="custom-file-label">
                    {file ? formatFile(file) : 'Choose file'}
                </label>
            </div>
        ),
        buttons: [{
            type: 'success',
            text: 'Upload',
        }, {
            type: 'primary',
            text: 'Cancel',
        }],
    });

    if (result.type !== 'success' || !file) return false;

    try {
        page.setState({isLoading: true, loadingText: 'Uploading GIF'});
        const data = getBase64FromDataUrl(await readDataUrlFromFile(file));
        const response = await fetch(`/api/gif/add/${categoryId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const gif = await response.json();
            app.cache.gifs[gif.id] = gif;

            const categoryData = app.cache.categoryData[gif.categoryId];
            if (categoryData && categoryData.gifs) app.cache.categoryData[gif.categoryId].gifs.push(gif);

            page.setState({isLoading: false});
            return gif;
        } else {
            console.log(await response.json());
            page.setState({isLoading: false});
            await swal.show({
                title: 'Error',
                icon: 'fa-times',
                color: 'danger',
                text: `Status code: ${response.status}`,
                buttons: 'Ok',
            });
        }
    } catch (e) {
        page.setState({isLoading: false});
        console.log(e);
        await swal.show({
            title: 'Exception',
            icon: 'fa-times',
            color: 'danger',
            text: `Status code: ${e.message}`,
            buttons: 'Ok',
        });
    }

    return false;
}