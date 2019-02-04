function onInit() {
  redpin = 33;
  greenpin = 25;
  bluepin = 26;
  buzzerpin = 32;
  co2pin = 35;
  gaspin = 34;
  buttonpin = 27;
  relays = [4, 12, 13, 14, 2];
  freePins = [0, 15];
  i2cInit();
  relaysInit();
  connectWifi('HOME', 'd0m1nat0r');
  serverInit();
}

function connectWifi(ssid, password) {
   wifi = require('Wifi');
   wifi.connect(ssid, {password: password}, function() {
    console.log(`${wifi.getIP().ip}:81`);
    display.setFontVector(12);
    display.drawString((`${wifi.getIP().ip}:81`), 0, 0);
    display.flip();
  });
}

function i2cInit() {
  I2C1.setup({scl:22, sda:21});
  display = require("SSD1306").connect(I2C1);
  bmp = require("BMP085").connect(I2C1);
  htu = require('HTU21D').connect(I2C1);
}

function relaysInit() {
  for (var i = 1; i < relays.length; i++) {
    pinMode(relays[i], 'output');
  }
}

function serverInit() {
  http = require('http');
  http.createServer(function(req, res) {
    res.writeHead(200);
    res.write('DenMacUndefined it\'s a legend');
    bmp.getPressure(function(d) {
      res.write("\nPressure: " + d.pressure + " Pa");
      res.write("\nTemperature: " + d.temperature + " C");
      htu.getTemperature( function(temp) {
        res.write("\nTemperature better: " + temp + " C");
        htu.getHumidity( function(hum) {
          res.write("\nHumidity: " + hum + " %");
          res.write("\nCO2: " + analogRead(co2pin) + " ppm");
          res.write("\nGAS: " + analogRead(gaspin) + " ppm");
          res.write("\nButton: " + digitalRead(buttonpin));
          analogWrite(buzzerpin, 1);
          setTimeout(function() {
            analogWrite(buzzerpin, 0);
          }, 333);
          res.end();
        });
      });
    });
    display.setFontVector(12);
    display.drawString('request done', 0, 22);
    display.flip();
  }).listen(81);
}