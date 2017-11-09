const YouTube = require('simple-youtube-api');
const youtube = new YouTube(process.env.YOUTUBE_API);
const yap = require('youtube-audio-player');


youtube.searchVideos('Centuries', 4)
  .then(results => {
      console.log(`Playing video with id: ${results[0].id}`);
      yap.play({ url: `http://youtube.com/watch?v=${results[0].id}`});
  })
  .catch(console.log);
