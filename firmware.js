var pins = {
  rgb: [33, 25, 26],
  buzzer: 32,
  co2: 35,
  gas: 34,
  button: 27,
  relays: [4, 12, 13, 14, 2],
  i2c: {scl: 22, sda: 21}
};

var values = [
  {id: 'Pressure',
   value: 0},
  {id: 'Temperature 1',
   value: 0},
  {id: 'Temperature 2',
   value: 0},
  {id: 'Humidity 1',
   value: 0},
  {id: 'CO2',
   value: 0},
  {id: 'Gas',
   value: 0},
  {id: 'Humidity 2',
   value: 0},
  {id: 'Button',
   value: 0},
  {id: 'Display index',
   value: 0}
];

var displayViewsCount = 7;

function getValues() {
  values[4].value = analogRead(pins.co2);
  values[5].value = analogRead(pins.gas);
  values[7].value = digitalRead(pins.button);
  values[8].value = (values[7].value === 0) ? values[8].value + 1 : values[8].value;
  values[8].value = (values[8].value > displayViewsCount) ? 0 : values[8].value;
  bmp.getPressure(function(data) {
    values[0].value = data.pressure;
    values[1].value = data.temperature;
  });
  htu.getTemperature(function(temp) {
    htu.getHumidity(function(hum) {
      values[2].value = temp;
      values[3].value = hum;
      values[6].value = htu.getCompensatedHumidity(hum, temp);
    });
  });
}

function relaysInit() {
  for (var i = 1; i < pins.relays.length; i++) {
    pinMode(pins.relays[i], 'output');
  }
}

function setRgbColor(value) {
  analogWrite(pins.rgb[0], value);
  analogWrite(pins.rgb[2], 1 - value);
  analogWrite(pins.rgb[1], 0.5 - value);
}

function wifiConnect(ssid, password) {
   wifi = require('Wifi');
   wifi.connect(ssid, {password: password});
}

function setDisplayView() {
  display.clear();
  display.setFontVector(13);
  switch (values[8].value) {
    case 0 :
      display.drawString(`${wifi.getIP().mac}`, 0, 1);
      display.drawString(`${wifi.getIP().ip}`, 0, 22);
      display.drawString(`${wifi.getIP().gw}`, 0, 46);
      break;
    case 1 :
      display.drawString(`${values[0].id} :`, 0, 0);
      display.setFontVector(18);
      display.drawString(`${values[0].value}`, 0, 30);
      break;
    case 2 :
      display.drawString(`${values[1].id} :`, 0, 0);
      display.setFontVector(18);
      display.drawString(`${values[1].value}`, 0, 30);
      break;
     case 3 :
      display.drawString(`${values[2].id} :`, 0, 0);
      display.setFontVector(18);
      display.drawString(`${values[2].value}`, 0, 30);
      break;
     case 4 :
      display.drawString(`${values[3].id} :`, 0, 0);
      display.setFontVector(18);
      display.drawString(`${values[3].value}`, 0, 30);
      break;
     case 5 :
      display.drawString(`${values[4].id} :`, 0, 0);
      display.setFontVector(18);
      display.drawString(`${values[4].value}`, 0, 30);
      break;
     case 6 :
      display.drawString(`${values[5].id} :`, 0, 0);
      display.setFontVector(18);
      display.drawString(`${values[5].value}`, 0, 30);
      break;
     case 7 :
      display.drawString(`${values[6].id} :`, 0, 0);
      display.setFontVector(18);
      display.drawString(`${values[6].value}`, 0, 30);
      break;
  }
  display.flip();
}

function onInit() {
  I2C1.setup(pins.i2c);
  memory = new (require('FlashEEPROM'))();
  display = require('SSD1306').connect(I2C1);
  bmp = require('BMP085').connect(I2C1);
  htu = require('HTU21D').connect(I2C1);
  relaysInit();
  wifiConnect(E.toString(memory.read(0)), E.toString(memory.read(1)));
  setInterval(function() {
    getValues();
    setDisplayView();
  }, Number(E.toString(memory.read(2))));
  serverInit();
}

function serverInit() {
  http = require('http');
  http.createServer(function(req, res) {
    res.writeHead(200);
    for (var i = 0; i < values.length; i++) {
      res.write(`\n ${values[i].id} : ${values[i].value}`);
    }
    res.end();
  }).listen(80);
}