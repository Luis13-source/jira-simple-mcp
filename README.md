# Jira Simple MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0.0-blue.svg)](https://modelcontextprotocol.io/)

Simple and efficient MCP (Model Context Protocol) server for Jira integration. Allows AI assistants to access issues, projects, and perform searches in your Jira system.

## 🚀 Features

- **Get your issues** - view all issues assigned to the current user
- **Search issues** - use JQL (Jira Query Language) for flexible searching
- **Detailed issue information** - complete information about a specific issue with comments
- **Project listing** - view all available projects
- **Russian localization** - all responses in Russian with emojis for better readability

## 📋 Available Tools

### `get_my_issues`

Gets all issues assigned to the current user.

**Parameters:**

- `maxResults` (number, optional) - Maximum number of issues to return (default: 50)

**Usage example:**

```javascript
// Get 20 of my issues
get_my_issues({ maxResults: 20 });
```

### `search_issues`

Performs issue search using JQL.

**Parameters:**

- `jql` (string, required) - JQL query
- `maxResults` (number, optional) - Maximum number of issues to return (default: 50)

**JQL query examples:**

```javascript
// High priority issues
search_issues({ jql: "priority = High" });

// Issues in "In Progress" status
search_issues({ jql: 'status = "In Progress"' });

// Issues from the last week
search_issues({ jql: "created >= -7d" });
```

### `get_issue`

Gets detailed information about a specific issue.

**Parameters:**

- `issueKey` (string, required) - Issue key (e.g., "PROJ-123")

**Usage example:**

```javascript
get_issue({ issueKey: "PROJ-123" });
```

### `get_projects`

Gets list of all available projects.

**Parameters:** None

## 🛠 Installation

### Prerequisites

- Node.js 18 or higher
- Jira account with API access
- Jira API token

### Installation Steps

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/jira-simple-mcp.git
cd jira-simple-mcp
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"
```

### Getting Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give the token a descriptive name
4. Copy the generated token

## ⚙️ Configuration

### Environment Variables

| Variable         | Description             | Example                         |
| ---------------- | ----------------------- | ------------------------------- |
| `JIRA_URL`       | URL of your Jira system | `https://company.atlassian.net` |
| `JIRA_EMAIL`     | Your email in Jira      | `user@company.com`              |
| `JIRA_API_TOKEN` | Jira API token          | `ATATT3xFfGF0...`               |

### Configuration File (.env)

Create a `.env` file in the project root:

```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token-here
```

## 🚀 Running

### Local execution

```bash
node jira-mcp-simple.js
```

### Install as global package

```bash
npm install -g .
jira-simple-mcp
```

## 🔧 AI Assistant Integration

### Claude Desktop

Add to Claude Desktop configuration file (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "jira-simple": {
      "command": "node",
      "args": ["/path/to/jira-simple-mcp/jira-mcp-simple.js"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Other MCP Clients

The server uses standard MCP protocol over stdio, so it's compatible with any MCP-compatible clients.

## 📖 Usage Examples

### Getting my issues

```
Show me all my open issues
```

### Searching issues by criteria

```
Find all high priority issues in the "WEB" project
```

### Detailed issue information

```
Tell me in detail about issue PROJ-123
```

### Working with projects

```
Show all available projects
```

## 🔒 Security

- API tokens are stored in environment variables
- Uses Basic Authentication to connect to Jira API
- All requests are made over HTTPS
- Server does not store data locally

## 🐛 Debugging

### Enable verbose logging

```bash
DEBUG=* node jira-mcp-simple.js
```

### Check connection

```bash
# Check environment variables
echo $JIRA_URL
echo $JIRA_EMAIL
echo $JIRA_API_TOKEN

# Test API request
curl -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Accept: application/json" \
  "$JIRA_URL/rest/api/3/myself"
```

## 🤝 Contributing

We welcome contributions to the project! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Code Requirements

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Use JavaScript for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter problems or have questions:

1. Check [Issues](https://github.com/yourusername/jira-simple-mcp/issues) on GitHub
2. Create a new Issue with detailed problem description
3. Attach error logs and system information

## 🔄 Changelog

### v1.0.0

- Initial release
- Basic functions for working with issues and projects
- JQL search support
- Russian interface localization

## 📚 Useful Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [JQL Syntax Guide](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-in-jira-cloud-jql/)
- [Claude Desktop MCP Integration](https://docs.anthropic.com/claude/desktop/mcp)

## ⭐ Stars

If this project helped you, give it a star ⭐ on GitHub!

---

**Made with ❤️ for the developer community**
