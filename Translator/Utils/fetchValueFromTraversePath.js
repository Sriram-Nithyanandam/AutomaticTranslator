const fetchValueFromTraversePath =  (chainingArray, outputJson) => {
  let newOutputJson = outputJson[chainingArray[0]];
  chainingArray.splice(0, 1);
  return chainingArray.length > 0 && newOutputJson ? fetchValueFromTraversePath(chainingArray, newOutputJson) : newOutputJson;
};

module.exports = fetchValueFromTraversePath;
