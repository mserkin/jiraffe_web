export function getCustomFilterNames(queryText) {
    const names = new Set();
    const placeholderPattern = /{{([^{}]+)}}/g;
    let match;

    while ((match = placeholderPattern.exec(queryText ?? "")) !== null) {
        const name = match[1].trim();
        if (name) {
            names.add(name);
        }
    }

    return [...names];
}

export function reconcileCustomFilters(queryText, customFilters) {
    const names = getCustomFilterNames(queryText);
    const expectedNames = new Set(names);
    const existingFilters = Array.isArray(customFilters) ? customFilters : [];
    const reconciledFilters = [];
    const existingNames = new Set();

    for (const filter of existingFilters) {
        if (
            !filter?.name ||
            !expectedNames.has(filter.name) ||
            existingNames.has(filter.name)
        ) {
            continue;
        }

        existingNames.add(filter.name);
        reconciledFilters.push({
            name: filter.name,
            value: filter.value ?? "",
        });
    }

    for (const name of names) {
        if (!existingNames.has(name)) {
            reconciledFilters.push({ name, value: "" });
        }
    }

    return reconciledFilters;
}

export function replaceCustomFilterValues(queryText, customFilters) {
    const valuesByName = new Map(
        (Array.isArray(customFilters) ? customFilters : []).map((filter) => [
            filter.name,
            filter.value ?? "",
        ]),
    );

    return String(queryText ?? "").replace(
        /{{([^{}]+)}}/g,
        (placeholder, rawName) => valuesByName.get(rawName.trim()) ?? "",
    );
}
