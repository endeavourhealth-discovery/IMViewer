export function isArrayHasLength(array: unknown): boolean {
  if (array && Array.isArray(array) && array.length) {
    return true;
  } else {
    return false;
  }
}

export function isObjectHasKeys(object: any, keys: string[]): boolean {
  if (!object) return false;
  if (!(Object.prototype.toString.call(object) === "[object Object]")) return false;
  const objectKeys = Object.keys(object);
  let result = true;
  keys.forEach(key => {
    if (!objectKeys.includes(key)) result = false;
  });
  return result;
}

export function isObject(object: any): boolean {
  if (!object) return false;
  if (!(Object.prototype.toString.call(object) === "[object Object]")) return false;
  let result = true;
  if (!Object.keys(object).length) result = false;
  return result;
}