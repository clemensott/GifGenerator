export default function (categories, categoryId, withLinkToCurrent) {
    let category = categories[categoryId];

    if (!category) return null;

    const path = withLinkToCurrent ? {
        links: [{
            href: `/${category.id}`,
            text: category.name,
        }],
        current: null,
    } : {
        links: [],
        current: category.name,
    }

    while (true) {
        if (!category.parentId && category.parentId !== '') break;

        category = categories[category.parentId];
        if (!category) return null;

        path.links.unshift({
            href: `/${category.id}`,
            text: category.name,
        });
    }

    return path;
}