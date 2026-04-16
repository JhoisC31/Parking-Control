const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const fs   = require('fs')
const path = require('path')
 
const BASE_URL = 'http://localhost:5173'
const WAIT     = 7000
 


/* Variables dinamicas para las pruebas */
const PLACA    = ''
const DESC     = ''
 
/* Carpeta */
const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots')
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
 
let driver
 
const wait    = l => driver.wait(until.elementLocated(l), WAIT).then(e => driver.wait(until.elementIsVisible(e), WAIT).then(() => e))
const type    = async (l, t) => { const e = await wait(l); await e.clear(); await e.sendKeys(t) }
const jsClick = async l => { const e = await wait(l); await driver.executeScript('arguments[0].click()', e) }
const submitBtn = By.css('button.btn-primary.btn-lg[type="submit"]')
 
/**
 * Toma una captura de pantalla y la guarda en la carpeta screenshots/.
 * @param {number} casoNum 
 * @param {string} nombre   
 * @param {string} [sufijo]
 */

async function captura(casoNum, nombre, sufijo = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const etiqueta  = sufijo ? `_${sufijo}` : ''
  const fileName  = `caso${casoNum}_${nombre.replace(/\s+/g, '_')}${etiqueta}_${timestamp}.png`
  const filePath  = path.join(SCREENSHOTS_DIR, fileName)
  const image     = await driver.takeScreenshot()
  fs.writeFileSync(filePath, image, 'base64')
  console.log(` Captura: screenshots/${fileName}`)
}
 
/* Caso 1 - placa necesaria */
async function caso1() {
  await driver.get(`${BASE_URL}/entry`)
  await jsClick(submitBtn)
  await driver.sleep(1000)
  const msg = await (await wait(By.css('.alert.alert-error'))).getText()
  if (!msg.toLowerCase().includes('placa')) throw new Error(`Error inesperado: "${msg}"`)
}
 
/* Caso 2 - Registrar la placa */
async function caso2() {
  await driver.get(`${BASE_URL}/entry`)
  await type(By.css('input[name="plate"]'), PLACA)
  await (await wait(By.css('select[name="vehicleType"]'))).findElement(By.css('option[value="automovil"]')).click()
  await type(By.css('input[name="vehicleDesc"]'), DESC)
  await driver.sleep(800)
  await jsClick(submitBtn)
  await driver.sleep(1500)
  if (!(await (await wait(By.css('.ticket-receipt'))).isDisplayed())) throw new Error('Ticket no generado')
}
 
/* Caso 3 - Duplicado */
async function caso3() {
  await driver.get(`${BASE_URL}/entry`)
  await type(By.css('input[name="plate"]'), PLACA)
  await driver.sleep(600)
  await jsClick(submitBtn)
  await driver.sleep(1000)
  const msg = await (await wait(By.css('.alert.alert-error'))).getText()
  if (!msg.toLowerCase().includes('placa') && !msg.toLowerCase().includes('activo') && !msg.toLowerCase().includes('registrado')) {
    throw new Error(`Mensaje inesperado: "${msg}"`)
  }
}
 
/* Caso 4 - View en el historial */
async function caso4() {
  await driver.get(`${BASE_URL}/history`)
  await driver.sleep(1000)
  await type(By.css('input[placeholder="Buscar por placa o ticket #..."]'), PLACA)
  await driver.sleep(900)
  const found = await (await wait(By.xpath(`//tbody//td//span[contains(@class,'mono') and contains(text(),'${PLACA}')]`))).getText()
  if (found !== PLACA) throw new Error(`Placa no encontrada en historial`)
}
 
/* Caso 5 - Registrar la salida */
async function caso5() {
  await driver.get(`${BASE_URL}/active`)
  await driver.sleep(1000)
  await type(By.css('input[placeholder="Buscar por placa o espacio..."]'), PLACA)
  await driver.sleep(900)
  await wait(By.xpath(`//tbody//td//span[contains(@class,'mono') and contains(text(),'${PLACA}')]`))
  await jsClick(By.xpath("//button[contains(@class,'btn-danger') and contains(.,'Salida')]"))
  await driver.sleep(900)
  await jsClick(By.xpath("//div[contains(@class,'modal-footer')]//button[contains(@class,'btn-primary')]"))
  await driver.sleep(1500)
  const txt = await (await wait(By.css('.ticket-receipt'))).getText()
  if (!txt.includes(PLACA)) throw new Error('Comprobante no contiene la placa')
}
 
/* Caso 6 - Dashboard view */
async function caso6() {
  await driver.get(`${BASE_URL}/`)
  await driver.sleep(1100)
  const titulo = await (await wait(By.css('h1.page-title'))).getText()
  if (titulo !== 'Dashboard') throw new Error(`Título inesperado: "${titulo}"`)
  const cards = await driver.findElements(By.css('.stat-card'))
  if (cards.length < 4) throw new Error(`Se esperaban 4 stat-cards, encontradas: ${cards.length}`)
}
 
 
/* ──────────────────────────────────────────────
   RUNNER PRINCIPAL
   ────────────────────────────────────────────── */
async function run() {
  const options = new chrome.Options()
  options.addArguments('--window-size=1280,800')
  driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
 
  let passed = 0, failed = 0
  const casos = [
    [1, 'Placa necesaria',     caso1],
    [2, 'Ingresar entrada',    caso2],
    [3, 'Duplicado de ticket', caso3],
    [4, 'Historial',           caso4],
    [5, 'Registrar salida',    caso5],
    [6, 'Vista general',       caso6],
  ]
  console.log('\n Parking Control — Pruebas Selenium\n')
 
  for (const [num, nombre, fn] of casos) {
    try {
      await fn()
      await captura(num, nombre, 'pass')
      console.log(`  ✅ ${nombre}`)
      passed++
    } catch (err) {
      await captura(num, nombre, 'fail').catch(() => {}) // captura aunque falle el driver
      console.log(`  ❌ ${nombre}: ${err.message}`)
      failed++
    }
  }
 
  await driver.quit()
  console.log(`\n  Resultado: ${passed} pasaron / ${failed} fallaron\n`)
  process.exit(failed > 0 ? 1 : 0)
}
 
run().catch(async err => {
  console.error('Error fatal:', err.message)
  await driver?.quit()
  process.exit(1)
})