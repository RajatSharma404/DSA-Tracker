const http = require("http");

const options = {
  hostname: "localhost",
  port: 3001,
  path: "/api/learn/tracks",
  method: "GET",
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("\n=== API RESPONSE ===\n");
      console.log(`Number of tracks: ${json.length}`);
      json.forEach((track) => {
        console.log(`\nTrack: ${track.title}`);
        console.log(`Modules: ${track.modules.length}`);
        track.modules.forEach((m) =>
          console.log(`  ${m.orderIndex}. ${m.title}`),
        );
      });
    } catch (e) {
      console.log("Response:", data.substring(0, 500));
    }
  });
});

req.on("error", (e) => console.error("Error:", e.message));
req.end();
