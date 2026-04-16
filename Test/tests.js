const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

const BASE_URL = 'http://localhost:5173'
const WAIT     = 6000

let driver

async function setup() {
  const options = new chrome.Options()
  options.addArguments('--window-size=1280,800')

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function waitVisible(locator) {
  const el = await driver.wait(until.elementLocated(locator), WAIT)
  await driver.wait(until.elementIsVisible(el), WAIT)
  return el
}

async function typeIn(locator, text) {
  const el = await waitVisible(locator)
  await el.clear()
  await el.sendKeys(text)
}

async function clickOn(locator) {
  const el = await waitVisible(locator)
  await el.click()
}

/* Variable Dinamica para las pruebas */
let placaPrueba = "A5321-1"
let descripcionPrueba = "Mitsubishi Rojo"


// ═══════════════════════════════════════════
// CASO 1 — Registrar entrada
// ═══════════════════════════════════════════
async function caso1() {
  console.log('\n🧪 Caso 1: Registrar entrada de vehículo')

  await driver.get(`${BASE_URL}/entry`)
  await driver.sleep(800)

  await typeIn(By.css('input[name="plate"]'), placaPrueba)
  console.log(`  → Placa ingresada: ${placaPrueba}`)

  const select = await waitVisible(By.css('select[name="vehicleType"]'))
  await select.findElement(By.css('option[value="car"]')).click()
  console.log('  → Tipo seleccionado: Automóvil')

  await typeIn(By.css('input[name="vehicleDesc"]'), descripcionPrueba)
  console.log(`  → Descripción ingresada: ${descripcionPrueba}`)

  await clickOn(By.xpath("//button[contains(text(), 'Registrar Entrada')]"))
  await driver.sleep(1500)

  const comprobante = await waitVisible(By.css('.ticket-receipt'))

  if (await comprobante.isDisplayed()) {
    console.log('  ✅ RESULTADO: Ticket generado correctamente')
  } else {
    throw new Error('El comprobante no apareció')
  }
}


// ═══════════════════════════════════════════
// CASO 2 — Salida
// ═══════════════════════════════════════════
async function caso2() {
  console.log('\n🧪 Caso 2: Buscar ticket y registrar salida')

  await driver.get(`${BASE_URL}/active`)
  await driver.sleep(1200)

  await typeIn(By.css('input[placeholder*="Buscar"]'), placaPrueba)
  await driver.sleep(800)
  console.log(`  → Búsqueda: ${placaPrueba}`)

  const fila = await waitVisible(
    By.xpath(`//td[contains(text(), '${placaPrueba}') or .//span[contains(text(), '${placaPrueba}')]]`)
  )
  console.log('  → Ticket encontrado en la tabla')

  await clickOn(By.xpath("//button[contains(text(), 'Salida')]"))
  await driver.sleep(800)
  console.log('  → Modal de confirmación abierto')

  await clickOn(By.xpath("//button[contains(text(), 'Confirmar Salida')]"))
  await driver.sleep(1500)

  const comprobante = await waitVisible(By.css('.ticket-receipt'))
  const texto = await comprobante.getText()

  if (texto.includes(placaPrueba)) {
    console.log('  ✅ RESULTADO: Salida registrada correctamente')
  } else {
    throw new Error('El comprobante de salida no contiene la placa')
  }
}


// ═══════════════════════════════════════════
// CASO 3 — Placa duplicada
// ═══════════════════════════════════════════
async function caso3() {
  console.log('\n🧪 Caso 3: Validar placa duplicada')

  const placaDuplicada = "B456-CD"

  await driver.get(`${BASE_URL}/entry`)
  await driver.sleep(800)

  await typeIn(By.css('input[name="plate"]'), placaDuplicada)
  await clickOn(By.xpath("//button[contains(text(), 'Registrar Entrada')]"))
  await driver.sleep(1500)

  console.log(`  → Primera entrada registrada: ${placaDuplicada}`)

  await driver.get(`${BASE_URL}/entry`)
  await driver.sleep(800)

  await typeIn(By.css('input[name="plate"]'), placaDuplicada)
  await clickOn(By.xpath("//button[contains(text(), 'Registrar Entrada')]"))
  await driver.sleep(1000)

  console.log(`  → Intento de registro duplicado: ${placaDuplicada}`)

  const error = await waitVisible(By.css('.alert-error'))
  const mensaje = await error.getText()

  if (
    mensaje.toLowerCase().includes(placaDuplicada.toLowerCase()) ||
    mensaje.toLowerCase().includes('activo') ||
    mensaje.toLowerCase().includes('ticket')
  ) {
    console.log(`  ✅ RESULTADO: Error mostrado correctamente → "${mensaje}"`)
  } else {
    throw new Error(`Mensaje de error incorrecto: "${mensaje}"`)
  }
}


// ═══════════════════════════════════════════
// RUNNER
// ═══════════════════════════════════════════
async function run() {
  console.log('══════════════════════════════════════════')
  console.log(' Parking Control — Pruebas Automatizadas Selenium')
  console.log('══════════════════════════════════════════')

  await setup()

  let passed = 0
  let failed = 0

  for (const [nombre, fn] of [
    ['Caso 1', caso1],
    ['Caso 2', caso2],
    ['Caso 3', caso3]
  ]) {
    try {
      await fn()
      passed++
    } catch (err) {
      console.log(`  ❌ FALLO — ${nombre}: ${err.message}`)
      failed++
    }
  }

  await teardown()

  console.log('\n══════════════════════════════════════════')
  console.log(`  ✅ Pasaron: ${passed} | ❌ Fallaron: ${failed}`)
  console.log('══════════════════════════════════════════\n')

  process.exit(failed > 0 ? 1 : 0)
}

run().catch(async (err) => {
  console.error('Error fatal:', err.message)
  await teardown()
  process.exit(1)
})