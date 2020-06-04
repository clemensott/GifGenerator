import React from 'react';
import AuthStateRoute from "./AuthStateRoute";

export default function (props) {
    return (
        <AuthStateRoute {...props} isPrivate={false} redirectTo="/"/>
    )
}