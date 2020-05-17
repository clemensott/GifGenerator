import React from 'react';
import GifListItem from "./GifListItem";
import './GifsList.css'

function groupGifs(gifs) {
    const ratio = 5, minRatio = 4;
    const groups = [];
    let row = null;
    gifs.forEach(gif => {
        gif.ratio = gif.pixelSize.width / gif.pixelSize.height;

        if (!row || Math.abs(row.ratio - ratio) < Math.abs(row.ratio + gif.ratio - ratio)) {
            row = {
                ratio: gif.ratio,
                gifs: [gif],
            };
            groups.push(row);
        } else {
            row.ratio += gif.ratio;
            row.gifs.push(gif);
        }
    })

    if (row && row.ratio < minRatio) {
        row.ratio = minRatio;
    }
    return groups;
}

function renderGifItem(gif, width) {
    return (
        <div key={gif.id} className="gifs-list-column" style={{width: width}}>
            <GifListItem gif={gif}/>
        </div>
    );
}

function renderGifsRow(row) {
    return (
        <div key={row.gifs.map(gif => gif.id).join()} className="gifs-list-row">
            {row.gifs.map(gif => renderGifItem(gif, `${gif.ratio / row.ratio * 100}%`))}
        </div>
    )
}

export default function (props) {
    return groupGifs(props.gifs).map(gifs => renderGifsRow(gifs));
}