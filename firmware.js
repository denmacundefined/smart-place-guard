function processRequest (req, res) {
  res.writeHead(200);
  res.end('DenMacUndefined it\'s a legend');
  digitalWrite(16, 1);
  display.setFontVector(12);
  display.drawString('done', 0, 22);
  display.flip();
  setTimeout(() => {
    digitalWrite(16, 0);
  }, 3000);
}

function subscriber() {
  wifi.connect(ssid, {password: password}, function() {
      var http = require('http');
      http.createServer(processRequest).listen(port);
      console.log(`${wifi.getIP().ip}:${port}`);
      display.setFontVector(12);
      display.drawString((`${wifi.getIP().ip}:${port}`), 0, 0);
      display.flip();
  });
}

function onInit() {
  wifi = require('Wifi');
  ssid = 'HOME';
  password = 'd0m1nat0r';
  port = 80;
  I2C1.setup({scl:22, sda:21});
  display = require("SSD1306").connect(I2C1);
  subscriber();
}