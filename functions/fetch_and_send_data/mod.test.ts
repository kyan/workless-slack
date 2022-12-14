import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.162.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.162.0/testing/mock.ts";
import handler from "./mod.ts";

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/chat.postMessage", async (req) => {
  const body = await req.formData();
  if (body.get("channel")?.toString() !== "U22222") {
    return new Response(`{"ok": false, "error": "unexpected channel ID"}`, {
      status: 200,
    });
  }
  if (body.get("blocks") === undefined) {
    return new Response(`{"ok": false, "error": "blocks are missing!"}`, {
      status: 200,
    });
  }
  return new Response(`{"ok": true, "message": {"ts": "111.222"}}`, {
    status: 200,
  });
});

mf.mock("POST@/api/users.list", () => {
  return new Response(`{"members": [] }`, {
    status: 200,
  });
});

mf.mock("GET@/", () => {
  return new Response(`{"users": [] }`, {
    status: 200,
  });
});

const { createContext } = SlackFunctionTester("my-function");

Deno.test("FetchAndSendDataFunction runs successfully", async () => {
  stub(console, "log");

  const inputs = {
    recipient: "U22222",
    start_date: "2022-03-01",
    interactivity: {
      interactivity_pointer: "111.222.b79....",
      interactor: {
        id: "U33333",
        secret: "NDE0NTIxNDg....",
      },
    },
    "interactivity.interactor": {
      id: "U33333",
      secret: "NDE0NTIxNDg....",
    },
    "interactivity.interactor.id": "U03E94MK0",
    "interactivity.interactor.secret": "NDE0NTIxNDg....",
    "interactivity.interactivity_pointer": "111.222.b79....",
  };
  const env = {
    LOG_LEVEL: "ERROR",
    API_URL: "http://api.com",
    API_TOKEN: "abc123",
  };
  const result = await handler(createContext({ inputs, env }));
  assertEquals(result, { outputs: {} });
});
