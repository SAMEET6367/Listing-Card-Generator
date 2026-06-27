import { chromium } from "playwright";


export async function extractUrlText(url) {

  const browser = await chromium.launch({
    headless: true
  });


  try {

    const page = await browser.newPage({

      userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    });



    await page.setExtraHTTPHeaders({

      "Accept-Language":
      "en-US,en;q=0.9",

      "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9"

    });



    await page.setViewportSize({

      width:1280,

      height:720

    });



    // Hide webdriver flag
    await page.addInitScript(() => {

      Object.defineProperty(
        navigator,
        "webdriver",
        {
          get: () => undefined
        }
      );

    });



    await page.goto(url, {

      waitUntil:"domcontentloaded",

      timeout:30000

    });



    // wait for JS generated content
    await page.waitForTimeout(7000);



    const text = await page.evaluate(() => {

      return document.body.innerText;

    });



    return text;



  } catch(error) {


    console.error(
      "PLAYWRIGHT URL ERROR:",
      error.message
    );


    throw new Error(
      "Could not extract website content"
    );


  } finally {


    await browser.close();

  }

}