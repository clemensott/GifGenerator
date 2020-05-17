﻿export function getCookieValue(name) {
    return document.cookie.split(";").find(cookie => {
        const pair = cookie.split('=');
        return pair[0].trim() === name && decodeURIComponent(pair[1]);
    })
}

export default {
    getCookieValue,
}