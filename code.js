var pins = {
  rgb: [33, 25, 26],
  buzzer: 32,
  co2: 35,
  gas: 34,
  relays: [4, 12, 13, 14, 2],
  i2c: {scl: 22, sda: 21},
  button: 15
};

var values = [
  {id: 'Pressure', value: 0},
  {id: 'Temperature 1', value: 0},
  {id: 'Temperature 2', value: 0},
  {id: 'Humidity 1', value: 0},
  {id: 'CO2', value: 0},
  {id: 'Gas (MQ9)', value: 0},
  {id: 'Humidity Comp', value: 0},
  {id: 'Relay 1', value: 0},
  {id: 'Relay 2', value: 0},
  {id: 'Relay 3', value: 0},
  {id: 'Relay 4', value: 0},
  {id: 'Relay 5', value: 0},
  {id: 'Display index', value: 0}
];

var memory = {
  read: function(index) {
    var raw = require('Storage').read("config");
    if (!raw) return "";
    var lines = raw.replace(/\r/g, "").split("\n");
    return lines[index] !== undefined ? lines[index].trim() : "";
  }
};

var displayViewsCount, display, bmp, htu;
var wifi = require('Wifi');
var alarmActive = false;

const THRESHOLDS = {
  PRESSURE_MIN: 90000,
  PRESSURE_MAX: 105000,
  TEMP_MIN: 10.0,
  TEMP_MAX: 50.0,
  HUMIDITY_MIN: 10.0,
  HUMIDITY_MAX: 90.0,
  CO2_MAX: 2000,
  GAS_MQ9_MAX: 50
};

function readFilteredAnalog(pin) {
  var sum = 0;
  var samples = 16;
  for (var i = 0; i < samples; i++) {
    sum += analogRead(pin);
  }
  return sum / samples;
}

function checkAlerts() {
  let isCritical = false;
  let p = values[0].value;
  let t1 = values[1].value;
  let t2 = values[2].value;
  let h1 = values[3].value;
  let co2 = values[4].value;
  let gas = values[5].value;
  let hComp = values[6].value;
  if (p < THRESHOLDS.PRESSURE_MIN || p > THRESHOLDS.PRESSURE_MAX) {
    isCritical = true;
  }
  if (t1 < THRESHOLDS.TEMP_MIN || t1 > THRESHOLDS.TEMP_MAX ||
      t2 < THRESHOLDS.TEMP_MIN || t2 > THRESHOLDS.TEMP_MAX) {
    isCritical = true;
  }
  if (h1 < THRESHOLDS.HUMIDITY_MIN || h1 > THRESHOLDS.HUMIDITY_MAX ||
      hComp < THRESHOLDS.HUMIDITY_MIN || hComp > THRESHOLDS.HUMIDITY_MAX) {
    isCritical = true;
  }
  if (co2 > THRESHOLDS.CO2_MAX) {
    isCritical = true;
  }
  if (gas > THRESHOLDS.GAS_MQ9_MAX) {
    isCritical = true;
  }
  if (isCritical) {
    if (!alarmActive) {
      alarmActive = true;
      print("ALARM TRIGGERED! Critical condition on sensors.");
      digitalPulse(pins.buzzer, 1, [200, 200, 200, 200]); 
    }
  } else {
    alarmActive = false;
    digitalWrite(pins.buzzer, 0);
  }
}

function getValues() {
  var rawCo2Adc = readFilteredAnalog(pins.co2);
  var voltageCo2 = rawCo2Adc * 3.3;
  var baselineVoltage = 1.165; 
  var calculatedPpm = 800 + (baselineVoltage - voltageCo2) * 2000;
  values[4].value = Math.max(400, Math.round(calculatedPpm));
  var rawGasAdc = readFilteredAnalog(pins.gas);
  values[5].value = Math.round(rawGasAdc * 1000);
  var i2cWatchdog = setTimeout(function() {
    print("WARNING: I2C read timeout! Recovering...");
    setTimeout(getValues, Number(E.toString(memory.read(2))) || 5000);
  }, 3000);
  bmp.getPressure(function(data) {
    if (!data) return;
    values[0].value = Math.round(data.pressure * 10) / 10;
    values[1].value = Math.round(data.temperature * 10) / 10;
    htu.getTemperature(function(temp) {
      htu.getHumidity(function(hum) {
        clearTimeout(i2cWatchdog);
        values[2].value = Math.round(temp * 10) / 10;
        values[3].value = Math.round(hum * 10) / 10;
        values[6].value = Math.round(htu.getCompensatedHumidity(hum, temp) * 10) / 10;
        checkAlerts();
        setTimeout(getValues, Number(E.toString(memory.read(2))) || 5000);
      });
    });
  });
}

