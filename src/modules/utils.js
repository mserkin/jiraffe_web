export function getEntriesWithValuesStr(obj) {
    console.log('getEntriesWithValuesStr executed')
    if (obj === undefined) {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj !== 'object') {
        return 'is not object';
    }
    console.log('is object!')
    return Object.entries(obj).map(
        ([key, value]) => `  ${key}: ${value}\n`,
    );
} 