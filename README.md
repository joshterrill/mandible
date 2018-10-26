# mandible

a blind-friendly nodejs application to run on raspian

### pre-requisites
* ffmpeg (`brew install ffmpeg` note: you may need to `brew update` first)
* change `.env.example` to .`env`
* youtube data API key in `.env` file
* pandora email and password in `.env` file

### features
* ability to download youtube audio and pandora audio
* ability to have file system that can be searched and controlled by user
* speech to text for youtube/pandora/file system searching
* configurable output events for connecting buttons onto raspberry pi board
