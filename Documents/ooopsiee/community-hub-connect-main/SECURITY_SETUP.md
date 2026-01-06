# Security Setup Guide

## ✅ What Has Been Fixed

1. **Secrets moved to environment variables**
   - `backend/core/settings.py` now uses `.env` file
   - `backend/create_db.py` now uses `.env` file
   - All sensitive data removed from code

2. **`.gitignore` updated**
   - Added `.env` and `.env.local` files
   - Added Python cache files
   - Added database files

3. **Example files created**
   - `backend/.env.example` - Template for backend environment variables
   - `.env.example` - Template for frontend environment variables

4. **Scripts created**
   - `remove-secrets.ps1` - PowerShell script to clean Git history
   - `remove-secrets-from-history.md` - Detailed guide

## 🚨 IMMEDIATE ACTION REQUIRED

### Step 1: Create Your .env Files

**Backend (.env file in `backend/` directory):**

```bash
cd backend
copy .env.example .env
```

Then edit `backend/.env` and add your actual values:

```env
DJANGO_SECRET_KEY=dk94xv2^5mvsp!%q^r*yl&)vx331(786b%5fscr00q8rq7do9a
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=AYA-Community-db
DB_USER=postgres
DB_PASSWORD=your-actual-database-password
DB_HOST=127.0.0.1
DB_PORT=5432
```

**Frontend (.env file in root directory):**

```bash
copy .env.example .env
```

Then edit `.env` and add your Paystack key:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_paystack_key
```

### Step 2: Install python-dotenv

```bash
cd backend
pip install python-dotenv
```

Or if you have a requirements.txt:

```bash
pip install -r requirements.txt
```

### Step 3: Generate New Django Secret Key

**IMPORTANT:** The old secret key was exposed. Generate a new one:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and use it in your `backend/.env` file.

### Step 4: Change Database Password

**IMPORTANT:** The database password was exposed. Change it:

1. Change the password in PostgreSQL
2. Update `DB_PASSWORD` in `backend/.env`

### Step 5: Remove Secrets from Git History

⚠️ **This is critical!** The secrets are still in your Git history even though they're removed from the code.

**Option A: Use the PowerShell script (Windows):**

```powershell
.\remove-secrets.ps1
```

**Option B: Manual cleanup (see `remove-secrets-from-history.md`):**

Follow the detailed guide in `remove-secrets-from-history.md`

**After cleaning history, force push:**

```bash
git push origin --force --all
git push origin --force --tags
```

⚠️ **WARNING:** This will rewrite Git history. All team members must re-clone the repository.

## 📋 Checklist

- [ ] Created `backend/.env` file with new secrets
- [ ] Created `.env` file for frontend
- [ ] Installed `python-dotenv` package
- [ ] Generated new Django SECRET_KEY
- [ ] Changed database password
- [ ] Tested application with new .env files
- [ ] Removed secrets from Git history
- [ ] Force pushed cleaned history to GitHub
- [ ] Notified team members to re-clone

## 🔒 Security Best Practices Going Forward

1. **Never commit `.env` files** - They're now in `.gitignore`
2. **Always use `.env.example`** - Commit example files, not actual secrets
3. **Rotate secrets regularly** - Especially if they might have been exposed
4. **Use different secrets for dev/prod** - Never use production secrets in development
5. **Review commits before pushing** - Check for any accidental secret commits

## 🆘 If Secrets Were Already Pushed

If secrets were already pushed to GitHub:

1. **Immediately rotate all exposed secrets** (SECRET_KEY, passwords, API keys)
2. **Remove from Git history** using the provided scripts
3. **Force push** the cleaned history
4. **Consider the secrets compromised** - Assume they're public and change them

## 📞 Need Help?

If you're unsure about any step, refer to:
- `remove-secrets-from-history.md` - Detailed Git history cleanup guide
- `remove-secrets.ps1` - Automated cleanup script

