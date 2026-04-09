const http = require("http");

const options = {
  hostname: "localhost",
  port: 3001,
  path: "/api/learn/tracks",
  method: "GET",
};

console.log("Making request to /api/learn/tracks...\n");

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}\n`);

  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("RESPONSE LENGTH:", data.length, "characters\n");
      console.log("PARSED JSON:");
      console.log(JSON.stringify(json, null, 2).substring(0, 2000));
      console.log("\n...[truncated]\n");
      console.log("Total tracks:", json.length);
      if (json.length > 0) {
        json.forEach((t, idx) => {
          console.log(
            `${idx + 1}. ${t.title} (${t.modules?.length || 0} modules)`,
          );
        });
      }
    } catch (e) {
      console.log("ERROR PARSING JSON:", e.message);
      console.log("Response:", data.substring(0, 500));
    }
  });
});

req.on("error", (e) => console.error("Request error:", e.message));
req.end();
