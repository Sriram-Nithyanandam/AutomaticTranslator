module.exports = (value, obj) => {
  if(obj.constructor !== Object) {
      throw new TypeError('function can only operate on object with Object as constructor');
  }
  var path = [];
  var found = false;

  function search(rootObject) {
      for (var key in rootObject) {
          path.push(key);
          if(typeof(rootObject[key]) === 'string' && rootObject[key].toLowerCase() === value.toLowerCase()) {
              found = true;
              break;
          }
          if(rootObject[key].constructor === Object) {
              search(rootObject[key]);
              if(found) break;
          }
          path.pop();
      }
  }

  search(obj);
  return path;
};
  