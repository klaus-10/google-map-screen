const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path"); // Import the path module
const readline = require("readline"); // Import the readline module

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: "new", // Specify the new headless mode
  });
  const page = await browser.newPage();

  // Navigate the page to Google Maps
  await page.goto("https://www.google.com/maps");

  // Set screen size
  await page.setViewport({ width: 1920, height: 1080 });

  // Click on the specified button to accept cookies
  const buttonSelector =
    ".VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.LQeN7.Nc7WLe";
  await page.waitForSelector(buttonSelector);
  await page.click(buttonSelector);

  // Wait for a brief moment
  await page.waitForTimeout(1000);

  // Click on the element to open directions
  const routeButtonSelector = "hArJGc"; // Replace with the actual element ID
  await page.waitForSelector(`#${routeButtonSelector}`);
  await page.click(`#${routeButtonSelector}`);

  // Wait for a brief moment
  await page.waitForTimeout(1000);

  // Create a readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Prompt user for starting point
  rl.question("Insert the starting point: ", async (startingPoint) => {
    // Prompt user for destination point
    rl.question("Insert the destination point: ", async (destination) => {
      // Prompt user for vehicle choice
      rl.question(
        "Choose a vehicle (car, walk, bicycle, public transport): ",
        async (vehicleChoice) => {
          rl.close(); // Close the readline interface

          // Select starting point and await the first result
          const destinations = await page.$$(".tactile-searchbox-input");
          await destinations[0].type(startingPoint);
          await page.waitForTimeout(1000);
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");

          // Select destination point and await the first result
          await destinations[1].type(destination);
          await page.waitForTimeout(1000);
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");

          // Wait for a brief moment
          await page.waitForTimeout(1500);

          // Select the vehicle based on user choice
          const veichles = await page.$$(".oya4hc");
          const veichleIndexMap = {
            car: 1,
            walk: 3,
            bicycle: 4,
            "public transport": 2,
          };
          const veichleIndex = veichleIndexMap[vehicleChoice.toLowerCase()];
          if (veichleIndex !== undefined) {
            await veichles[veichleIndex].click();
          } else {
            console.log("Invalid vehicle choice.");
          }

          // Wait for a brief moment
          await page.waitForTimeout(1500);

          // Get the current date and time
          const now = new Date();
          const formattedDate = `${now.getDate()}-${
            now.getMonth() + 1
          }-${now.getHours()}-${now.getMinutes()}`;

          // Take a screenshot
          const screenshotPath = path.join(
            __dirname,
            `map_screenshot_${formattedDate}.png`
          );
          await page.screenshot({ path: screenshotPath });

          // Close the browser
          await browser.close();

          // Rename the screenshot with a number
          const mapNumber = 1;
          const newScreenshotPath = path.join(
            __dirname,
            `map_${mapNumber}.png`
          );
          fs.renameSync(screenshotPath, newScreenshotPath);

          console.log(`Screenshot saved as ${newScreenshotPath}`);
        }
      );
    });
  });
})();
