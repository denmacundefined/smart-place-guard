# Smart Place Guard
Smart Place Guard is an all-in-one smart environment controller. It monitors your room's air quality, temperature, and humidity, displays live data on a built-in screen, and lets you remotely control heavy-duty equipment like fans, heaters, or lights using 5 independent relays.

### What it does for you:
* **Real-time Air Quality & Climate Monitoring:** Tracks $CO_2$ levels, flammable gas leaks, precise atmospheric pressure, temperature, and humidity.
* **Smart Local Control:** Automatically triggers actions or lets you switch 5 different relays on/off instantly via a built-in web server or a local physical button.
* **Remote Management (REST API):** Connects to your Wi-Fi network so you can pull live sensor stats as JSON data or change relay states straight from your phone, computer, or home automation system.
* **Rock-Solid Stability:** Built with advanced error-protection (such as an automatic I2C recovery watchdog and filtered analog inputs) to keep the system running 24/7 without crashing or freezing.

## Hardware

Here is schema for creating device based on fritzing:
![smart-place-guard](/fritzing/fritzing-schema.png)

Every element has self identification and you can very easy find where you can get this specific element, also you can see [schema in .fzz](/fritzing/main.fzz)

### Hardware Assembly & Wiring Guidelines

* **Power Distribution & Rail Stability:** The system is engineered to run on a stable external 5V power supply. Due to the high current spikes drawn by the CO2 sensor heater and the 5-channel relay module, ensure your main 5V and GND lines use thick gauge wires. Avoid daisy-chaining power paths to prevent voltage drops that can distort analog sensor readings.
* **Analog Signal Integrity (CO2 & Gas Sensors):** The MG-811 ($CO_2$) and MQ-9 (Gas) sensors output analog signals connected to the ESP32's ADC pins (GPIO 35 and GPIO 34). Because analog lines are prone to electromagnetic interference (EMI), route these wires away from high-voltage relay switching lines and AC mains cables. 
* **Relay Isolation & Back-EMF Protection:** The 5-channel relay board (KY-019 style) handles heavy inductive loads. Ensure the relay board's optocoupler and VCC/GND lines are properly separated or robustly decoupled if sharing the power rail, preventing inductive kickback from resetting the ESP32 microcontroller during relay toggling.
* **I2C Bus Layout (BMP085 & HTU21D):** Both sensors share the I2C bus (SDA: GPIO 21, SCL: GPIO 22). Keep the total trace/wire length as short as possible (under 20-30 cm) and ensure proper pull-up resistors (typically 4.7kΩ) are present on both SDA and SCL lines to guarantee clean signal rise times and prevent bus lockups.
* **Physical Mounting & Thermal Management:** The MG-811 $CO_2$ sensor relies on an internal heating element to maintain its operating temperature. Ensure adequate physical clearance around the sensor module in your enclosure so heat dissipates safely without affecting nearby sensitive components like the HTU21D temperature/humidity sensor.

## Software
### Instalation environment
### Firmware uploading
For upload firmware to LuaNode32 you need upload file [smart_place_guard](/code.js) to device.

## Demo 
#### Videos (prototype)
[![smart-place-guard](http://img.youtube.com/vi/6RgXKTK5o1Y/0.jpg)](http://www.youtube.com/watch?v=6RgXKTK5o1Y)
[![smart-place-guard](http://img.youtube.com/vi/7ZeH6FLk760/0.jpg)](http://www.youtube.com/watch?v=7ZeH6FLk760)

#### Photos (prototype)
![smart-place-guard](/photos/20190131_130801.jpg)
![smart-place-guard](/photos/20190201_181409.jpg)
![smart-place-guard](/photos/20190208_153639.jpg)
