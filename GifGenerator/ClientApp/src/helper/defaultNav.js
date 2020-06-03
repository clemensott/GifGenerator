export function getLoggedOutNav() {
    return {
        path: {current: 'GIFs'},
        buttons: [{
            classes: 'btn btn-light',
            text: 'Login',
            href: '/login',
        }, {
            classes: 'btn btn-outline-light',
            text: 'Sign up',
            href: '/signup',
        }]
    };
}

export function getLoggedInNav(path, customIcons = []) {
    return {
        customIcons: [
            ...customIcons, {
                title: 'Edit account',
                href: '/account/edit',
                icon: 'fa-user-cog',
            }, {
                title: 'Logout',
                href: '/logout',
                icon: 'fa-sign-in-alt',
            }
        ],
        path,
    };
}