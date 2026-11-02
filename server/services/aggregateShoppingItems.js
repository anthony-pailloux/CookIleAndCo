// Agrège les ingrédients d'un planning (nom + unité).
// Même nom et même unité : une ligne, quantités numériques additionnées.

// Nombre simple : 3, 3.5 ou 3,5. Pas de texte (« une pincée »).
function isSimpleNumber(value) {
    if (value === null || value === undefined) {
        return false;
    }

    const text = String(value).trim();

    if (text === '') {
        return false;
    }

    return /^\d+([.,]\d+)?$/.test(text);
}

function parseSimpleNumber(value) {
    const text = String(value).trim();
    const normalized = text.replace(',', '.');
    return Number(normalized);
}

// Total en chaîne, virgule si le résultat n'est pas entier.
function formatTotal(total) {
    const rounded = Math.round(total * 1000) / 1000;
    let text;

    if (rounded === Math.trunc(rounded)) {
        text = String(Math.trunc(rounded));
    } else {
        text = String(rounded).replace('.', ',');
    }

    return text;
}

export function aggregateShoppingItems(entries) {
    const groups = {};
    const keysInOrder = [];

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        let ingredients = [];

        if (entry.recipe !== null && entry.recipe !== undefined) {
            if (entry.recipe.ingredients !== null && entry.recipe.ingredients !== undefined) {
                ingredients = entry.recipe.ingredients.slice();
            }
        }

        ingredients.sort(function (firstIngredient, secondIngredient) {
            return firstIngredient.sortOrder - secondIngredient.sortOrder;
        });

        for (let ingredientIndex = 0; ingredientIndex < ingredients.length; ingredientIndex++) {
            const ingredient = ingredients[ingredientIndex];
            let rawName = '';

            if (ingredient.name !== null && ingredient.name !== undefined) {
                rawName = String(ingredient.name);
            }

            const displayName = rawName.trim();

            if (displayName !== '') {
                let unitDisplay = '';

                if (ingredient.unit !== null && ingredient.unit !== undefined) {
                    unitDisplay = String(ingredient.unit).trim();
                }

                const groupKey = displayName.toLowerCase() + '\n' + unitDisplay.toLowerCase();

                if (groups[groupKey] === undefined) {
                    let storedUnit = null;

                    if (unitDisplay !== '') {
                        storedUnit = unitDisplay;
                    }

                    groups[groupKey] = {
                        name: displayName,
                        unit: storedUnit,
                        quantities: [],
                    };
                    keysInOrder.push(groupKey);
                }

                groups[groupKey].quantities.push(ingredient.quantity);
            }
        }
    }

    const items = [];

    for (let keyIndex = 0; keyIndex < keysInOrder.length; keyIndex++) {
        const group = groups[keysInOrder[keyIndex]];
        const item = {
            name: group.name,
            unit: group.unit,
            quantity: null,
        };

        let allNumeric = true;

        if (group.quantities.length === 0) {
            allNumeric = false;
        }

        for (let quantityIndex = 0; quantityIndex < group.quantities.length; quantityIndex++) {
            if (isSimpleNumber(group.quantities[quantityIndex]) === false) {
                allNumeric = false;
            }
        }

        if (allNumeric === true) {
            let total = 0;

            for (let quantityIndex = 0; quantityIndex < group.quantities.length; quantityIndex++) {
                total = total + parseSimpleNumber(group.quantities[quantityIndex]);
            }

            item.quantity = formatTotal(total);
        } else if (group.quantities.length === 1) {
            item.quantity = group.quantities[0];
        } else {
            item.quantity = null;
            item.note = 'quantités à vérifier';
        }

        items.push(item);
    }

    return items;
}
