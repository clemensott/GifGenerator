import React from 'react';

export default function FormLabel({ text, title, mandetory = false }) {
    if (mandetory) {
        return (
            <label title={title}>
                <strong>{text}</strong> (*)
            </label>
        );
    }
    return (
        <label title={title}>
            {text}
        </label>
    );
}