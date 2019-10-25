# smart-place-guard
Device based on esp32 together with espruino for sending air measurements to smart-place platform

## Hardware
Here is schema for creating device based on fritzing:
![smart-place-guard](/fritzing/fritzing-schema.png)
Every element has self identification and you can very easy find where you can get this specific element, also you can see [schema in .fzz](/fritzing/main.fzz)

## Software
For upload firmware to arduino nano you need get Arduino IDE, configure connection with arduino nano board and upload file [smart_place_watcher.ino](smart_place_watcher/smart_place_watcher.ino) to device.
**Also for uploading you need next packages:**
* Adafruit_GFX.h
* Adafruit_PCD8544.h
* DHT.h
* Adafruit_BMP085.h
* RTClib.h

## Demo

### Video (device in work)
[![smart-place-guard](http://img.youtube.com/vi/6RgXKTK5o1Y/0.jpg)](http://www.youtube.com/watch?v=6RgXKTK5o1Y)

### Photos (creating time and final version)
![smart-place-guard](/smart-watcher.png)
