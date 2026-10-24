// plugin-terraform-mcp
// Works with Terraform and the registry.
// Grant requested: comment-task (the plugin only ever returns comment operations).

const MCP_SERVER_KEY = "terraform";
const MCP_SERVER_CONFIG = {
  "command": "npx",
  "args": [
    "-y",
    "terraform-mcp-server"
  ]
};
const SETUP_STEPS = [
  "Install OpenTofu or Terraform in the agent image (already in the default image).",
  "Add the entry to the workspace MCP configuration.",
  "Cloud credentials come from the workspace vault bindings."
];
const DOCS_URL = "https://www.npmjs.com/package/terraform-mcp-server";
const MAX_COMMENT_LENGTH = 10000;

function asString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

export function buildSetupComment(event) {
  const lines = [];
  lines.push("### Terraform MCP — workspace configuration");
  lines.push("");
  lines.push("This workspace has the **Terraform MCP** plugin installed.");
  lines.push("It installs and configures the Terraform MCP server: the agent can then search providers and modules, read registry docs, and plan and validate configurations with Terraform tooling.");
  const title = asString(event && event.taskTitle);
  if (title) {
    lines.push("");
    lines.push("Task: **" + title + "**");
  }
  lines.push("");
  lines.push("Add this entry to the workspace `mcp.servers` configuration:");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify({ [MCP_SERVER_KEY]: MCP_SERVER_CONFIG }, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("**Setup**");
  for (let i = 0; i < SETUP_STEPS.length; i++) {
    lines.push((i + 1) + ". " + SETUP_STEPS[i]);
  }
  lines.push("");
  lines.push("Docs: " + DOCS_URL);
  let text = lines.join("\n");
  if (text.length > MAX_COMMENT_LENGTH) {
    text = text.slice(0, MAX_COMMENT_LENGTH - 3) + "...";
  }
  return text;
}

export async function taskCreated(event) {
  const text = buildSetupComment(event);
  if (!text) return [];
  return [{ type: "comment", value: text }];
}

export const hooks = {
  "task.created": taskCreated,
};
