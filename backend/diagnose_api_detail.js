const http = require("http");

const options = {
  hostname: "localhost",
  port: 3001,
  path: "/api/learn/tracks",
  method: "GET",
};

let data = "";
const req = http.request(options, (res) => {
  console.log(`\n=== API RESPONSE ===`);
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: Content-Type = ${res.headers["content-type"]}`);

  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log(`\nResponse is array: ${Array.isArray(json)}`);
      console.log(`Number of tracks: ${json.length}`);

      if (json.length > 0) {
        const track = json[0];
        console.log(`\nFirst track: ${track.title}`);
        console.log(`  - slug: ${track.slug}`);
        console.log(`  - id: ${track.id}`);
        console.log(
          `  - modules: ${Array.isArray(track.modules) ? track.modules.length : "NOT AN ARRAY"}`,
        );

        if (Array.isArray(track.modules)) {
          console.log(`\n=== MODULES IN RESPONSE ===`);
          track.modules.forEach((m, idx) => {
            console.log(
              `${idx + 1}. ${m.title} (${m.lessons ? m.lessons.length : "?"} lessons)`,
            );
          });
        }
      }
    } catch (e) {
      console.log("Response is not JSON:");
      console.log(data.substring(0, 500));
    }
  });
});

req.on("error", (e) => console.error("Error:", e.message));
req.end();
