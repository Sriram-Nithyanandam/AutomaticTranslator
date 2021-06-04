const fs = require('fs');

module.exports = (jsonData, filePath) => {
  try {
    const data = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(filePath, data);

    // console.log(`JSON data is saved in path ${filePath}`);
  } catch (error) {
    console.error(error);
  }
};
