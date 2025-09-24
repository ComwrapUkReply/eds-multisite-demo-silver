# Jira-GitHub Integration Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing a comprehensive Jira-GitHub integration using GitHub Actions. The integration automatically posts commit details to Jira tickets when commits contain Jira issue keys, with support for hyperlinks, pull requests, and demo pages.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Jira Setup](#jira-setup)
3. [GitHub Setup](#github-setup)
4. [Workflow Implementation](#workflow-implementation)
5. [Commit Message Format](#commit-message-format)
6. [Features](#features)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

## Prerequisites

### Required Access
- **Jira Admin Access**: Ability to create API tokens and manage project permissions
- **GitHub Repository Admin**: Access to repository settings and secrets
- **GitHub Actions**: Enabled for the repository

### Required Tools
- Git command line interface
- GitHub CLI (optional but recommended)
- Text editor for YAML configuration

## Jira Setup

### Step 1: Generate Jira API Token

1. **Navigate to Atlassian Account Settings**:
   - Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Or visit [https://id.atlassian.com](https://id.atlassian.com) → Your Profile → Security → API tokens

2. **Create API Token**:
   - Click "Create API token"
   - Provide a descriptive label: `GitHub Actions Jira Integration`
   - Click "Create"
   - **Important**: Copy the token immediately (format: `ATATT3xFfGF0...`)

3. **Required Permissions**:
   - Account owner or organization admin
   - Site admin rights on the Jira instance
   - Permission to comment on issues in target projects

### Step 2: Identify Jira Instance Details

- **Jira Base URL**: Your Jira instance URL (e.g., `https://yourcompany.atlassian.net`)
- **Email Address**: Your Jira account email
- **Project Keys**: Identify the project keys you'll be using (e.g., `EDGE`, `PROJ`)

## GitHub Setup

### Step 1: Configure Repository Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `JIRA_BASE_URL` | Your Jira instance URL | `https://yourcompany.atlassian.net` |
| `JIRA_EMAIL` | Your Jira account email | `your.email@company.com` |
| `JIRA_API_TOKEN` | API token from Jira | `ATATT3xFfGF0...` |

### Step 2: Verify GitHub Actions Access

1. Go to repository Settings → Actions → General
2. Ensure "Allow all actions and reusable workflows" is selected
3. Verify "Allow GitHub Actions to create and approve pull requests" is enabled

## Workflow Implementation

### Step 1: Create the Workflow File

Create `.github/workflows/jira-comment.yml` in your repository:

```yaml
name: Comment commits to Jira

on:
  push:
    branches: ["**"]

jobs:
  comment:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout (no need to fetch history for this job)
        uses: actions/checkout@v4

      - name: Extract commits JSON
        id: commits
        run: |
          echo 'commits<<EOF' >> $GITHUB_OUTPUT
          echo '${{ toJson(github.event.commits) }}' >> $GITHUB_OUTPUT
          echo 'EOF' >> $GITHUB_OUTPUT

      - name: Build Jira comments per issue
        id: build
        run: |
          python3 - << 'PY'
          import json, re, os
          
          commits_json = os.environ.get("COMMITS", "[]")
          if not commits_json or commits_json.strip() == "":
              commits_json = "[]"
          
          try:
              commits = json.loads(commits_json)
          except json.JSONDecodeError as e:
              print(f"Error parsing commits JSON: {e}")
              print(f"Commits data: {commits_json}")
              commits = []
          
          if not commits:
              print("No commits found, skipping Jira comment generation")
              with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
                  f.write("payloads=[]\n")
              exit(0)
          
          key_re = re.compile(r"\b[A-Z][A-Z0-9]+-\d+\b")
          by_issue = {}
          
          def create_adf_hyperlink(text, url):
              """Create ADF hyperlink structure"""
              return {
                  "type": "text",
                  "text": text,
                  "marks": [
                      {
                          "type": "link",
                          "attrs": {
                              "href": url
                          }
                      }
                  ]
              }
          
          def create_adf_text(text):
              """Create plain ADF text"""
              return {
                  "type": "text",
                  "text": text
              }
          
          def convert_urls_in_text(text):
              """Convert any URLs in text to ADF hyperlink format"""
              import re
              url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+[^\s<>"{}|\\^`\[\].,;:!?\'")\]]'
              
              result = []
              last_end = 0
              
              for match in re.finditer(url_pattern, text):
                  # Add text before the URL
                  if match.start() > last_end:
                      before_text = text[last_end:match.start()]
                      if before_text:
                          result.append(create_adf_text(before_text))
                  
                  # Add the URL as hyperlink
                  url = match.group(0)
                  # Clean up any trailing punctuation that might have been included
                  url = url.rstrip('.,;:!?"\'/)')
                  
                  # Create a shortened display text for long URLs
                  if len(url) > 60:
                      display_text = url[:30] + "..." + url[-27:]
                  else:
                      display_text = url
                  
                  result.append(create_adf_hyperlink(display_text, url))
                  last_end = match.end()
              
              # Add any remaining text after the last URL
              if last_end < len(text):
                  remaining_text = text[last_end:]
                  if remaining_text:
                      result.append(create_adf_text(remaining_text))
              
              # If no URLs were found, return the original text as ADF text
              if not result:
                  result.append(create_adf_text(text))
              
              return result
          
          for c in commits:
              msg = f"{c['message']}".strip()
              commit_url = c.get('url') or f"{os.environ['GITHUB_SERVER_URL']}/{os.environ['GITHUB_REPOSITORY']}/commit/{c['id']}"
              found = set(key_re.findall(msg))
              if not found: 
                  continue
              
              # Create ADF content with proper hyperlinks
              content = []
              
              # 1. Commit message with auto-converted URLs
              msg_content = convert_urls_in_text(f"{msg}\n")
              content.extend(msg_content)
              
              # 2. GitHub commit link
              content.append(create_adf_text("GitHub Commit: "))
              content.append(create_adf_hyperlink(c['id'][:8], commit_url))
              content.append(create_adf_text("\n"))
              
              # 3. Check for PR/MR link in commit message
              pr_pattern = r'#(\d+)'
              pr_match = re.search(pr_pattern, msg)
              if pr_match:
                  pr_number = pr_match.group(1)
                  pr_url = f"{os.environ['GITHUB_SERVER_URL']}/{os.environ['GITHUB_REPOSITORY']}/pull/{pr_number}"
                  content.append(create_adf_text("Pull Request: "))
                  content.append(create_adf_hyperlink(f"#{pr_number}", pr_url))
                  content.append(create_adf_text("\n"))
              
              # 4. Check for demo page link (look for common patterns)
              demo_patterns = [
                  r'demo[:\s]+([^\s"\'<>]+)',
                  r'preview[:\s]+([^\s"\'<>]+)',
                  r'live[:\s]+([^\s"\'<>]+)'
              ]
              for pattern in demo_patterns:
                  demo_match = re.search(pattern, msg, re.IGNORECASE)
                  if demo_match:
                      demo_url = demo_match.group(1)
                      # Clean up any trailing punctuation
                      demo_url = demo_url.rstrip('.,;:!?"\'/)')
                      if not demo_url.startswith('http'):
                          demo_url = f"https://{demo_url}"
                      content.append(create_adf_text("Demo Page: "))
                      content.append(create_adf_hyperlink("View Demo", demo_url))
                      content.append(create_adf_text("\n"))
                      break
              
              # Create the formatted line for this commit
              line_content = {
                  "type": "paragraph",
                  "content": content
              }
              
              for key in found:
                  by_issue.setdefault(key, []).append(line_content)

          # Create proper ADF payloads
          payloads = []
          for k, v in by_issue.items():
              adf_comment = {
                  "type": "doc",
                  "version": 1,
                  "content": v  # v is already a list of ADF paragraph objects
              }
              payloads.append({"key": k, "comment": adf_comment})
          with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
              f.write(f"payloads={json.dumps(payloads)}\n")
          PY
        env:
          COMMITS: ${{ steps.commits.outputs.commits }}

      - name: Post comments to Jira
        if: ${{ steps.build.outputs.payloads != '' && steps.build.outputs.payloads != '[]' }}
        run: |
          python3 - << 'PY'
          import json, os, base64, urllib.request
          
          payloads = json.loads(os.environ["PAYLOADS"])
          jira = os.environ["JIRA_BASE_URL"].rstrip("/")
          auth = (os.environ["JIRA_EMAIL"] + ":" + os.environ["JIRA_API_TOKEN"]).encode()
          b64 = base64.b64encode(auth).decode()

          for p in payloads:
              url = f"{jira}/rest/api/3/issue/{p['key']}/comment"
              # Use the pre-built ADF comment structure
              comment_body = {
                  "body": p["comment"]  # p["comment"] is already in ADF format
              }
              data = json.dumps(comment_body).encode()
              req = urllib.request.Request(url, data=data, headers={
                  "Authorization": f"Basic {b64}",
                  "Accept": "application/json",
                  "Content-Type": "application/json"
              })
              try:
                  with urllib.request.urlopen(req) as resp:
                      print(p["key"], "->", resp.status)
              except Exception as e:
                  print("Failed", p["key"], e)
          PY
        env:
          PAYLOADS: ${{ steps.build.outputs.payloads }}
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
```

### Step 2: Commit and Push

```bash
git add .github/workflows/jira-comment.yml
git commit -m "ci/EDGE-36: Add Jira-GitHub integration workflow"
git push origin main
```

## Commit Message Format

### Required Format
```
<type>/<JIRA-KEY>: <message>
```

### Type Categories
| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat/EDGE-36: Add user authentication` |
| `fix` | Bug fix | `fix/EDGE-37: Resolve login timeout issue` |
| `docs` | Documentation | `docs/EDGE-38: Update API documentation` |
| `refactor` | Code cleanup | `refactor/EDGE-39: Optimize database queries` |
| `test` | Testing | `test/EDGE-40: Add unit tests for auth module` |
| `chore` | Maintenance | `chore/EDGE-41: Update dependencies` |
| `style` | Formatting | `style/EDGE-42: Fix code formatting` |
| `ci` | CI/CD | `ci/EDGE-43: Update deployment pipeline` |
| `build` | Build system | `build/EDGE-44: Update webpack config` |
| `perf` | Performance | `perf/EDGE-45: Optimize image loading` |
| `revert` | Rollback | `revert/EDGE-46: Revert problematic commit` |

### Advanced Examples

**With Pull Request:**
```bash
git commit -m "feat/EDGE-36: Add new hero component #123"
```

**With Demo Page:**
```bash
git commit -m "feat/EDGE-36: Update hero styling demo: main--repo--owner.aem.page"
```

**With Manual URLs:**
```bash
git commit -m "feat/EDGE-36: See https://docs.adobe.com/aem for implementation details"
```

**Combined:**
```bash
git commit -m "feat/EDGE-36: New feature implementation #123 demo: main--repo--owner.aem.page see https://jira.com/ticket for details"
```

## Features

### 1. Automatic Jira Key Detection
- Detects Jira issue keys in commit messages (format: `PROJECT-123`)
- Supports multiple keys in single commit
- Case-sensitive matching

### 2. Smart URL Conversion
- Automatically converts any `http://` or `https://` URLs to clickable hyperlinks
- Handles multiple URLs in commit messages
- Cleans up trailing punctuation
- Shortens long URLs for better display

### 3. Pull Request Detection
- Automatically detects PR references (`#123`)
- Creates clickable links to GitHub pull requests
- Works with any PR number format

### 4. Demo Page Detection
- Recognizes common patterns: `demo:`, `preview:`, `live:`
- Automatically adds `https://` prefix if missing
- Creates clickable "View Demo" links

### 5. Atlassian Document Format (ADF)
- Uses proper ADF structure for Jira Cloud
- Ensures hyperlinks display correctly
- Maintains text formatting and structure

## Testing

### Step 1: Test Basic Integration

```bash
# Create a test commit
echo "Test file" > test-jira.txt
git add test-jira.txt
git commit -m "test/EDGE-36: Test Jira integration workflow"
git push origin main
```

### Step 2: Test Advanced Features

```bash
# Test with PR reference
git commit -m "feat/EDGE-36: New feature implementation #123"

# Test with demo page
git commit -m "feat/EDGE-36: Updated styling demo: main--repo--owner.aem.page"

# Test with manual URLs
git commit -m "feat/EDGE-36: See https://docs.adobe.com/aem for details"

# Test combined features
git commit -m "feat/EDGE-36: Complete feature #123 demo: main--repo--owner.aem.page see https://jira.com/ticket"
```

### Step 3: Verify Results

1. Check GitHub Actions tab for workflow execution
2. Verify workflow passes without errors
3. Check Jira ticket for new comments
4. Verify all hyperlinks are clickable

## Troubleshooting

### Common Issues

#### 1. Workflow Fails with "Invalid format" Error
**Problem**: JSON output format issue
**Solution**: The workflow uses proper multiline output format with EOF delimiters

#### 2. Jira Comments Not Appearing
**Possible Causes**:
- Incorrect Jira credentials
- Insufficient permissions
- Wrong Jira base URL
- Issue key doesn't exist

**Debug Steps**:
1. Check GitHub Actions logs
2. Verify Jira credentials
3. Test API access manually
4. Confirm issue key exists

#### 3. Hyperlinks Not Working
**Problem**: Using wrong format for Jira
**Solution**: Workflow uses ADF format, not wiki markup

#### 4. Multiple Commits to Same Issue
**Behavior**: Each commit creates a separate comment
**Expected**: This is the intended behavior for audit trail

### Debug Commands

```bash
# Check workflow status
gh run list --workflow="jira-comment.yml" --limit=5

# View workflow logs
gh run view <run-id> --log

# Check repository secrets (requires admin access)
gh secret list
```

## Advanced Configuration

### Customizing Jira Key Pattern

To modify the Jira key detection pattern, update the regex in the workflow:

```python
# Current pattern: PROJECT-123
key_re = re.compile(r"\b[A-Z][A-Z0-9]+-\d+\b")

# Custom pattern example: PROJ_123
key_re = re.compile(r"\b[A-Z][A-Z0-9]+_\d+\b")
```

### Adding Custom Link Patterns

To add new link detection patterns:

```python
# Add to demo_patterns list
demo_patterns = [
    r'demo[:\s]+([^\s"\'<>]+)',
    r'preview[:\s]+([^\s"\'<>]+)',
    r'live[:\s]+([^\s"\'<>]+)',
    r'staging[:\s]+([^\s"\'<>]+)',  # New pattern
    r'dev[:\s]+([^\s"\'<>]+)'       # Another pattern
]
```

### Branch-Specific Execution

To run only on specific branches:

```yaml
on:
  push:
    branches: 
      - main
      - develop
      - feature/*
```

### Rate Limiting

Jira API has rate limits. For high-volume repositories, consider:
- Adding delays between requests
- Batching multiple commits
- Using webhook-based approach

## Security Considerations

### API Token Security
- Store tokens in GitHub Secrets only
- Use least-privilege access
- Rotate tokens regularly
- Monitor token usage

### Repository Access
- Limit workflow permissions
- Use specific branch patterns
- Consider IP restrictions if needed

### Data Privacy
- Commit messages are sent to Jira
- Ensure compliance with data policies
- Consider message sanitization if needed

## Monitoring and Maintenance

### Regular Checks
- Monitor workflow execution success rate
- Check Jira API rate limit usage
- Verify comment formatting
- Update dependencies as needed

### Performance Optimization
- Consider caching for large repositories
- Optimize regex patterns
- Monitor execution time

### Documentation Updates
- Keep this guide updated
- Document any customizations
- Share learnings with team

## Support and Resources

### GitHub Actions Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

### Jira API Documentation
- [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Atlassian Document Format](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)

### Troubleshooting Resources
- GitHub Actions logs
- Jira API response codes
- Atlassian Community forums

---

## Conclusion

This integration provides a powerful way to maintain visibility between GitHub development activities and Jira project management. The automatic comment generation with smart hyperlink detection ensures that all stakeholders stay informed about development progress while maintaining a clean, professional appearance in Jira tickets.

For questions or issues, refer to the troubleshooting section or consult the GitHub Actions and Jira API documentation.
