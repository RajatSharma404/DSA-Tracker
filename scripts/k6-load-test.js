import http from "k6/http";
import { check, sleep } from "k6";

// Load test options: Ramp 1 to 50 virtual users over 2 minutes
export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 50 },  // Ramp to 50 users and sustain
    { duration: "30s", target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests must complete below 500ms
    http_req_failed: ["rate<0.01"],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || "http://localhost:5000/api";
const TOKEN = __ENV.BACKEND_JWT || "";

export default function () {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };

  // 1. GET /api/dashboard/bootstrap
  const resBootstrap = http.get(`${BASE_URL}/dashboard/bootstrap`, { headers });
  check(resBootstrap, {
    "bootstrap status is 200": (r) => r.status === 200,
    "bootstrap has user": (r) => r.json("user") !== undefined,
  });

  sleep(0.5);

  // 2. GET /api/review-queue
  const resReview = http.get(`${BASE_URL}/review-queue`, { headers });
  check(resReview, {
    "review queue status is 200": (r) => r.status === 200,
    "review queue has due array": (r) => Array.isArray(r.json("due")),
  });

  sleep(1);
}

