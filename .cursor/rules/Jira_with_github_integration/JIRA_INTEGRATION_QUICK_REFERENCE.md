# Jira-GitHub Integration Quick Reference

## 🚀 Quick Setup Checklist

### 1. Jira Setup (5 minutes)
- [ ] Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- [ ] Create API token with label "GitHub Actions Jira Integration"
- [ ] Copy token (starts with `ATATT3xFfGF0...`)
- [ ] Note your Jira base URL (e.g., `https://yourcompany.atlassian.net`)

### 2. GitHub Setup (3 minutes)
- [ ] Go to Repository Settings → Secrets and variables → Actions
- [ ] Add secrets:
  - `JIRA_BASE_URL`: Your Jira instance URL
  - `JIRA_EMAIL`: Your Jira account email
  - `JIRA_API_TOKEN`: The API token from step 1
- [ ] Copy the workflow file to `.github/workflows/jira-comment.yml`

### 3. Test (2 minutes)
```bash
git commit -m "test/EDGE-36: Test Jira integration"
git push origin main
```

## 📝 Commit Message Format

### Basic Format
```
<type>/<JIRA-KEY>: <message>
```

### Examples
```bash
# Basic commit
feat/EDGE-36: Add user authentication

# With pull request
feat/EDGE-36: New feature implementation #123

# With demo page
feat/EDGE-36: Updated styling demo: main--repo--owner.aem.page

# With manual URLs
feat/EDGE-36: See https://docs.adobe.com/aem for details

# Combined features
feat/EDGE-36: Complete feature #123 demo: main--repo--owner.aem.page see https://jira.com/ticket
```

## 🔗 What Gets Posted to Jira

### Example Output
```
feat/EDGE-36: Add user authentication with OAuth2 integration
GitHub Commit: [6a085448] (clickable link)
Pull Request: [#123] (clickable link)
Demo Page: [View Demo] (clickable link)
```

### Features
- ✅ **Commit Message**: Full commit message with auto-converted URLs
- ✅ **GitHub Commit**: Clickable link to commit (short hash)
- ✅ **Pull Request**: Auto-detected from #123 patterns
- ✅ **Demo Page**: Auto-detected from demo:, preview:, live: patterns
- ✅ **Manual URLs**: Any http/https URLs become clickable links

## 🛠️ Troubleshooting

### Workflow Not Running
```bash
# Check workflow status
gh run list --workflow="jira-comment.yml" --limit=5

# View logs
gh run view <run-id> --log
```

### No Comments in Jira
1. Check GitHub Actions logs for errors
2. Verify Jira credentials are correct
3. Ensure Jira issue key exists
4. Check you have permission to comment on the issue

### Hyperlinks Not Working
- Workflow uses Atlassian Document Format (ADF)
- Not wiki markup format
- Should work automatically in Jira Cloud

## 📋 Type Categories

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New features | `feat/EDGE-36: Add login form` |
| `fix` | Bug fixes | `fix/EDGE-37: Fix login validation` |
| `docs` | Documentation | `docs/EDGE-38: Update README` |
| `refactor` | Code cleanup | `refactor/EDGE-39: Optimize queries` |
| `test` | Tests | `test/EDGE-40: Add unit tests` |
| `chore` | Maintenance | `chore/EDGE-41: Update deps` |
| `style` | Formatting | `style/EDGE-42: Fix indentation` |
| `ci` | CI/CD | `ci/EDGE-43: Update pipeline` |
| `build` | Build system | `build/EDGE-44: Update webpack` |
| `perf` | Performance | `perf/EDGE-45: Optimize images` |
| `revert` | Rollbacks | `revert/EDGE-46: Revert bad commit` |

## 🔍 URL Detection Patterns

### Manual URLs (Auto-converted)
- `https://example.com` → Clickable link
- `http://example.com` → Clickable link
- Long URLs get shortened: `https://very-long-url.com/...` → `https://very-long-url...`

### Demo Page Patterns
- `demo: example.com` → Demo Page: [View Demo]
- `preview: example.com` → Demo Page: [View Demo]
- `live: example.com` → Demo Page: [View Demo]

### Pull Request Patterns
- `#123` → Pull Request: [#123] (clickable)

## ⚡ Quick Commands

```bash
# Test basic integration
git commit -m "test/EDGE-36: Test Jira integration"

# Test with PR
git commit -m "feat/EDGE-36: New feature #123"

# Test with demo
git commit -m "feat/EDGE-36: Updated UI demo: main--repo--owner.aem.page"

# Test with URLs
git commit -m "feat/EDGE-36: See https://docs.adobe.com/aem for details"

# Test everything
git commit -m "feat/EDGE-36: Complete feature #123 demo: main--repo--owner.aem.page see https://jira.com/ticket"
```

## 🚨 Common Issues

### "Invalid format" Error
- Fixed in current workflow version
- Uses proper multiline output format

### "HTTP Error 400: Bad Request"
- Check Jira credentials
- Verify issue key exists
- Ensure proper permissions

### "No commits found"
- Normal for empty pushes
- Workflow skips gracefully

### Hyperlinks Show as Text
- Jira instance might not support ADF
- Check Jira version and configuration

## 📞 Support

- **GitHub Actions**: Check repository Actions tab
- **Jira API**: Verify credentials and permissions
- **Documentation**: See full guide in `JIRA_GITHUB_INTEGRATION_GUIDE.md`

---

**Pro Tip**: Always test with a simple commit first, then add complexity gradually!
