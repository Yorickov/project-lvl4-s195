export default str =>
  str
    .split(' ')
    .map(item => item.trim())
    .filter(item => item);