function setRgbColor(value) {
  var v = Math.max(0, Math.min(1, value));
  analogWrite(pins.rgb[0], v);
  analogWrite(pins.rgb[1], 1 - v);
  analogWrite(pins.rgb[2], Math.abs(0.5 - v) * 2);
}

function wifiConnect(ssid, password) {
  wifi.disconnect();
  print("Connecting to Wi-Fi: " + ssid);
  wifi.connect(ssid, {password: password}, function(err) {
    if (err) {
      print("Wi-Fi error: " + JSON.stringify(err));
    } else {
      var ipInfo = wifi.getIP();
      print("Wi-Fi connected successfully! IP: " + (ipInfo ? ipInfo.ip : "unknown"));
    }
  });
}

function setRelays(states) {
  for (var i = 0; i < pins.relays.length; i++) {
    var state = states[i] ? 1 : 0;
    digitalWrite(pins.relays[i], state);
    values[7 + i].value = state;
  }
  print("Relays updated to: " + JSON.stringify(states));
}

function setDisplayView() {
  var colorStep = Number(E.toString(memory.read(3))) || 0.1;
  var idx = values[12].value;
  if (idx === 0) {
    setRgbColor(colorStep / 2);
  } else {
    setRgbColor(idx * colorStep);
  }
  values[12].value = (idx + 1 > displayViewsCount) ? 0 : idx + 1;
  display.clear();
  display.setFontVector(13);
  var ip = wifi.getIP() || {ip: "0.0.0.0", mac: "00:00:00:00:00:00", gw: "0.0.0.0"};
  if (idx === 0) {
    display.drawString(`${ip.mac}`, 0, 1);
    display.drawString(`${ip.ip}`, 0, 22);
    display.drawString(`${ip.gw}`, 0, 46);
  } else {
    display.drawString(`${values[idx].id} :`, 0, 0);
    display.setFontVector(18);
    display.drawString(`${values[idx].value}`, 0, 30);
  }
  display.flip();
}

function onInit() {
  displayViewsCount = 12;
  pinMode(pins.buzzer, 'output');
  digitalWrite(pins.buzzer, 0);

  for (var i = 0; i < pins.relays.length; i++) {
    pinMode(pins.relays[i], 'output');
    digitalWrite(pins.relays[i], 0);
    values[7 + i].value = 0;
  }
  I2C1.setup(pins.i2c);
  display = require('SSD1306').connect(I2C1);
  bmp = require('BMP085').connect(I2C1);
  htu = require('HTU21D').connect(I2C1);
  setTimeout(function() {
    var ssid = E.toString(memory.read(0)).trim();
    var password = E.toString(memory.read(1)).trim();
    wifiConnect(ssid, password);
  }, 2000);
  pinMode(pins.button, 'input_pullup');
  setWatch(setDisplayView, pins.button, {repeat: true, edge: 'rising', debounce: 60});
  getValues();
  serverInit();
}

function serverInit() {
  var http = require('http');
  http.createServer(function(req, res) {
    if (req.method === 'GET') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      var data = {};
      for (var i = 0; i < values.length; i++) {
        data[values[i].id] = values[i].value;
      }
      res.end(JSON.stringify(data));
    } else if (req.method === 'POST') {
      var body = '';
      req.on('data', function(chunk) {
        body += chunk;
      });
      req.on('end', function() {
        try {
          var json = JSON.parse(body);
          if (Array.isArray(json) && json.length === pins.relays.length) {
            setRelays(json);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: "success", relays: json}));
          } else {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: "Invalid format or array length"}));
          }
        } catch (e) {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: "Invalid JSON"}));
        }
      });
    } else {
      res.writeHead(405);
      res.end();
    }
  }).listen(80);
}
