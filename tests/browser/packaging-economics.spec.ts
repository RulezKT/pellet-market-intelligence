import {test,expect} from '@playwright/test';
const url='./packaging-economics/';
test('packaging offer transfer, separate source price, persistence, CSV and copy',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto(url);await expect(page.locator('h1')).toHaveText('Экономика фасовки');
 await page.getByLabel('Выбрать и перенести предложение').selectOption('obi-heizfuxx');await expect(page.getByLabel('Мешков на палете')).toHaveValue('65');await expect(page.getByLabel('Цена продажи',{exact:true}).filter({hasNot:page.locator('option')})).toHaveValue('769.9');
 await page.getByLabel('Закупка навалом',{exact:true}).filter({hasNot:page.locator('option')}).fill('123');await page.reload();await expect(page.getByLabel('Закупка навалом',{exact:true}).filter({hasNot:page.locator('option')})).toHaveValue('123');await expect(page.locator('.retail-reference')).toContainText('769,9');
 await page.getByLabel('Мешков на палете').fill('1.5');await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByLabel('Мешков на палете')).toHaveValue('65');
 await page.getByRole('button',{name:'Скопировать результат'}).click();await expect(page.getByRole('status')).toContainText('скопирован');expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('not net profit');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Экспорт CSV'}).click();expect((await download).suggestedFilename()).toBe('pellet-packaging-economics.csv');
 await page.getByRole('button',{name:'Сбросить',exact:true}).click();await expect(page.getByLabel('Закупка навалом',{exact:true}).filter({hasNot:page.locator('option')})).toHaveValue('250');
});
test('packaging mobile and zero volume remain finite',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto(url);await page.getByLabel('Продажи / месяц',{exact:true}).fill('0');await expect(page.locator('main')).not.toContainText(/NaN|Infinity/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.waitForSelector('canvas');await page.screenshot({path:'reports/packaging-mobile.png',fullPage:true});});
