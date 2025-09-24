#!/usr/bin/env node
import "dotenv/config";

const JIRA_URL = process.env.JIRA_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error("❌ Set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN in .env file");
  process.exit(1);
}

async function getIssue(issueKey) {
  if (!issueKey) {
    console.error("❌ Usage: node test.js <ISSUE_KEY>");
    console.error("   Example: node test.js LB-8421");
    process.exit(1);
  }

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

  try {
    // Получаем конкретную задачу
    const url = `${JIRA_URL}/rest/api/3/issue/${issueKey}?expand=description,comments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${text}`);
    }

    const issue = await response.json();

    console.log(`🎫 ${issue.key}: ${issue.fields.summary}\n`);
    console.log(`📊 Status: ${issue.fields.status.name}`);
    console.log(`⚡ Priority: ${issue.fields.priority?.name || "None"}`);
    console.log(`🏷️ Type: ${issue.fields.issuetype.name}`);
    console.log(`📁 Project: ${issue.fields.project.name}`);
    console.log(`👤 Assignee: ${issue.fields.assignee?.displayName || "Unassigned"}`);
    console.log(`👤 Reporter: ${issue.fields.reporter?.displayName || "Unknown"}`);
    console.log(`📅 Created: ${new Date(issue.fields.created).toLocaleString()}`);
    console.log(`🔄 Updated: ${new Date(issue.fields.updated).toLocaleString()}\n`);

    // Тестируем исправление описания
    let description = "No description";
    if (issue.fields.description) {
      if (typeof issue.fields.description === "string") {
        description = issue.fields.description;
      } else if (issue.fields.description.content) {
        // ADF format
        const extractText = (node) => {
          if (node.type === "text") return node.text || "";
          if (node.content) return node.content.map(extractText).join("");
          return "";
        };
        description = extractText(issue.fields.description).trim() || "No description";
      }
    }

    console.log(`📝 Description:\n${description}\n`);

    // Комментарии
    if (issue.fields.comment?.comments?.length > 0) {
      console.log(`💬 Comments (${issue.fields.comment.comments.length}):`);
      issue.fields.comment.comments.forEach((comment, index) => {
        let commentBody = "No comment text";
        if (comment.body) {
          if (typeof comment.body === "string") {
            commentBody = comment.body;
          } else if (comment.body.content) {
            const extractText = (node) => {
              if (node.type === "text") return node.text || "";
              if (node.content) return node.content.map(extractText).join("");
              return "";
            };
            commentBody = extractText(comment.body).trim() || "No comment text";
          }
        }

        console.log(`  ${index + 1}. ${comment.author.displayName} (${new Date(comment.created).toLocaleString()}):`);
        console.log(`     ${commentBody}\n`);
      });
    }

    console.log(`🔗 Link: ${JIRA_URL}/browse/${issue.key}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

const issueKey = process.argv[2];
getIssue(issueKey);
