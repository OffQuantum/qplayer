const http = require('http');
const https = require('https');

https.get('https://api.allorigins.win/raw?url=http://tv.smartpars.xyz:8080/player_api.php?username=a&password=b', (res) => {
  console.log('allorigins status:', res.statusCode);
  console.log('allorigins headers:', res.headers);
}).on('error', (e) => {
  console.error('allorigins error:', e.message);
});

https.get('https://corsproxy.io/?url=http://tv.smartpars.xyz:8080/player_api.php?username=a&password=b', (res) => {
  console.log('corsproxy status:', res.statusCode);
  console.log('corsproxy headers:', res.headers);
}).on('error', (e) => {
  console.error('corsproxy error:', e.message);
});
