import { test, expect } from "@playwright/test";

test.describe("8. Security Smoke Spec", () => {
  test("user cannot fetch another user's problem notes or progress (expect 403 or 404)", async ({
    request,
  }) => {
    // Attempt to access a note belonging to a different ID
    const foreignNoteRes = await request.get("/api/notes/foreign-user-note-id");
    expect([401, 403, 404]).toContain(foreignNoteRes.status());

    // Attempt to access another user's progress by ID
    const foreignProgressRes = await request.get("/api/progress/foreign-user-progress-id");
    expect([401, 403, 404]).toContain(foreignProgressRes.status());
  });

  test("expired or tampered bearer token yields 401 Unauthorized", async ({ request }) => {
    const tamperedRes = await request.get("/api/dashboard", {
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature",
      },
    });

    expect(tamperedRes.status()).toBe(401);
  });
});

