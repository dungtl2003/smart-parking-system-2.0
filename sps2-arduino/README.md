# Arduino Mega 2560

- Build code

```C++
platformio run
```

- Upload code: need to unplug/disable the serial connection before uploading code

```C++
platformio run --target upload --upload-port /dev/ttyACM0
```
