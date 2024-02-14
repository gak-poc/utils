const puppeteer = require("puppeteer");


const extractLinkedInAboutUs = async (companyUrl) => {

  var arr = [];
  var obj = {};
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"], timeout: 0});
  
/* const browser = await puppeteer.launch({
  headless: "new",
  timeout: 0, // Disable timeout
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ignoreHTTPSErrors: true,
  defaultViewport: null,
   protocolTimeout: 60000, // Set protocol timeout to 30 seconds (or adjust as needed)
});*/
  const page = await browser.newPage();
  try {
    // Navigate to the company URL
    await page.goto(companyUrl,{waitUntil: 'load', timeout: 0});
    await page.waitForSelector("body");
    // Check if the URL is valid and contains the "About us" section
    const aboutUsElement = await page.$x(
      "//h2[contains(text(), 'About us')]/following-sibling::div/p"
    );
    if (aboutUsElement.length > 0) {
      // Extract "About us" text
      const textContent = await aboutUsElement[0].getProperty("textContent");
      const text = await textContent.jsonValue();
      console.log("About Us Text:", text);
      obj["description"] = text;
      obj["status"] = 200; //SET STATUS as 200 when URL is valid
      // Logo url:
      try {
        // Wait for the image element to appear
        let imageElement = await page.waitForXPath(
          "//div[@class='top-card-layout__entity-image-container flex']/img"
        );
        // Extract the 'src' attribute of the image element
        let src = await page.evaluate((element) => {
          return element.getAttribute("src");
        }, imageElement);
        console.log("Image src:", src);
        obj["img"] = src;
      } catch (error) {
        console.error("Image element not found:", error);
      }
    } else {
      console.log("About us section not found on the page");
      obj["description"] = "Not a Valid LinkedIn URL";
      obj["status"] = 400; //SET STATUS as 200 when URL is valid
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    console.log(obj);
    arr.push(obj);
    // Close the browser
    if (browser) {
      await browser.close();
    }
    return(arr);
  }
/*
  var arr = [];
  var obj = {};
  // Launch a headless Chromium browser
  const browser = await puppeteer.launch({ headless: true });

  // Create a new page
  const page = await browser.newPage();

  console.log(companyUrl)
  // Navigate to a URL 
  await page.goto(companyUrl);
  await page.waitForSelector("body");

  // Close signin popup
  let dismissButtonSelector =
    'div#organization_guest_contextual-sign-in div.modal__overlay section button[aria-label="Dismiss"]';
  let dismissButton = await page.$(dismissButtonSelector);

  if (dismissButton) {
    await dismissButton.click();
    await page.waitForSelector(dismissButtonSelector, { hidden: true });
  } else {
    console.error("Dismiss button not found");
  }

 
  try {
    // Wait for the element to appear
    let element = await page.waitForXPath(
      "//h2[contains(text(), 'About us')]/following-sibling::div/p"
    );

    // Scroll to the "About us" text
    await page.evaluate((element) => {
      element.scrollIntoView();
    }, element);

    // Extract the text content of the element
    let textContent = await element.getProperty("textContent");
    let text = await textContent.jsonValue();

    console.log("Extracted text:", text);
    obj['description'] = text;
  } catch (error) {
    console.error("Element not found:", error);
  }

  // Logo url:
  try {
    // Wait for the image element to appear
    let imageElement = await page.waitForXPath(
      "//div[@class='top-card-layout__entity-image-container flex']/img"
    );

    // Extract the 'src' attribute of the image element
    let src = await page.evaluate((element) => {
      return element.getAttribute("src");
    }, imageElement);

    console.log("Image src:", src);
    obj['img'] = src;
  } catch (error) {
    console.error("Image element not found:", error);
  }
  arr.push(obj);
  // Close the browser
  await browser.close();

  
   
  return(arr);
  //return text, url
  //return {text,url};*/
}

 module.exports = { extractLinkedInAboutUs };

// Call the function to scrape LinkedIn "About Us" section
// extractLinkedInAboutUs("https://in.linkedin.com/company/openturftechnologies");

//extractLinkedInAboutUs("https://www.linkedin.com/company/theteatoastco");
