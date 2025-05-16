function* idGenerator(start = 1) {
  let id = start;
  while (true) {
    yield id++;
  }
}

async function timeoutIterator(iterator, timeoutSec, processFn) {
  const start = Date.now();
  let result = iterator.next();
  while (!result.done && (Date.now() - start) < timeoutSec * 1000) {
    await processFn(result.value);
    result = iterator.next();
  }
}

module.exports = {
  idGenerator,
  timeoutIterator,
}; 