const xlsx = require("xlsx");
const os = require("os");
const path = require("path");

class CommonUtils {
  /**
   * This method load the data from the excel file and assigned it to the data object
   * @param {string} dataFile
   * @returns
   */
  static loadXlsData(dataFile = undefined) {
    let data = [];
    if (dataFile !== undefined) {
      try {
        const file = xlsx.readFile(`./testdata/${dataFile}`);
        const sheets = file.SheetNames;
        for (let i = 0; i < sheets.length; i++) {
          const temp = xlsx.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]]
          );
          temp.forEach((res) => {
            data.push(res);
          });
        }
      } catch (err) {
        console.error(`DataLoader Common.loadXlsData failed ${err.message}`);
      }
    } else console.error("DataFile is undefined");
    if (!data) {
      data = [];
      console.error("Data is empty");
    }
    return data;
  }

  /**
   * This method filter the testcase data according to the test case Id
   * @param {object} xlsData
   * @param {string} testCaseId
   * @returns the testcase data set
   */
  static filterAndLoadTestCaseData(xlsData, testCaseId) {
    //filter the row of records according to the testcase Id passed
    const testcaseDataArray = xlsData.filter(
      (testData) => testData.TCID == testCaseId
    );
    let testCaseData = JSON.parse(JSON.stringify(testcaseDataArray));
    if (testCaseData.length < 1)
      console.error(
        `There is no test data available for the testcase ID ${testCaseId}`
      );
    return testCaseData;
  }

  /**
   * This method filter the testcase data according to the module name for prerequisite
   * @param {object} xlsData
   * @param {string} testCaseId
   * @returns the testcase data set
   */
  static filterAndLoadTestCaseDataByModuleName(xlsData, moduleName) {
    //filter the row of records according to the testcase Id passed
    const testcaseDataArray = xlsData.filter(
      (testData) => testData.moduleName == moduleName
    );
    let testCaseData = JSON.parse(JSON.stringify(testcaseDataArray));
    if (testCaseData.length < 1)
      console.error(
        `There is no test data available for the module name ${moduleName}`
      );
    return testCaseData;
  }

  /**
   * This method filter the requestbody data according to the API name for prerequisite
   * @param {object} xlsData
   * @param {string} apiName
   * @returns the testcase data set
   */
  static filterAndLoadTestCaseDataByApiName(xlsData, apiName) {
    //filter the row of records according to the API name passed
    const testcaseDataArray = xlsData.filter(
      (testData) => testData.apiName == apiName
    );
    let requestBodyData = JSON.parse(JSON.stringify(testcaseDataArray));
    if (requestBodyData.length < 1)
      console.error(`There is no test data available for the API ${apiName}`);
    return requestBodyData;
  }

  /**
   * This method used to get the download path for current system
   */
  static getDownloadPath() {
    const platform = os.platform();
    if (platform === "win32") {
      // Windows
      return path.join(os.homedir(), "Downloads");
    } else if (platform === "linux") {
      // Linux
      return path.join(os.homedir(), "Downloads");
    } else {
      // Handle other platforms if necessary
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  /**
   * This method is used to Verify Header format of Excel sheet
   * @param {object} data
   * @param {object} expectedHeaderValues
   */
  static verifyExcelSheetHeader(data, expectedHeaderValues) {
    const workbook = xlsx.readFile(data.fileName);
    let workSheet = "";
    let sheetName = "";
    if (data.sheetName) {
      workSheet = workbook.Sheets[`${data.sheetName}`];
    } else {
      sheetName = workbook.SheetNames[0]; //Getting first sheet name
      workSheet = workbook.Sheets[sheetName];
    }
    const firstRow = xlsx.utils.sheet_to_json(workSheet, {
      header: 1,
      range: 0,
      raw: false,
    })[0];
    const result = firstRow.every(
      (val, index) => val === expectedHeaderValues[index]
    );
    return result;
  }

  /**
   * This method converts the data present in sheet to json object [Key value pair]
   * @param {object} data filename, sheet name should be passed
   */
  static convertSheetDataIntoJson(newUpdatedFile, sheetName) {
    const workbook = xlsx.readFile(newUpdatedFile);
    const workSheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(workSheet, { header: 1 });
    const headers = jsonData[0];
    const sheetdata = jsonData.slice(1);
    const result = sheetdata.map((row) => {
      const obj = {};
      row.forEach((value, index) => {
        const header = headers[index];
        obj[header] = value;
      });
      return obj;
    });
    return result;
  }
  /**
   * Returns total number of rows of data present in sheet
   * @param {object} data
   * @returns count of rows present
   */
  static getTotalCountOfRowDataPresentInSheet(data) {
    const workbook = xlsx.readFile(
      constantsPage.testDataPath +
        constantsPage.stringConstants.forwardSlash +
        data.renamedFile
    );
    const sheetName = workbook.SheetNames[0];
    // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const range = xlsx.utils.decode_range(worksheet["!ref"]);
    const rowCount = range.e.r;
    return rowCount;
  }

  /**
   * This method load the data from particular sheet in Excel file and assign to the data object
   * @param {object} defaultData - default data
   * @param {string} dataFile - excel file
   * @param {string} sheetName - worksheet name
   * @returns
   */
  static loadXlsDataBySheetName(dataFile = undefined, sheetName = "Sheet1") {
    let data;
    let defaultData = [];
    if (process.env.DATA_FROM_FILE) {
      if (dataFile !== undefined) {
        try {
          const workBook = xlsx.readFile(`./testdata/${dataFile}`);
          const workSheet = workBook.Sheets[`${sheetName}`];
          data = xlsx.utils.sheet_to_json(workSheet);
        } catch (err) {
          console.error(
            `DataLoader Common.loadXlsDataBySheetName failed ${err.message}`
          );
        }
      } else {
        console.error("DataLoader dataFile is undefined");
      }
    } else {
      data = defaultData;
    }
    if (!data) {
      data = [];
      console.error("DataLoader data is empty");
    }
    return data;
  }

  /* This method is used to filter mail based on type of operation
   * @param {Json object} data
   * @param {string} type type of operation
   * @returns
   */
  static filterMail(data, type) {
    let mail = data.filter((mailContent) => mailContent.message.type === type);
    return mail;
  }

  /**
   * This method used to convert the particular column data into json format
   * @param {object} data
   * @param {string} key
   * @returns data in json format
   */
  static convertColumnDataToJson(data, key) {
    let dataValues = Object.values(data);
    let dataKeys = Object.keys(data);
    for (let i = 0; i < dataValues.length; i++) {
      //check whether the testcase data has "{" and parse the data into Json
      if (dataKeys[i].trim() == key)
        if (dataValues[i].toString().indexOf("{") != -1) {
          let jsonData = JSON.parse(dataValues[i]);
          return jsonData;
        }
    }
    console.error(
      `There is no column named "${key}" or the column data is not in json format`
    );
  }
}

module.exports = CommonUtils;
