const cleanUndefined = (obj) => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefined);
  const newObj = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      newObj[key] = cleanUndefined(obj[key]);
    }
  }
  return newObj;
};

console.log(cleanUndefined({a: 1, b: undefined, c: [ { d: undefined, e: 2 } ]}));
