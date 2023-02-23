exports.randomNumber = function (length) {
  var text = "";
  var possible = "123456789";
  for (var i = 0; i < length; i++) {
    var sup = Math.floor(Math.random() * possible.length);
    text += i > 0 && sup == i ? "0" : possible.charAt(sup);
  }
  return Number(text);
};

var isNotEmpty = function (object) {
  for (var i in object) {
    return true;
  }
  return false;
};

// hexToUtf8(utf8ToHex("dailyfile.host")) === "dailyfile.host";

var isEqualArray = function (arr1, arr2) {
  // if the other array is a falsy value, return
  if (!arr1 || !arr2) return false;

  // compare lengths - can save a lot of time
  if (arr1.length != arr2.length) return false;

  for (var i = 0, l = arr1.length; i < l; i++) {
    // Check if we have nested arrays
    if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!isEqualArray(arr1[i], arr2[i])) return false;
    } else if (arr1[i] instanceof Object && arr2[i] instanceof Object) {
      /**REQUIRES OBJECT COMPARE**/
      // recurse into another objects
      //console.log("Recursing to compare ", arr1[propName],"with",object2[propName], " both named \""+propName+"\"");
      if (!isEqualObject(arr1[i], arr2[i])) return false;
    } else if (arr1[i] != arr2[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};

var isEqualObject = function (obj1, obj2) {
  //For the first loop, we only check for types
  for (propName in obj1) {
    //Check for inherited methods and properties - like .equals itself
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
    //Return false if the return value is different
    if (obj1.hasOwnProperty(propName) != obj2.hasOwnProperty(propName)) {
      return false;
    }
    //Check instance type
    else if (typeof obj1[propName] != typeof obj2[propName]) {
      //Different types => not equal
      return false;
    }
  }
  //Now a deeper check using other objects property names
  for (propName in obj2) {
    //We must check instances anyway, there may be a property that only exists in obj2
    //I wonder, if remembering the checked values from the first loop would be faster or not
    if (obj1.hasOwnProperty(propName) != obj2.hasOwnProperty(propName)) {
      return false;
    } else if (typeof obj1[propName] != typeof obj2[propName]) {
      return false;
    }
    //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
    if (!obj1.hasOwnProperty(propName)) continue;

    //Now the detail check and recursion

    //obj1 returns the script back to the array comparing
    /**REQUIRES Array.equals**/
    if (obj1[propName] instanceof Array && obj2[propName] instanceof Array) {
      // recurse into the nested arrays
      if (!isEqualArray(obj1[propName], obj2[propName])) return false;
    } else if (
      obj1[propName] instanceof Object &&
      obj2[propName] instanceof Object
    ) {
      // recurse into another objects
      //console.log("Recursing to compare ", obj1[propName],"with",obj2[propName], " both named \""+propName+"\"");
      if (!isEqualObject(obj1[propName], obj2[propName])) return false;
    }
    //Normal value comparison for strings and numbers
    else if (obj1[propName] != obj2[propName]) {
      return false;
    }
  }
  //If everything passed, let's say YES
  return true;
};

module.exports = { isNotEmpty, isEqualArray, isEqualObject };
