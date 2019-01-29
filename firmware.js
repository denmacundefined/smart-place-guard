function onInit() {
  wifi = require('Wifi');
  ssid = 'HOME';
  password = 'd0m1nat0r';
  port = 81;
  http = require('http');
  I2C1.setup({scl:22, sda:21});
  display = require("SSD1306").connect(I2C1, start);
  bmp = require("BMP085").connect(I2C1);
  htu = require('HTU21D').connect(I2C1);
}

function start() {
  wifi.connect(ssid, {password: password}, function() {
    console.log(`${wifi.getIP().ip}:${port}`);
    display.setFontVector(12);
    display.drawString((`${wifi.getIP().ip}:${port}`), 0, 0);
    display.flip();
    http.createServer(function(req, res) {
      res.writeHead(200);
      res.write('DenMacUndefined it\'s a legend');
      bmp.getPressure(function(d) {
        res.write("\nPressure: " + d.pressure + " Pa");
        res.write("\nTemperature: " + d.temperature + " C");
        htu.getTemperature( function(temp) {
           res.write("\nTemperature 2: " + temp + " C");
           htu.getHumidity( function(hum) {
              res.write("\nHumidity: " + hum + " %");
              res.write("\nCO2: " + analogRead(34) + " ppm");
              res.write("\nGAS: " + analogRead(35) + " ppm");
              res.end();
           });
         });
      });
      digitalWrite(16, 1);
      display.setFontVector(12);
      display.drawString('request done', 0, 22);
      display.flip();
      setTimeout(() => {
        digitalWrite(16, 0);
      }, 3000);
    }).listen(port);
  });
}