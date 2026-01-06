# Remove Secrets from Git History

⚠️ **CRITICAL SECURITY FIX** ⚠️

This guide will help you remove exposed secrets from your Git history.

## ⚠️ IMPORTANT WARNINGS

1. **This will rewrite Git history** - Anyone who has cloned the repo will need to re-clone
2. **Change all exposed secrets immediately** before running these scripts:
   - Generate a new Django SECRET_KEY
   - Change your database password
   - Rotate any API keys that were exposed
3. **Notify all collaborators** that they need to re-clone the repository after you push

## Step 1: Install Required Tools

### Option A: Using git-filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Or on Windows with pip
python -m pip install git-filter-repo
```

### Option B: Using BFG Repo-Cleaner

Download from: https://rtyley.github.io/bfg-repo-cleaner/

## Step 2: Backup Your Repository

```bash
cd ..
git clone community-hub-connect-main community-hub-connect-backup
```

## Step 3: Remove Secrets from History

### Method 1: Using git-filter-repo (Recommended)

```bash
cd community-hub-connect-main

# Remove SECRET_KEY from history
git filter-repo --path backend/core/settings.py --invert-paths --force
git filter-repo --path backend/create_db.py --invert-paths --force

# Or replace specific strings (more targeted)
git filter-repo --replace-text <(echo "django-insecure-vvt\$vsu*78wtq-\$@y1^uhxszdb*yi!c\$&dn^u7e3^y31^q7j_3==>REMOVED_SECRET_KEY") --force
git filter-repo --replace-text <(echo "GhanaDior1000\$==>REMOVED_PASSWORD") --force
```

### Method 2: Using BFG Repo-Cleaner

```bash
# Create a file with secrets to remove
echo "django-insecure-vvt\$vsu*78wtq-\$@y1^uhxszdb*yi!c\$&dn^u7e3^y31^q7j_3" > secrets.txt
echo "GhanaDior1000\$" >> secrets.txt

# Run BFG
java -jar bfg.jar --replace-text secrets.txt community-hub-connect-main

# Clean up
cd community-hub-connect-main
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Method 3: Manual Removal (Simpler but less thorough)

```bash
# Remove the files from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/core/settings.py backend/create_db.py" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Step 4: Force Push to GitHub

⚠️ **WARNING: This will overwrite remote history**

```bash
# First, make sure you've updated settings.py and create_db.py to use .env
# Then force push (this is destructive!)
git push origin --force --all
git push origin --force --tags
```

## Step 5: Notify Team Members

All collaborators must:
1. Delete their local repository
2. Re-clone from GitHub
3. Set up their `.env` file using `.env.example` as a template

## Step 6: Verify Secrets Are Removed

```bash
# Check if secrets still exist in history
git log --all --full-history -p | grep -i "django-insecure"
git log --all --full-history -p | grep -i "GhanaDior"
```

If nothing is found, the secrets have been removed.

## Alternative: Create New Repository (Safest Option)

If the above seems too risky, you can:

1. Create a new repository
2. Copy all files (except .git folder)
3. Make initial commit
4. Update remote URL

```bash
# Remove old remote
git remote remove origin

# Add new repository
git remote add origin <new-repo-url>

# Push to new repo
git push -u origin main
```

## Post-Cleanup Checklist

- [ ] New Django SECRET_KEY generated and set in .env
- [ ] Database password changed
- [ ] All secrets moved to .env files
- [ ] .env files added to .gitignore
- [ ] .env.example files created
- [ ] Git history cleaned
- [ ] Force pushed to GitHub
- [ ] Team members notified
- [ ] Verify secrets are no longer in repository

## Generate New Django Secret Key

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output to your `.env` file as `DJANGO_SECRET_KEY`.

