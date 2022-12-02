import fs from 'fs/promises';
import puppeteer from "puppeteer";

async function runPuppet() {
	const testLink = `https://open.spotify.com/track/6y3BGPc1rnn1UG588pvWAs?si=8c254d170df542ad`
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();

	await page.goto("https://open.spotify.com/");

	await page.click(`button[data-testid="login-button"]`);

	await page.waitForSelector(`input[data-testid="login-username"]`);
	await page.type(`input[data-testid="login-username"]`, 'fabianHouseNC@gmail.com');
	await page.type(`input[data-testid="login-password"]`, 'Fgz$&8JXdW^Ec3');
	await page.click(`button[data-testid="login-button"]`);
	console.log("We are Logged in and loaded");
	await waitForXSeconds(50);
	console.log("waited for 10 seconds");

	const cookies = await page.cookies();
	await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
	//await page.goto(testLink);

}

async function waitForXSeconds(seconds) {
	return new Promise((resolve, reject)=>{
		try {
		setTimeout(()=>{
			resolve(true);
		}, seconds * 1000)
		} catch (e) {
			reject(e);
		}
	})
}

runPuppet();