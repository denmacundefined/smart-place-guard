var pins = {
  rgb: [33, 25, 26],
  buzzer: 32,
  co2: 35,
  gas: 34,
  button: 27,
  relays: [4, 12, 13, 14, 2],
  i2c: {scl: 22, sda: 21}
};

var measurements = [
  {id: 'pressure',
   value: 0},
  {id: 'temperature',
   value: 0},
  {id: 'temperature htu',
   value: 0},
  {id: 'humidity',
   value: 0},
  {id: 'co2',
   value: 0},
  {id: 'gas',
   value: 0},
  {id: 'button',
   value: 0},
  {id: 'humidity correction',
   value: 0},
];

function getMeasurements() {
  measurements[4].value = analogRead(pins.co2);
  measurements[5].value = analogRead(pins.gas);
  measurements[6].value = digitalRead(pins.button);
  bmp.getPressure(function(data) {
    measurements[0].value = data.pressure;
    measurements[1].value = data.temperature;
  });
  htu.getTemperature(function(temp) {
    htu.getHumidity(function(hum) {
      measurements[2].value = temp;
      measurements[3].value = hum;
      measurements[7].value = htu.getCompensatedHumidity(hum, temp);
    });
  });
}

function relaysInit() {
  for (var i = 1; i < pins.relays.length; i++) {
    pinMode(pins.relays[i], 'output');
  }
}

function connectWifi(ssid, password) {
   wifi = require('Wifi');
   wifi.connect(ssid, {password: password}, function() {
    display.setFontVector(12);
    display.drawString((`${wifi.getIP().ip}`), 0, 0);
    display.flip();
  });
}

function onInit() {
  I2C1.setup(pins.i2c);
  memory = new (require('FlashEEPROM'))();
  display = require('SSD1306').connect(I2C1);
  bmp = require('BMP085').connect(I2C1);
  htu = require('HTU21D').connect(I2C1);
  connectWifi(E.toString(memory.read(0)), E.toString(memory.read(1)));
  setInterval(getMeasurements, Number(E.toString(memory.read(2))));
  relaysInit();
  serverInit();
}

function serverInit() {
  http = require('http');
  http.createServer(function(req, res) {
    res.writeHead(200);
    for (var i = 0; i < measurements.length; i++) {
      res.write(`\n ${measurements[i].id} : ${measurements[i].value}`);
    }
    res.end();
    analogWrite(pins.buzzer, 1);
    setTimeout(function() {
      analogWrite(pins.buzzer, 0);
    }, 333);
    display.setFontVector(12);
    display.drawString('request done', 0, 22);
    display.flip();
  }).listen(80);
}