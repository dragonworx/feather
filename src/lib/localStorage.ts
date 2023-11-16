/* eslint-disable @typescript-eslint/no-explicit-any */
export function isLocalStorageAvailable(): boolean
{
    try
    {
        const testKey = "__testKey";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e)
    {
        return false;
    }
}

/**
* Reads a value from localStorage and returns it as the specified type.
* @param key The key of the item to read from localStorage.
* @param defaultValue The default value to return if the key is not found.
* @returns The value from localStorage or the default value.
*/
export function readLocalStorageKey<T = any>(key: string, defaultValue?: T): T | undefined
{
    if (!isLocalStorageAvailable())
    {
        return defaultValue;
    }

    try
    {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) as T : defaultValue;
    } catch (e)
    {
        console.error("Error reading from localStorage:", e);
        return defaultValue;
    }
}

/**
     * Writes a value to localStorage.
     * @param key The key under which to store the value.
     * @param value The value to store.
     */
export function writeLocalStorageKey<T = any>(key: string, value: T): void
{
    if (!isLocalStorageAvailable())
    {
        return;
    }

    try
    {
        const item = JSON.stringify(value);
        localStorage.setItem(key, item);
    } catch (e)
    {
        console.error("Error writing to localStorage:", e);
    }
}