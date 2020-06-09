import {swal} from "../components/Swal";
import {app} from "../App";

export default async function addCategory(parentCategoryId, page) {
    const parentCategory = app.cache.categories[parentCategoryId];
    const result = await swal.show({
        title: `Add category to: ${parentCategory && parentCategory.name}`,
        icon: 'fa-plus-square',
        text: 'Name:',
        input: {placeholder: 'Enter name'},
        buttons: [{
            type: 'success',
            text: 'Create',
        }, {
            type: 'primary',
            text: 'Cancel',
        }],
    });
    if (result.type !== 'success') return;
    const name = result.value;

    try {
        page.setState({isLoading: true, loadingText: 'Adding category'});
        const url = parentCategoryId ? `/api/category/${parentCategoryId}/create` : '/api/category/create';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(name),
        });

        if (response.ok) {
            const newCategoryId = await response.text();


            app.cache.categories[newCategoryId] = {
                id: newCategoryId,
                name,
                parentId: parentCategoryId
            };

            const category = app.cache.categoryData[parentCategoryId];
            if (category) {
                category.children.push({
                    id: newCategoryId,
                    name,
                });
            }

            page.setState({isLoading: false});
        } else {
            page.setState({isLoading: false});
            console.log(await response.json());
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
}