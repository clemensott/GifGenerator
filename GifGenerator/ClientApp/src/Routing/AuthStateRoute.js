import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {getCookieValue} from "../helper/cookies";

export default function ({isPrivate, component: Component, redirectTo, ...rest}) {
    const authToken = getCookieValue('auth');
    if ((authToken && !isPrivate) || (authToken && !isPrivate)) {
        console.log('auth redirect to:', redirectTo);
        return (
            <Redirect to={redirectTo}/>
        )
    }
    return (
        <Route {...rest} render={(props) => (
            <Component {...props} />
        )}
        />
    );
}