// in this file you can append custom step methods to 'I' object

const { I, constantsPage } = inject();
const assert = require("assert");

module.exports = function () {
  return actor({
    // Define custom steps here, use 'this' to access default methods of I.

    /**
     * This method will wait for text to be displayed and enabled before performing click
     * @param {String} labelText
     */
    async clickLabel(labelText) {
      assert.ok(
        await tryTo(() =>
          I.waitForText(
            labelText,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `"${labelText}" not available for click even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
      await I.click(labelText);
    },

    /**
     * This method will wait for the element to be displayed and enabled before performing click
     * @param {Xpath} elementLocator
     */
    async clickElement(elementLocator) {
      assert.ok(
        await tryTo(() =>
          I.waitForElement(
            elementLocator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `Element "${elementLocator}" not available for click even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
      assert.ok(
        await tryTo(() =>
          I.waitForEnabled(
            elementLocator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `"${elementLocator}" not enabled for click even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
      assert.ok(
        await tryTo(() =>
          I.waitForClickable(
            elementLocator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `"${elementLocator}" is not clickable even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
      assert.ok(
        await tryTo(() =>
          I.waitForVisible(
            elementLocator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `"${elementLocator}" is not Visible even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
      await I.click(elementLocator);
    },

    /**
     * This method will wait for locator, enabled, fill field, and verify if the value is updated
     * @param {Xpath} fieldLocator
     * @param {String} value
     */
    async fillValue(fieldLocator, value) {
      assert.ok(
        await tryTo(() =>
          I.waitForElement(
            fieldLocator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `Element "${fieldLocator}" not available even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
      assert.ok(
        await tryTo(() =>
          I.waitForEnabled(
            fieldLocator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `"${fieldLocator}" not enabled even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
      assert.ok(
        await tryTo(() =>
          I.waitForVisible(
            fieldLocator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `"${fieldLocator}" not Visible even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
      await I.fillField(fieldLocator, value);
      if (value) {
        assert.equal(
          await I.grabValueFrom(fieldLocator),
          value,
          `Value ${value} not filled in the field`
        );
        await I.addMochawesomeContext(
          `"${value}" filled at input box with locator "${fieldLocator}"`
        );
      }
    },

    /**
     * This method will clear the field of the given locator
     * @param {Xpath} fieldLocator
     */
    async clearField(fieldLocator) {
      await I.clickElement(fieldLocator);
      await I.pressKey([
        constantsPage.keyConstants.control,
        constantsPage.keyConstants.a,
      ]);
      await I.wait(1);
      await I.pressKey([constantsPage.keyConstants.delete]);
      await I.wait(1);
      let fieldValue = await I.grabValueFromAll(fieldLocator);
      assert.equal(
        fieldValue.length,
        constantsPage.numericalConstants.zero,
        `"${fieldLocator}" should be empty after clearing field`
      );
      await I.addMochawesomeContext(
        `Input box with Locator "${fieldLocator}" cleared`
      );
    },

    /**
     * This method validates for presence of expected error message
     * @param {String} message
     */
    async isErrorMessageDisplayed(message) {
      assert.ok(
        await tryTo(() =>
          I.waitForText(message, constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME)
        ),
        `Expected message for the given input: "${message}"`
      );
      await I.addMochawesomeContext(`"${message}" displayed on the screen.`);
    },

    /**
     * This method verifies if element is enabled
     * @param {string} locator
     */
    async isElementEnabled(locator, locatorName) {
      assert.ok(
        await tryTo(() =>
          I.waitForEnabled(
            locator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `${locatorName} not enabled even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait time`
      );
    },

    /**
     * This method verifies presence of an element
     * @param {string} locator
     */
    async isElementAvailable(locator, locatorName = locator) {
      assert.ok(
        await tryTo(() =>
          I.waitForElement(
            locator,
            constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME
          )
        ),
        `${locatorName} not available even after a wait of ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds`
      );
      await I.addMochawesomeContext(`"${locatorName}" located on the screen.`);
    },

    /**
     * This method wait for the presence of option , select the option and check whether the selected option is in checked state
     * @param {string} locator
     * @param {string} locatorName
     */
    async selectOption(locator, locatorName = locator) {
      await I.isElementAvailable(locator);
      await I.checkOption(locator);
      assert.ok(
        await tryTo(() => I.seeCheckboxIsChecked(locator)),
        `Option ${locatorName} is not in checked state`
      );
      await I.addMochawesomeContext(`"${locatorName}" is in checked state`);
    },

    /**
     * This method is used to verify presence of a particular text / label on the portal
     * @param {String} text
     * @param {String} errorMessage - optional
     */
    async isTextDisplayed(text, errorMessage = text) {
      assert.ok(
        await tryTo(() =>
          I.waitForText(text, constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME)
        ),
        `"${errorMessage}" not available even after ${constantsPage.waitTime.ELEMENT_LOAD_WAIT_TIME} seconds wait`
      );
    },

    /**
     * This method is used to shift the focus from the selected element by pressing tab
     */
    async shiftFocus() {
      await I.pressKey(constantsPage.keyConstants.tab);
    },
  });
};
