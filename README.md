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
