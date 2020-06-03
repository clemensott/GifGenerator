import {swal} from "../components/Swal";
import {app} from "../App";

export default async function addCategory(parentCategoryId) {
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

            this.setState({
                categoryId: parentCategoryId,
            })

            await swal.show({
                title: 'Category added',
                icon: 'fa-check-circle',
                color: 'success',
                buttons: 'Ok',
            });
        } else {
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