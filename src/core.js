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

const quietKeys = ['escape', 'return', 'enter', 'command', 'control'];

process.on('exit', (code) => {
  clearState();  
  say.speak('Goodbye.');
});
// TODO: figure out how to restart app w/ child_process.spawn('node', ['index.js']);

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
          // TODO: figure out way to solve the number 1 getting added to beginning after choosing 1 as an option
          const youtubeSearchTerm = query.replace(query[0], '');
          
          youtube.searchVideos(youtubeSearchTerm, 1)
            .then(videos => {
              status = 'videos';
              payload = {
                videos,
                chosenVideo: -1
              }
              say.stop();
              say.speak(`Showing videos for ${youtubeSearchTerm}`, undefined, undefined, (err) => {
                async.forEachOf(videos, (video, index, callback) => { 
                  // TODO: figure out how to not continue for each until speak is done
                  say.speak(`Video ${index + 1}... Title. ${video.title}`, undefined, undefined, (err) => {
                    callback();
                  });
                }, (err) => {
                  say.stop();
                  say.speak('What video number do you want to play?');
                });
              });
            }).catch(console.log);
        }
      } else if(JSON.stringify(payload) !== '{}' && payload.chosenVideo === -1) {
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