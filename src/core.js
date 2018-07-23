const dotenv = require('dotenv').config();
const async = require('async');
const say = require('say');
const readline = require('readline');
const YouTube = require('simple-youtube-api');
const yap = require('youtube-audio-player');
const youtube = new YouTube(process.env.YOUTUBE_API);

say.speak('Enter 1 for youtube search!');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let mode = '';
let payload = {};
let query = '';
let stopVideoListLoop = true;

const quietKeys = ['escape', 'return', 'enter', 'command', 'control'];

process.on('exit', (code) => {
  clearState();
  say.speak('Goodbye.');
});

process.stdin.on('keypress', (str, key) => {
  if (key) {
    if (quietKeys.indexOf(key.name) === -1) {
      say.stop();
      say.speak(key.name);
    }
    if (key.name === 'escape') {
      process.exit();
      return;
    } else if(key.name === '1' && mode === '') {
      clearState();
      mode = 'youtube';
      say.stop();
      say.speak('What would you like to search for?');
    }
    // logic for different modes
    if (mode === 'youtube') {
      if (key.name === 'backspace' && query.length > 1) {
        query = query.substring(0, query.length - 1);
        return;
      }
      if (JSON.stringify(payload) === '{}') {
        query += str;
        if (key.name === 'return' || key.name === 'enter') {
          const youtubeSearchTerm = query.replace(query[0], '');
          youtube.searchVideos(youtubeSearchTerm, 9)
            .then(videos => {
              status = 'videos';
              payload = {
                videos,
                chosenVideo: -1
              }
              say.stop();
              say.speak(`Showing videos for ${youtubeSearchTerm}`, undefined, undefined, (err) => {
                stopVideoListLoop = false;
                processVideos(videos);
              });
            }).catch(console.log);
        }
      } else if(JSON.stringify(payload) !== '{}' && payload.chosenVideo === -1) {
        stopVideoListLoop = true;
        payload.chosenVideo = key.name;
        say.stop();
        say.speak('Playing video.', undefined, undefined, (err) => {
          yap.play({ url: `http://youtube.com/watch?v=${payload.videos[parseInt(payload.chosenVideo) - 1].id}` });
        });
      }
    }
  }
});

function clearState() {
  mode = '';
  payload = {};
  query = '';
}

async function processVideos(videos) {
  for (let [index, video] of videos.entries()) {
    if (stopVideoListLoop) {
      break;
    }
    await (new Promise((resolve, reject) => {
      say.speak(`Video ${index + 1}... Title. ${video.title}`, undefined, undefined, (err) => {
        resolve();
      });
    }));
  }

  say.stop();
  say.speak('What video number do you want to play?');
}