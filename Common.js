const { I, constantsPage } = inject();
const assert = require("assert");
var mailclient = require("../util/mailclient/mailclient");
const CommonUtils = require("../util/CommonUtils");
const path = require("path");
const fs = require("fs");

module.exports = {
  constants: {
    downloadWaitTime: 5,
  },
  locators: {
    popup: "//div[@role = 'dialog']",
    dropDownOptionLocator:
      "//div[contains(@id,'listbox')]//div[contains(@id,'option')]",
    // "//div[contains(@class,'menu')]//div[contains(@class,'option')]",

    calendar: {
      //used in adminCreateCustomerPage module
      selectionDate: "//p[text()='Selection Date']/..//input[@value]",
      chooseDateButton: "//div/button[@aria-label='Choose date']",
      previousMonthButtonDisabled:
        "//button[@aria-label='Previous month' and @disabled]",
      nextMonthButton: "//button[@aria-label='Next month']",
      previousMonthButton: "//button[@aria-label='Previous month']",
      nextMonthButtonDisabled:
        "//button[@aria-label='Next month' and @disabled]",
    },
  },
  regEx: {
    alphabetRegEx: "[a-zA-Z]+",
    alphaNumeric: "^[A-Za-z0-9]*$",
    alphabhetAndSpecialChar: '/^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/',
    atleastOneSpaceWithAlphabets: "^[a-zA-Z]+(s[a-zA-Z]+)?$",
    atSymbolInWords: "at|AT|aT|At",
    anyCharactersWithoutSpace: "^S+$",
    containsUpperCase: ".*[A-Z].*",
    containsLowerCase: ".*[a-z].*",
    containsNumber: ".*[0-9].*",
    containsSpace: /.*\s.*/, //".*[ ].*",
    containsAllowedSpecialCharInPassword: ".*[!@^*+()_=,.?-].*", //!@^*+()_=,.?-
    dateRegEx: "/^(?:d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/",
    emailRegEx: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    emailWithoutDot: "^[^@]+@[^.]+$",
    emailWithoutAtSymbol: "^[^@]+$",
    emailWithoutAtSymbolAndDot: "^[a-zA-Z0-9! #$%&'*+=? ^_`{|}~-]",
    numberRegEx: "^[0-9]+$",
    numbersAndSpecialChar: "[-+]?[0-9,$%.,@#^&*()~+-]+",
    onlySpace: "^[ ]+$",
    onlySpecialChar: "(?=.*[+_ !@#$%^&*.,?'-/=:}])",
    onlyZeros: "^[0]+$",
    regExpSpecialChar: "(?=.*[+_!@#$%^&*.,?])",
    regExpAlphaNumericSpace_AndSpecialChar:
      "^(?!d+$)(?:[a-zA-Z0-9][a-zA-Z0-9 @&$*()%#!*+-~]*)?$",
    regExAlphaSpaceAndSpecialChar:
      "^[A-Za-z! @#$%^&*()_+[]{}|';:\"\\<,>.?/~`]+$",
    regExpIsUpper: "[A-Z]",
    regExpIsLower: "[a-z]",
    regExWithOnlyZero: "^0*$",
    singleCharacter: "^[^a-z]*([a-z])[^a-z]*$",
    url: "^(https?|ftp)://[a-zA-Z0-9-]+(.[a-zA-Z]{2,})+(/[^s]*)?$",
    validPassword:
      "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@^*+()_=,.?-])(?=\\S+$).{8,10}$",
    website: "^(http://|https://)?([a-z0-9][a-z0-9-]*.)+[a-z0-9][a-z0-9-]*$",
  },

  /**
   * This method check the input value matches with the regular expression and returns true or false
   * @param {string} value
   * @param {string} regEx
   * @returns boolean
   */
  async verifyRegEx(value, regEx) {
    let regExp = new RegExp(regEx);
    // return value.match(regEx);
    return regExp.test(value);
  },

  /**
   *This method validates empty field
   * @param {string} field
   * @param {string} errorMessage
   */
  async validateEmptyField(field, errorMessage) {
    await I.clickElement(field);
    await I.shiftFocus();
    await I.isErrorMessageDisplayed(errorMessage);
  },

  /**
   * This method verifies expected message is displayed against the input
   * @param {string} inputFieldErrorMessageLocator
   * @param {string} expectedErrorMessage
   */
  async errorMessageValidation(
    inputFieldErrorMessageLocator,
    expectedErrorMessage
  ) {
    let errorOnLocator = "";
    //When no error message is expected
    if (expectedErrorMessage == constantsPage.stringConstants.emptyString) {
      //verify presence of error message locator
      if (
        await tryTo(() =>
          I.waitForElement(
            inputFieldErrorMessageLocator,
            constantsPage.waitTime.VERIFY_WAIT_TIME
          )
        )
      ) {
        //Grab the displayed error message for valid data
        errorOnLocator = await I.grabTextFrom(inputFieldErrorMessageLocator);
        assert.fail(
          `Error message should not be displayed for valid data, but displayed error message is "${errorOnLocator}" `
        );
      }
    }
    //Verify presence of expected error message
    else if (
      await tryTo(() =>
        I.waitForElement(
          inputFieldErrorMessageLocator,
          constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
        )
      )
    ) {
      //Grab the displayed error message for invalid data
      errorOnLocator = await I.grabTextFrom(inputFieldErrorMessageLocator);
      assert.ok(
        errorOnLocator === expectedErrorMessage,
        `Expected Error message for the input data set for the scenario is "${expectedErrorMessage}", but displayed error message is "${errorOnLocator}"`
      );
    } else
      assert.fail(
        `Expected Error message "${expectedErrorMessage}" is not displayed for invalid input data`
      );
    await I.addMochawesomeContext(
      `\nExpected Message : ${expectedErrorMessage} \nDisplayed Message: ${errorOnLocator}`
    );
  },

  /**
   * This method verifies the presence of associative array of locators
   * @param {object} elements
   */
  async verifyPresenceOfElements(locatorsArray) {
    let values = Object.values(locatorsArray);
    for (let value of values) await I.isElementAvailable(value);
  },

  /**
   * This method verifies the presence of associative array of labels
   * @param {object} labels
   */
  async verifyPresenceOfLabels(labelsArray) {
    let values = Object.values(labelsArray);
    for (let value of values) await I.isTextDisplayed(value);
  },

  /**
   * This method verifies the absence of associative array of labels
   * @param {object} labels
   */
  async verifyAbsenceOfLabels(labelsArray) {
    let values = Object.values(labelsArray);
    for (let value of values) await I.dontSee(value);
  },

  /**
   * This method is used to randomly pick elements from an array
   * @param {array} array
   * @returns randomly selected element
   */
  async selectRandomElementFromArray(array) {
    let i = Math.floor(Math.random() * array.length);
    let element = array[i];
    return element;
  },

  /**
   * Selects random values from drop down
   * @param {string} fieldLocator locator of dropdown field
   * @returns newly selected value from list
   */
  async selectRandomValueFromDropdown(
    fieldLocator,
    dropDownList = this.locators.dropDownOptionLocator
  ) {
    await I.isElementAvailable(fieldLocator);
    await I.clickElement(fieldLocator);
    await I.isElementAvailable(dropDownList);
    let valueList = await I.grabTextFromAll(dropDownList);
    if (valueList.length == constantsPage.numericalConstants.zero) {
      assert.fail("No options displayed from the drop down");
    }
    let newValue = await this.selectRandomElementFromArray(valueList);
    await I.clickElement(`//div[text()='${newValue}']`);
    return newValue;
  },

  /**
   * Selects multiple random values from drop down
   * @param {string} dropdownLocator locator of dropdown field
   * @param {string} dropdownListLocator locator of dropdownList options
   * @param {string} numOfElements
   * @returns newly selected values from list
   */
  async selectMultiRandomValuesFromDropdown(
    dropdownLocator,
    dropdownListLocator,
    numOfElements
  ) {
    await I.isElementAvailable(dropdownLocator);
    await I.clickElement(dropdownLocator);
    await I.isElementAvailable(dropdownListLocator);
    let valueList = await I.grabTextFromAll(dropdownListLocator);
    if (valueList.length == constantsPage.numericalConstants.zero) {
      assert.fail("No options displayed from the drop down");
    }

    let grabbedValues = [];
    //Grab all text from the dropdown list
    grabbedValues = await I.grabTextFromAll(dropdownListLocator);
    //Generate random indices to select the random dropdown list
    let randomElements = [];
    for (let i = 0; i < numOfElements; i++) {
      let randomIndex = Math.floor(Math.random() * grabbedValues.length);
      let listValues = grabbedValues[randomIndex];
      randomElements.push(listValues);
    }
    for (value of randomElements) {
      await I.isElementAvailable(
        `//div/ul[contains(@id,'listbox')]/li[text()='${value}']`
      );
      await I.clickElement(
        `//div/ul[contains(@id,'listbox')]/li[text()='${value}']`
      );
      await I.clickElement(dropdownLocator);
    }

    await I.addMochawesomeContext(
      `Dropdown options : ${randomElements} are selected`
    );
    return randomElements;
  },

  /**
   * This method returns todays date in a format "YYYY-MM-DD"
   * @returns _date(YYYY-MM-DD)
   */
  async getTodaysDate() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let day = String(today.getDate()).padStart(2, "0");

    let dateString = `${year}-${month}-${day}`;
    return dateString;
  },

  /**
   * This method used to get the today date with format dd-mm-yyyy
   * @returns
   */
  async getTodaysDateInDateMonthYearFormat() {
    let date = new Date();
    let getYear = date.toLocaleString("default", { year: "numeric" });
    let getMonth = date.toLocaleString("default", { month: "2-digit" });
    let getDay = date.toLocaleString("default", { day: "2-digit" });
    let today = getDay + "-" + getMonth + "-" + getYear;
    return today;
  },

  /**
   * This method used to get the today date with format mm-dd-yy
   * @returns
   */
  async getTodaysDateInMonthDateYearFormat() {
    let date = new Date();
    let getYear = date.toLocaleString("default", { year: "2-digit" });
    let getMonth = date.toLocaleString("default", { month: "2-digit" });
    let getDay = date.toLocaleString("default", { day: "2-digit" });
    let today = getMonth + "-" + getDay + "-" + getYear;

    return today;
  },

  /**
   * This method used to get the yesterday date with format yyyy-mm-dd
   * @returns
   */
  async getYesterdayDate() {
    let today = new Date();
    let yesterday1 = today.setDate(today.getDate() - 1);
    let getYear = today.toLocaleString("default", { year: "numeric" });
    let getMonth = today.toLocaleString("default", { month: "2-digit" });
    let getDay = today.toLocaleString("default", { day: "2-digit" });
    let yesterday = getYear + "-" + getMonth + "-" + getDay;
    return yesterday;
  },

  /**
   * This method used to get future date (1 day after current date) with format yyyy-mm-dd
   * @returns
   */
  async getFutureDate(noOfdays = 1) {
    let today = new Date();
    today.setDate(today.getDate() + noOfdays);
    let getYear = today.toLocaleString("default", { year: "numeric" });
    let getMonth = today.toLocaleString("default", { month: "2-digit" });
    let getDay = today.toLocaleString("default", { day: "2-digit" });

    let futureDate = getYear + "-" + getMonth + "-" + getDay;
    return futureDate;
  },

  /**
   * This method used to get very past date with format yyyy-mm-dd
   * @returns
   */
  async getPastDate(noOfYears = 2) {
    let today = new Date();
    today.setFullYear(today.getFullYear() - noOfYears);
    let getYear = today.toLocaleString("default", { year: "numeric" });
    let getMonth = today.toLocaleString("default", { month: "2-digit" });
    let getDay = today.toLocaleString("default", { day: "2-digit" });
    let pastDate = getYear + "-" + getMonth + "-" + getDay;
    return pastDate;
  },

  /**
   * This method used to get future date with format dd-mm-yyyy
   * @returns
   */
  async getFutureDateInDateMonthYearFormat(noOfdays = 100) {
    let today = new Date();
    today.setDate(today.getDate() + noOfdays);
    let getYear = today.toLocaleString("default", { year: "numeric" });
    let getMonth = today.toLocaleString("default", { month: "2-digit" });
    let getDay = today.toLocaleString("default", { day: "2-digit" });
    let futureDate = getDay + "-" + getMonth + "-" + getYear;
    return futureDate;
  },

  /**
   * This method used to get very past date with format dd-mm-yyyy
   * @returns
   */
  async getPastDateInDateMonthYearFormat(noOfYears = 2) {
    let today = new Date();
    today.setFullYear(today.getFullYear() - noOfYears);
    let getYear = today.toLocaleString("default", { year: "numeric" });
    let getMonth = today.toLocaleString("default", { month: "2-digit" });
    let getDay = today.toLocaleString("default", { day: "2-digit" });
    let pastDate = getDay + "-" + getMonth + "-" + getYear;
    return pastDate;
  },

  /**
   * This method used to get after 30 days date from current date with format dd-mm-yyyy format
   * @returns
   */
  async getAfterThirtyDaysDateFromCurrentDate() {
    let today = new Date();
    let lastMonth = today.setDate(today.getDate() + 30);
    let getYear = today.toLocaleString("default", { year: "numeric" });
    let getMonth = today.toLocaleString("default", { month: "2-digit" });
    let getDay = today.toLocaleString("default", { day: "2-digit" });
    let date = getDay + "-" + getMonth + "-" + getYear;
    return date;
  },

  /**
   * This method used to get the future date with format mm-dd-yy
   * @returns
   */
  async getFutureDateInMonthDateYearFormat(noOfdays = 100) {
    let today = new Date();
    today.setDate(today.getDate() + noOfdays);
    let getYear = today.toLocaleString("default", { year: "2-digit" });
    let getMonth = today.toLocaleString("default", { month: "2-digit" });
    let getDay = today.toLocaleString("default", { day: "2-digit" });
    let futureDate = getMonth + "-" + getDay + "-" + getYear;

    return futureDate;
  },

  /**
   * This method check the input value matches with the regular expression and returns true or false
   * @param {string} value
   * @param {string} regEx
   * @returns boolean
   */
  async verifyRegEx(value, regEx) {
    let regExp = new RegExp(regEx);
    // return value.match(regEx);
    return regExp.test(value);
  },

  /**
   * This method returns todays date time in a partiular format to be appended to unique identifiers
   * @returns Date_time
   */
  async getTodaysDateTime() {
    // Get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const hour = String(today.getHours()).padStart(2, "0");
    const minute = String(today.getMinutes()).padStart(2, "0");
    const second = String(today.getSeconds()).padStart(2, "0");

    return `_${year}${month}${day}_${hour}${minute}${second}`;
  },

  /**
   * This method returns todays date time in a partiular format "DD-MM-YYYY HH:MM:SS"
   * @returns Date_time
   */
  async getPresentDateAndTime() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const hour = String(today.getHours()).padStart(2, "0");
    const minute = String(today.getMinutes()).padStart(2, "0");
    const second = String(today.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
  },

  /**
   * This method returns current month(name) in string and year yyyy
   * @returns _date(MMDDYYYY)
   */
  async getCurrentAndNextMonthYear() {
    let monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    // get current month and year
    let today = new Date();
    let currentMonth = monthNames[today.getMonth()];
    let currentYear = today.getFullYear();
    let currentMonthYear = `${currentMonth} ${currentYear}`;

    // Get next month and year
    let presentMonth = today.getMonth();
    let presentYear = today.getFullYear();

    // Calculate the next month
    let nextMonth = (presentMonth + 1) % 12;

    // If the next month is January, increment the year
    if (nextMonth === 0) {
      presentYear++;
    }

    // Create a new Date object for the next month
    let nextMonthAndYear = new Date(presentYear, nextMonth);

    let nextMonthYear = nextMonthAndYear.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    return { currentMonthYear, nextMonthYear };
  },

  /**
   * This method returns todays date in a format "MMDDYYYY"
   * @returns _date(MMDDYYYY)
   */
  async getTodaysDateInMmDdYyyyFormat() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let day = String(today.getDate()).padStart(2, "0");

    let dateString = `${month}/${day}/${year}`;
    return dateString;
  },

  /**
   * This method used to get after 30 days date from current date with format mm/dd/yyyy format
   * @returns
   */
  async getAfterThirtyDaysDateFromCurrentDateInMmDdYyyyFormat() {
    let today = new Date();
    let lastMonth = today.setDate(today.getDate() + 30);
    let getYear = today.toLocaleString("default", { year: "numeric" });
    let getMonth = today.toLocaleString("default", { month: "2-digit" });
    let getDay = today.toLocaleString("default", { day: "2-digit" });
    let date = getMonth + "/" + getDay + "/" + getYear;
    return date;
  },

  /**
   * This method generate random String
   * @param {string} number
   * @returns
   */
  async generateRandomString(number) {
    let randomString = "";
    for (let i = 0; i < number; i++) {
      const randomIndex = Math.floor(Math.random() * 52); // 26 lowercase + 26 uppercase letters
      if (randomIndex < 26) {
        // Use lowercase letters for indices 0 to 25
        randomString += String.fromCharCode("a".charCodeAt(0) + randomIndex);
      } else {
        // Use uppercase letters for indices 26 to 51
        randomString += String.fromCharCode(
          "A".charCodeAt(0) + randomIndex - 26
        );
      }
    }
    return randomString;
  },

  /**
   * This method returns a random date within the next 30 days of the current date in the format dd-mmm-yyyy
   * @returns {string} Random date in the format dd-mmm-yyyy
   */
  async getRandomFutureDateWithinNext30Days() {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get the current date
    let today = new Date();

    // Generate a random number of days within the 30-day range (1 to 30)
    let randomDays = Math.floor(Math.random() * 30) + 1;

    // Adjust the date by adding the random number of days
    today.setDate(today.getDate() + randomDays);

    // Format the date components
    let getDay = today.toLocaleString("default", { day: "2-digit" });
    let getMonth = months[today.getMonth()];
    let getYear = today.toLocaleString("default", { year: "numeric" });

    // Concatenate the components to form the date string
    let randomFutureDate = `${getDay}-${getMonth}-${getYear}`;

    return randomFutureDate;
  },

  //----------------------------------------Calendar method-----------------------------------------------------------------------------------//

  /**
   * This method is used to select current date from calendar- for the format MM/DD/YYYY
   */
  async selectCurrentDateFromCalendar() {
    //Selection Date input
    await I.isElementAvailable(this.locators.calendar.selectionDate);

    //Selection Date-calendar icon
    await I.isElementAvailable(this.locators.calendar.chooseDateButton);

    //click calendar icon
    await I.clickElement(this.locators.calendar.chooseDateButton);

    //verify calendar displaying current month and year
    let displayMonthYearDetails = await this.getCurrentAndNextMonthYear();
    let currentMonthYear = displayMonthYearDetails.currentMonthYear;

    console.log(currentMonthYear);
    await I.waitForElement(
      `//div[contains(@class, 'MuiPickersCalendarHeader-label') and text()='${currentMonthYear}']`,
      constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
    );

    //Verify previous month button is disabled
    // await I.isElementAvailable(
    //   this.locators.calendar.previousMonthButtonDisabled
    // );

    //TODO: exception handling here for previous month button and next month button enable disbale check if 30 days falls in one month

    //Verify current date is available in the calendar
    let todayDate = await this.getTodaysDate();
    let presentDate = todayDate.split("-");
    await I.isElementAvailable(
      `//div[contains(@class,'MuiDayCalendar-weekContainer')]//button[text()='${presentDate[2]}']`
    );

    //Click the current date in the calendar
    await I.clickElement(
      `//div[contains(@class,'MuiDayCalendar-weekContainer')]//button[text()='${presentDate[2]}']`
    );

    //Verify selected date is available in the Selection Date input
    let selectionDate = await this.getTodaysDateInMmDdYyyyFormat();
    await I.isElementAvailable(
      `//p[text()='Selection Date']/..//input[@value='${selectionDate}']`
    );

    //grab the selected date from the Selection Date input
    let selectedDate = await I.grabValueFrom(
      this.locators.calendar.selectionDate
    );

    //Verify selected date is present date or not
    let selectedDate1 = selectedDate.split("/");
    if (
      selectedDate1[0] == presentDate[1] &&
      selectedDate1[1] == presentDate[2] &&
      selectedDate1[2] == presentDate[0]
    ) {
      await I.addMochawesomeContext("Admin able to select the present date");
    } else assert.fail("Admin not able to select the present date");
  },

  /**
   * This method is used to select future date from calendar
   */
  async selectFutureDateFromCalendar() {
    //Selection Date input
    await I.isElementAvailable(this.locators.calendar.selectionDate);

    //Selection Date-calendar icon
    await I.isElementAvailable(this.locators.calendar.chooseDateButton);

    //click calendar icon
    await I.clickElement(this.locators.calendar.chooseDateButton);

    //Next month button
    await I.isElementAvailable(this.locators.calendar.nextMonthButton);

    //Click on next month button
    await I.clickElement(this.locators.calendar.nextMonthButton);

    //TODO: exception handling here for previous month button and next month button enable disbale check if 30 days falls in one month

    //verify calendar displaying next montth and year
    let displayMonthYearDetails = await this.getCurrentAndNextMonthYear();

    let nextMonthYear = displayMonthYearDetails.nextMonthYear;

    await I.waitForElement(
      `//div[contains(@class, 'MuiPickersCalendarHeader-label') and text()='${nextMonthYear}']`,
      constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
    );

    //verify previous month button is enabled
    // await I.isElementEnabled(
    //   this.locators.calendar.previousMonthButton
    // );

    //verify next month button is disabled
    // await I.isElementAvailable(
    //   this.locators.calendar.nextMonthButtonDisabled
    // );

    //verify future date is available in the calendar
    let futureDate = await this.getAfterThirtyDaysDateFromCurrentDate(); //dd-mm-yyyy
    let nextMonthDate = futureDate.split("-");
    await I.isElementAvailable(
      `//div[contains(@class,'MuiDayCalendar-weekContainer')]//button[text()='${nextMonthDate[0]}']`
    );

    //Click the future date in the calendar
    await I.clickElement(
      `//div[contains(@class,'MuiDayCalendar-weekContainer')]//button[text()='${nextMonthDate[0]}']`
    );

    //Verify selected future date is available in the Selection Date input
    let invoiceFutureDate =
      await this.getAfterThirtyDaysDateFromCurrentDateInMmDdYyyyFormat();
    await I.isElementAvailable(
      `//p[text()='Selection Date']/..//input[@value='${invoiceFutureDate}']`
    );

    //grab the selected future date from the Selection Date input
    let selectedFutureDate = await I.grabValueFrom(
      this.locators.calendar.selectionDate
    );

    //Verify selected date is present date or not- mm/dd/yyyy
    let selectedFutureDate1 = selectedFutureDate.split("/");
    if (
      selectedFutureDate1[0] == nextMonthDate[1] &&
      selectedFutureDate1[1] == nextMonthDate[0] &&
      selectedFutureDate1[2] == nextMonthDate[2]
    ) {
      await I.addMochawesomeContext("Admin able to select the future date");
    } else assert.fail("Admin not able to select the future date");
  },

  /////////////////////// MAIL RELATED METHODS START ------------------------------------------------
  //-------------------------------------------------------------------------------------------------

  /**
   * This method retrives and returns recruiter activation url from email
   * @returns String - URL
   */
  async fetchRecruiterActivationUrlFromEmail(email) {
    await I.wait(constantsPage.waitTime.EMAIL_WAIT_TIME);
    let mail = await this.getEmailData("RECRUITER_SIGNUP_ACTIVATION", email);
    if (mail === false) {
      await I.addMochawesomeContext(
        `The RECRUITER_SIGNUP_ACTIVATION mails are not received for this email ${email}`
      );
      return false;
    } else {
      await I.addMochawesomeContext(
        `The RECRUITER_SIGNUP_ACTIVATION mail received and its parameters are ${JSON.stringify(
          mail.parameters
        )}`
      );
      return mail.parameters.url;
    }
  },

  /**
   * This method retrives and returns recruiter activation url from email
   * @returns String - URL
   */
  async fetchAddRecruiterActivationUrlFromEmail(email) {
    await I.wait(constantsPage.waitTime.EMAIL_WAIT_TIME);
    let mail = await this.getEmailData("ADD_RECRUITER", email);
    if (mail === false) {
      await I.addMochawesomeContext(
        `The ADD_RECRUITER mails are not received for this email ${email}`
      );
      return false;
    } else {
      await I.addMochawesomeContext(
        `The ADD_RECRUITER mail received and its parameters are ${JSON.stringify(
          mail.parameters
        )}`
      );
      return mail.parameters.url;
    }
  },

  /**
   * This method retrives and returns recruiter forgot password url from email
   * @returns String - URL
   */
  async fetchRecruiterForgotPasswordUrlFromEmail(email) {
    await I.wait(constantsPage.waitTime.EMAIL_WAIT_TIME);
    let mail = await this.getEmailData("FORGOT_PASSWORD", email);
    if (mail === false) {
      await I.addMochawesomeContext(
        `The Recruiter FORGOT_PASSWORD mails are not received for this email ${email}`
      );
      return false;
    } else {
      await I.addMochawesomeContext(
        `The RECRUITER FORGOT_PASSWORD mail received and its parameters are ${JSON.stringify(
          mail.parameters
        )}`
      );
      return mail.parameters.url;
    }
  },

  /**
   * This method retrives recruiter profile update email
   * @returns String - URL
   */
  async fetchRecruiterProfileUpdateEmail(email) {
    await I.wait(constantsPage.waitTime.EMAIL_WAIT_TIME);
    let mail = await this.getEmailData("RECRUITER_UPDATE", email);
    if (mail === false) {
      await I.addMochawesomeContext(
        `The RECRUITER_UPDATE mails are not received for this email ${email}`
      );
      return false;
    } else {
      await I.addMochawesomeContext(
        `The RECRUITER_UPDATE mail received for email ${email} and its parameters are ${JSON.stringify(
          mail.parameters
        )}`
      );
      return mail.parameters.name;
    }
  },

  /**
   * This method retrives recruiter JD assignment email
   * @returns String - URL
   */
  async fetchRecruiterJDAssignmentEmail(email) {
    await I.wait(constantsPage.waitTime.EMAIL_WAIT_TIME);
    let mail = await this.getEmailData("JD_ASSIGNMENT", email);
    if (mail === false) {
      await I.addMochawesomeContext(
        `The JD_ASSIGNMENT mails are not received for this email ${email}`
      );
      return false;
    } else {
      await I.addMochawesomeContext(
        `The JD_ASSIGNMENT mail received for email ${email} and its parameters are ${JSON.stringify(
          mail.parameters
        )}`
      );
      return mail.parameters.name;
    }
  },

  /**
   * This method retrives and returns candidate forgot password url from email
   * @returns String - URL
   */
  async fetchCandidateForgotPasswordUrlFromEmail(email) {
    await I.wait(constantsPage.waitTime.EMAIL_WAIT_TIME);
    let mail = await this.getEmailData("FORGOT_PASSWORD", email);
    if (mail === false) {
      await I.addMochawesomeContext(
        `The CANDIDATE FORGOT_PASSWORD mails are not received for this email ${email}`
      );
      return false;
    } else {
      await I.addMochawesomeContext(
        `The CANDIDATE FORGOT_PASSWORD mail received and its parameters are ${JSON.stringify(
          mail.parameters
        )}`
      );
      return mail.parameters.url;
    }
  },

  /**
   * This method is used to get the latest email data of given username and type of email and mark as read.
   * @param {string} type Type of Email generated.
   * @param {string} readFlag Flag to mark the mail to read or unread
   */
  async getEmailData(type, email, readFlag = true) {
    let data = await mailclient.getMessages(type, email);
    //console.log("data: ", data); // For Testing
    //console.log("Data.messages: \n", data.messages[0]);
    if (data) {
      if (data == "invalid_grant") {
        assert.fail(
          "Invalid Grant : Refresh Token error received. GMail access token expired and needs to be regenerated. "
        );
      } else {
        let mail = CommonUtils.filterMail(data.messages, type);
        //console.log(mail);
        if (readFlag) {
          mailclient.markMessageAsRead(data.auth, data.messages[0].id);
        }
        return mail[0].message;
      }
    } else return false;
  },

  /**
   * This method used to generate unique email
   * @param {string} email
   * @returns
   */
  async generateUniqueEmail(email) {
    let splitEmail = email.split("@");
    let newEmail =
      splitEmail[0] + (await this.getTodaysDateTime()) + "@" + splitEmail[1];
    return newEmail;
  },

  /**
   * This method retrives and returns verification OTP from email
   * @returns String - OTP
   */
  async fetchCandidateVerificationOtpFromEmail(email) {
    await I.wait(constantsPage.waitTime.EMAIL_WAIT_TIME);
    let mail = await this.getEmailData("CANDIDATE_VERIFY_OTP", email);
    if (mail === false) {
      await I.addMochawesomeContext(
        `Verification OTP mails are not received for this email ${email}`
      );
      return false;
    } else {
      await I.addMochawesomeContext(
        `The mails are received for otp verification and its parameters are ${JSON.stringify(
          mail.parameters
        )}`
      );
      return mail.parameters.otp;
    }
  },

  //---------------------------------------------------------------------------
  // -------------------------------- MAIL METHOD ENDS ---------------------------
  // ----------------------------------------------------------------------------

  // -------------- DROP DOWN METHODS START -------------------

  /**
   * This method  verifies the dropdown options
   * @param {string} dropdownLocator
   * @param {list} optionList
   */
  async verifyDropdownOptions(dropdownLocator, optionList) {
    await I.isElementAvailable(dropdownLocator);
    await I.clickElement(dropdownLocator);
    for (value of optionList) {
      await I.scrollIntoView(
        `//div[normalize-space(text()) = '${value}'] | //li/div[normalize-space(text()) = '${value}']`
      );
      assert.ok(
        await tryTo(() =>
          I.waitForElement(
            `//li[normalize-space(text()) = '${value}'] | //li/div[normalize-space(text()) = '${value}']`,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `Value '${value}' is not present in the dropdown options`
      );
      await I.addMochawesomeContext(
        `Value '${value}' is present in the dropdown option`
      );
    }
  },

  /**
   * This method is used to select dropdown option
   * @param {string} dropdownLocator
   * @param {string} optionLocator
   */
  async selectDropdownOption(dropdownLocator, optionLocator) {
    await I.clickElement(dropdownLocator);
    await I.clickElement(optionLocator);
  },

  // ----------------- DROP DOWN METHODS ENDS ----------------

  /**
   * This method is used to extract numbers from string
   * @param {string} string
   */
  async extractNumbersFromString(string) {
    return string.replace(/\D/g, "");
  },

  /*
   * This method is used to get file size in MB
   * @param {string} fileName
   * @returns file size
   */
  async getFileSizeInMB(fileName) {
    return new Promise((resolve, reject) => {
      let filePath = "./" + constantsPage.testDataPath + "/" + fileName;

      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        resolve(fileSizeInMB);
      });
    });
  },

  /**
   * This method is used to get file size in MB from particular test data folder
   * @param {string} fileName
   * @param {string} folderName
   * @returns file size
   */
  async getFileSizeInMBinFolder(fileName, folderName = null) {
    return new Promise((resolve, reject) => {
      let filePath = "";
      if (folderName)
        filePath =
          "./" + constantsPage.testDataPath + "/" + folderName + "/" + fileName;
      else filePath = "./" + constantsPage.testDataPath + "/" + fileName;

      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        resolve(fileSizeInMB);
      });
    });
  },

  /**
   * This method is used to verify if the file format matches any of the specified extensions.
   * @param {string} fileName - The name of the file, including its extension.
   * @param {array} validExtensions - An array of valid file extensions to check against.
   */
  async verifyFileFormat(fileName, validExtensions) {
    // Get the file extension from the fileName
    const fileExtension = fileName.split(".").pop().toLowerCase();
    // Check if the file extension is in the validExtensions array
    if (validExtensions.includes(fileExtension)) {
      await I.addMochawesomeContext(
        `Expected file extension ${fileExtension} is available`
      );
    } else {
      assert.fail(
        `Expected test data file extensions are ${validExtensions}, but provided file format is ${fileExtension}`
      );
    }
  },

  /*
   * This method is used to generate random 10 digit mobile number
   * @returns string
   */
  async generateRandomMobileNumber() {
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    return String(randomNumber).substring(0, 10);
  },

  /**
   * This method is used to verify if file is downloaded
   * @param {string} downloadPath, // path where the downloaded files are stored
   * return Filepath
   */
  async verifyDownload() {
    let downloadPath = CommonUtils.getDownloadPath();
    await I.wait(this.constants.downloadWaitTime);
    const files = fs.readdirSync(downloadPath);
    const xlsFiles = files.filter((file) => file.endsWith(`.xlsx`)); //Filtering xlsx files alone
    const fileStats = xlsFiles.map((file) => ({
      file,
      mtime: fs.statSync(path.join(downloadPath, file)).mtime.getTime(),
    }));
    const sortedFiles = fileStats.sort((a, b) => b.mtime - a.mtime);
    let fileName = sortedFiles.length > 0 ? sortedFiles[0].file : null;
    let filePath = path.join(downloadPath, fileName);
    return filePath;
  },

  /**
   * This method is used to verify if a list is part/subset of a larger/parent list
   * @param {list} parentList
   * @param {list} childList
   */
  async verifySubsetList(parentList, childList) {
    for (let item of childList) {
      if (!parentList.includes(item)) {
        assert.fail(`Child list item: "${item}" should be part of Parent list`);
      }
    }
  },
};
