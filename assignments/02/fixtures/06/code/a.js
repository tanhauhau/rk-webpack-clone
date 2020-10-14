export const a = 'a';
export function sum(a, b) {
  return a + b;
}

console.log('a.js a = ' + a);
console.log('a.js b = ' + b);
console.log('a.js sum = ' + sum(1, 2));
console.log('a.js minus = ' + minus(1, 2));

export const b = 'b';
export function minus(a, b) {
  return a - b;
}
