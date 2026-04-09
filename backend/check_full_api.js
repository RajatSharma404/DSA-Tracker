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
      console.log("\n=== FULL API RESPONSE ===\n");
      const track = json[0];
      console.log(`Track: ${track.title}`);
      console.log(`Total modules in track: ${track.modules.length}`);

      track.modules.forEach((m, idx) => {
        console.log(`\n[${idx + 1}] ${m.title}`);
        console.log(`    Lessons: ${m.lessons ? m.lessons.length : "NONE"}`);
        if (m.lessons && m.lessons.length > 0) {
          m.lessons.forEach((l) => console.log(`      - ${l.title}`));
        }
      });
    } catch (e) {
      console.log("Error parsing response:", e.message);
      console.log("Raw data:", data.substring(0, 1000));
    }
  });
});

req.on("error", (e) => console.error("Error:", e.message));
req.end();
