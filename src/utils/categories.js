export const categoryLabels = {
    food: 'Food',
    drink: 'Drink',
    event: 'Holidays and Events',
    misc: 'Miscellaneous'
};

export const getCategorizedData = data => {
    const categories = {};

    Object.keys(data).forEach(key => {
        const item = data[key];
        const category = item.category;

        if (!categories[category]) {
            categories[category] = {};
        }

        categories[category][key] = item;
    });

    return categories;
};
