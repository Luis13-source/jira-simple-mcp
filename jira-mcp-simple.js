#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const JIRA_URL = process.env.JIRA_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error(
    "❌ Authentication Error: Jira authentication required. Set JIRA_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables."
  );
  process.exit(1);
}

const server = new Server({ name: "jira-simple-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

async function callJiraAPI(endpoint, method = "GET", body = null) {
  const url = `${JIRA_URL}/rest/api/3${endpoint}`;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

  const options = {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${text}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Network error connecting to Jira API:", error.message);
    throw new Error(`Network error: ${error.message}`);
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_my_issues",
        description: "Get issues assigned to current user",
        inputSchema: {
          type: "object",
          properties: {
            maxResults: {
              type: "number",
              description: "Maximum number of issues to return (default: 50)",
              default: 50
            }
          }
        }
      },
      {
        name: "search_issues",
        description: "Search for issues using JQL",
        inputSchema: {
          type: "object",
          properties: {
            jql: {
              type: "string",
              description: "JQL query string"
            },
            maxResults: {
              type: "number",
              description: "Maximum number of issues to return (default: 50)",
              default: 50
            }
          },
          required: ["jql"]
        }
      },
      {
        name: "get_projects",
        description: "Get list of projects",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_issue",
        description: "Get detailed information about a specific issue",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: {
              type: "string",
              description: "Issue key (e.g., LB-8283)"
            }
          },
          required: ["issueKey"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "get_my_issues": {
        const { maxResults = 50 } = request.params.arguments || {};
        const result = await callJiraAPI(`/search/jql?jql=assignee=currentUser()&maxResults=${maxResults}`);

        const issues = result.issues.map((issue) => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name || "None",
          type: issue.fields.issuetype.name,
          project: issue.fields.project.name,
          assignee: issue.fields.assignee?.displayName || "Unassigned",
          reporter: issue.fields.reporter?.displayName || "Unknown",
          created: issue.fields.created,
          updated: issue.fields.updated,
          url: `${JIRA_URL}/browse/${issue.key}`
        }));

        return {
          content: [
            {
              type: "text",
              text: `# 📋 My Issues (${issues.length})\n\n${issues
                .map(
                  (issue) =>
                    `## 🎫 ${issue.key}: ${issue.summary}\n` +
                    `- **Status:** ${issue.status}\n` +
                    `- **Priority:** ${issue.priority}\n` +
                    `- **Type:** ${issue.type}\n` +
                    `- **Project:** ${issue.project}\n` +
                    `- **Updated:** ${new Date(issue.updated).toLocaleString("en-US")}\n` +
                    `- [Open in Jira](${issue.url})\n`
                )
                .join("\n")}`
            }
          ]
        };
      }

      case "search_issues": {
        const { jql, maxResults = 50 } = request.params.arguments || {};
        const result = await callJiraAPI(`/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}`);

        const issues = result.issues.map((issue) => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name || "None",
          type: issue.fields.issuetype.name,
          project: issue.fields.project.name,
          assignee: issue.fields.assignee?.displayName || "Unassigned",
          reporter: issue.fields.reporter?.displayName || "Unknown",
          created: issue.fields.created,
          updated: issue.fields.updated,
          url: `${JIRA_URL}/browse/${issue.key}`
        }));

        return {
          content: [
            {
              type: "text",
              text: `# 🔍 Search Results (${issues.length})\n\n**JQL:** \`${jql}\`\n\n${issues
                .map(
                  (issue) =>
                    `## 🎫 ${issue.key}: ${issue.summary}\n` +
                    `- **Status:** ${issue.status}\n` +
                    `- **Priority:** ${issue.priority}\n` +
                    `- **Type:** ${issue.type}\n` +
                    `- **Project:** ${issue.project}\n` +
                    `- **Assignee:** ${issue.assignee}\n` +
                    `- **Updated:** ${new Date(issue.updated).toLocaleString("en-US")}\n` +
                    `- [Open in Jira](${issue.url})\n`
                )
                .join("\n")}`
            }
          ]
        };
      }

      case "get_projects": {
        const result = await callJiraAPI("/project");

        // Handle both array and object with values
        const projects = Array.isArray(result) ? result : result.values || [];

        const projectList = projects.map((project) => ({
          id: project.id,
          key: project.key,
          name: project.name,
          projectType: project.projectTypeKey,
          url: `${JIRA_URL}/browse/${project.key}`
        }));

        return {
          content: [
            {
              type: "text",
              text: `# 📁 Projects (${projectList.length})\n\n${projectList
                .map(
                  (project) =>
                    `## ${project.key}: ${project.name}\n` +
                    `- **ID:** ${project.id}\n` +
                    `- **Type:** ${project.projectType}\n` +
                    `- [Open in Jira](${project.url})\n`
                )
                .join("\n")}`
            }
          ]
        };
      }

      case "get_issue": {
        const { issueKey } = request.params.arguments || {};
        if (!issueKey) {
          throw new Error("Issue key is required");
        }

        const result = await callJiraAPI(`/issue/${issueKey}?expand=description,comments`);

        const issue = {
          key: result.key,
          summary: result.fields.summary,
          status: result.fields.status.name,
          priority: result.fields.priority?.name || "None",
          type: result.fields.issuetype.name,
          project: result.fields.project.name,
          assignee: result.fields.assignee?.displayName || "Unassigned",
          reporter: result.fields.reporter?.displayName || "Unknown",
          created: result.fields.created,
          updated: result.fields.updated,
          description: result.fields.description || "No description",
          url: `${JIRA_URL}/browse/${result.key}`,
          comments:
            result.fields.comment?.comments?.map((comment) => ({
              author: comment.author.displayName,
              body: comment.body,
              created: comment.created
            })) || []
        };

        return {
          content: [
            {
              type: "text",
              text:
                `# 🎫 ${issue.key}: ${issue.summary}\n\n` +
                `## 📋 Basic Information\n` +
                `- **Status:** ${issue.status}\n` +
                `- **Priority:** ${issue.priority}\n` +
                `- **Type:** ${issue.type}\n` +
                `- **Project:** ${issue.project}\n` +
                `- **Assignee:** ${issue.assignee}\n` +
                `- **Reporter:** ${issue.reporter}\n` +
                `- **Created:** ${new Date(issue.created).toLocaleString("en-US")}\n` +
                `- **Updated:** ${new Date(issue.updated).toLocaleString("en-US")}\n\n` +
                `## 📝 Description\n${issue.description}\n\n` +
                `${
                  issue.comments.length > 0
                    ? `## 💬 Recent Comments (${issue.comments.length})\n${issue.comments
                        .map(
                          (comment) =>
                            `**${comment.author}** (${new Date(comment.created).toLocaleString("en-US")}):\n${
                              comment.body
                            }`
                        )
                        .join("\n\n")}`
                    : ""
                }\n\n` +
                `## 🔗 Links\n- [Open in Jira](${issue.url})`
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${error.message}`
        }
      ]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Jira Simple MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
