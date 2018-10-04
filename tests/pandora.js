const dotenv = require('dotenv').config({path: __dirname + '/../.env'});
const Anesidora = require('anesidora');
const pandora = new Anesidora(process.env.PANDORA_EMAIL, process.env.PANDORA_PASSWORD);
const Player = require('player');

const http = require('http');
const fs = require('fs-extra');

 
pandora.login(function(err) {
    if (err) throw err;
    // pandora.request('user.getStationList', (err, stationList) => {
    //     if (err) throw err;
    //     // list stations
    //     // for (let station of stationList.stations) {
    //     //   console.log(station.stationName);
    //     // }
    //     // play a station
    //     let station = stationList.stations[0];
    //     pandora.request('station.getPlaylist', {
    //         'stationToken': station.stationToken,
    //         'additionalAudioUrl': 'HTTP_128_MP3'
    //     }, (err, playlist) => {
    //         if (err) throw err;
    //         let track = playlist.items[0];
    //         console.log('Playing ' + track.songName + ' by ' + track.artistName);
    //         console.log(track.additionalAudioUrl);
    //         let path = __dirname + '/test/' + track.songName + '.mp3';
    //         fs.ensureFile(path, (err) => {
    //           if (err) throw err;
    //           const file = fs.createWriteStream(path);
    //           http.get(track.additionalAudioUrl, (response) => {
    //             response.pipe(file);
    //             response.on('end', () => {
    //               const player = new Player(path);
    //               player.play((err, player) => {
    //                 console.log('playend!');
    //               });
    //             });
    //           });
    //         });
    //     });
    // });
    pandora.request('music.search', {searchText: 'Matt Schofield'}, (err, searchResults) => {
      if (err) throw err;
      console.log(searchResults.artists[0].musicToken);
      pandora.request('station.createStation', {musicToken: searchResults.artists[0].musicToken}, (error, stationResults) => {
        pandora.request('station.getPlaylist', {
            'stationToken': stationResults.stationToken,
            'additionalAudioUrl': 'HTTP_128_MP3'
        }, (err, playlist) => {
            if (err) throw err;
            let track = playlist.items[0];
            console.log('Playing ' + track.songName + ' by ' + track.artistName);
            console.log(track.additionalAudioUrl);
            let path = __dirname + '/test/' + track.songName + '.mp3';
            fs.ensureFile(path, (err) => {
              if (err) throw err;
              const file = fs.createWriteStream(path);
              http.get(track.additionalAudioUrl, (response) => {
                response.pipe(file);
                response.on('end', () => {
                  const player = new Player(path);
                  player.play((err, player) => {
                    console.log('playend!');
                  });
                });
              });
            });
        });
      });
    });
});