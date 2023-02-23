function isNotEmpty(object) {
  for (var i in object) {
    return true;
  }
  return false;
}

module.exports = { isNotEmpty };
