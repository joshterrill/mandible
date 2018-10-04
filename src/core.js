const dotenv = require('dotenv').config();
const say = require('say');
const readline = require('readline');
const YouTube = require('simple-youtube-api');
const yap = require('youtube-audio-player');
const youtube = new YouTube(process.env.YOUTUBE_API);
const Anesidora = require('anesidora');
const pandora = new Anesidora(process.env.PANDORA_EMAIL, process.env.PANDORA_PASSWORD);
const Player = require('player');
const path = require('path');

const http = require('http');
const fs = require('fs-extra');


say.speak('Enter 1 for youtube search or 2 for pandora search');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let mode = '';
let payload = {};
let query = '';
let stopVideoListLoop = true;

const quietKeys = ['escape', 'return', 'enter', 'command', 'control'];

process.on('exit', (code) => {
  say.speak('Goodbye.');
});

process.stdin.on('keypress', (str, key) => {
  if (key) {
    if (quietKeys.indexOf(key.name) === -1) {
      say.stop();
      say.speak(key.name);
    }
    if (key.name === 'escape') {
      // console.log('escpae calling');
      clearState();
      return;
    } else if(key.name === '1' && mode === '') {
      clearState(() => {
        mode = 'youtube';
        say.stop();
        say.speak('What would you like to search youtube for?');
      });
    } else if (key.name === '2' && mode === '') {
      clearState(() => {
        mode = 'pandora';
        say.stop();
        say.speak('What would you like to search pandora for?');
      });
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
    } else if (mode === 'pandora') {
      if (key.name === 'backspace' && query.length > 1) {
        query = query.substring(0, query.length - 1);
        return;
      }
      if (JSON.stringify(payload) === '{}') {
        query += str;
        if (key.name === 'return' || key.name === 'enter') {
          const pandoraSearchTerm = query.replace(query[0], '');
          pandora.login(function(err) {
            pandora.request('music.search', {searchText: pandoraSearchTerm}, (err, searchResults) => {
              if (err) throw err;
              // console.log(searchResults.artists[0].musicToken);
              pandora.request('station.createStation', {musicToken: searchResults.artists[0].musicToken}, (error, stationResults) => {
                pandora.request('station.getPlaylist', {
                    'stationToken': stationResults.stationToken,
                    'additionalAudioUrl': 'HTTP_128_MP3'
                }, (err, playlist) => {
                    if (err) throw err;
                    let track = playlist.items[0];
                    console.log('Playing ' + track.songName + ' by ' + track.artistName);
                    console.log(track.additionalAudioUrl);
                    say.speak('Playing ' + track.songName + ' by ' + track.artistName);
                    let path = __dirname + '/music/' + track.songName.replace(/\//g, '-').trim() + '.mp3';
                    fs.ensureFile(path, (err) => {
                      if (err) throw err;
                      const file = fs.createWriteStream(path);
                      http.get(track.additionalAudioUrl, (response) => {
                        response.pipe(file);
                        response.on('end', () => {
                          const player = new Player(path);
                          player.play((err, player) => {
                            // console.log('playend!');
                          });
                        });
                      });
                    });
                });
              });
            });
          });
        }
      }
    }
  }
});

function clearState(callback) {
  mode = '';
  payload = {};
  query = '';
  let directory = __dirname + '/music';
  fs.readdir(directory, (err, files) => {
    // console.log(err, files);
    if (err) throw err;
    // console.log('going to loop');
    for (const file of files) {
      if (file.includes('mp3')) {
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      }
    }
    if (!callback) {
      process.exit();
    } else {
      callback();
    }
  });
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