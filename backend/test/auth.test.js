const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const app = require("../server");
const Incident = require("../models/Incident");

const secret = "trafficshield_super_secret_2026";
const validAdminToken = jwt.sign({ id: "admin-1", role: "admin" }, secret, {
  expiresIn: "1h",
});
const validPoliceToken = jwt.sign({ id: "police-1", role: "police" }, secret, {
  expiresIn: "1h",
});

const protectedRoutes = [
  {
    name: "POST /api/incident",
    method: "POST",
    path: "/api/incident",
    body: {
      location: "Sadar",
      type: "Accident",
      severity: "High",
    },
  },
  {
    name: "GET /api/incidents",
    method: "GET",
    path: "/api/incidents",
    body: null,
  },
];

for (const route of protectedRoutes) {
  test(`${route.name} rejects requests without a JWT token`, async () => {
    const server = app.listen(0);
    const { port } = server.address();

    try {
      const response = await fetch(`http://127.0.0.1:${port}${route.path}`, {
        method: route.method,
        headers: route.body ? { "Content-Type": "application/json" } : {},
        body: route.body ? JSON.stringify(route.body) : undefined,
      });

      assert.equal(response.status, 401);
      const body = await response.json();
      assert.equal(body.error, "Access denied. Please login.");
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  });
}

test("POST /api/incident allows admin users with a valid JWT token", async () => {
  const server = app.listen(0);
  const { port } = server.address();
  const originalCreate = Incident.create;
  Incident.create = async (incident) => ({ _id: "incident-1", ...incident });

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/incident`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${validAdminToken}`,
      },
      body: JSON.stringify({
        location: "Sadar",
        type: "Accident",
        severity: "High",
      }),
    });

    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(body.location, "Sadar");
  } finally {
    Incident.create = originalCreate;
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

test("POST /api/incident rejects police users from admin-only actions", async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/incident`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${validPoliceToken}`,
      },
      body: JSON.stringify({
        location: "Sadar",
        type: "Accident",
        severity: "High",
      }),
    });

    assert.equal(response.status, 403);
    const body = await response.json();
    assert.equal(body.error, "You do not have permission.");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});
