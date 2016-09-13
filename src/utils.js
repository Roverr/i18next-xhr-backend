const arr = [];
const each = arr.forEach;

export function defaults(obj, ...args) {
  each.call(args, (source) => {
    if (source === undefined) {
      return;
    }
    for (const prop in source) { // eslint-disable-line no-restricted-syntax
      if (obj[prop] === undefined) {
        obj[prop] = source[prop]; // eslint-disable-line no-param-reassign
      }
    }
  });
  return obj;
}

export function extend(obj, ...args) {
  each.call(args, (source) => {
    if (source === undefined) {
      return;
    }
    /* eslint-disable */
    for (const prop in source) {
      obj[prop] = source[prop];
    }
    /* eslint-enable */
  });
  return obj;
}
