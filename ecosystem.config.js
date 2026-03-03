module.exports = {
    apps: [
        {
            name: "dsa-backend",
            cwd: "./backend",
            script: "npm.cmd",
            args: "run dev",
            watch: ["index.ts", "services.ts", "aiService.ts", "leetcodeService.ts"],
            ignore_watch: ["node_modules"],
            env: {
                NODE_ENV: "development",
            },
        },
        {
            name: "dsa-frontend",
            cwd: "./frontend",
            script: "npm.cmd",
            args: "run dev",
            watch: false,
            env: {
                NODE_ENV: "development",
            },
        },
    ],
};
