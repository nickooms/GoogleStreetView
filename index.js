const querystring = require('querystring');
const fetch = require('node-fetch');
const http = require('http');

const StreetView = require('./StreetView');

const server = http.createServer(async (req, res) => {
  const { longitude, latitude } = querystring.parse(req.url);
  if (longitude && latitude) {
    const location = { longitude: parseFloat(longitude), latitude: parseFloat(latitude) };
    let url = StreetView.url(location);
    const metadata = StreetView.metadata(location);
    const result = await fetch(metadata);
    const json = await result.json();
    if (json.pano_id) {
      url = StreetView.pano({ pano: json.pano_id });
    }
    res.end(`
<html>
  <head>
    <style>
      body {
        margin: 0px;
      }
    </style>
  </head>
  <body>
    <img src="${url}">
  </body>
</html>
`);
  } else {
    res.end(`
  <script>
    function getCurrentLocation(options) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, ({ code, message }) =>
          reject(Object.assign(new Error(message), { name: 'PositionError', code })),
          options);
        });
    };
    async function inout() {
      try {
        const { coords } = await this.getCurrentLocation({ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        console.log(coords);
        document.location.href = '/location&longitude=' + coords.longitude + '&latitude=' + coords.latitude;
      } catch (e) {
        if (e.name == 'PositionError') {
          console.log(e.message + '. code = ' + e.code);
        }
      }
    }
    inout().catch(e => console.log(e));
</script>
`   );
  }
});
server.listen(4444);
