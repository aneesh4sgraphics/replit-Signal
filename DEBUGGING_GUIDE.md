# Debugging Guide for Connection Problems

This guide helps you diagnose and fix connection errors in your deployed Replit application.

## Quick Diagnostic Steps

### 1. Check System Health
Visit the diagnostic endpoint to see overall system status:
```
https://your-app.replit.app/api/diagnostics
```

This will show:
- Environment variables status (DATABASE_URL, etc.)
- Database connection status
- API endpoint health
- Server uptime and memory

### 2. Use Browser Developer Tools (Network Tab)

**How to Open Developer Tools:**
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Safari**: Enable Developer menu in Preferences → Advanced, then press `Cmd+Option+I`

**Inspecting Failed API Requests:**

1. **Open the Network Tab** in Developer Tools
2. **Reload the page** that has the error
3. **Look for red/failed requests** (usually in red or with 4xx/5xx status codes)
4. **Click on the failed request** to see details:

   **What to check:**
   - **Status Code**: 
     - `404` = Endpoint not found (check URL)
     - `500` = Server error (backend issue)
     - `401/403` = Authentication problem
     - `0` or `(failed)` = Network issue (can't reach server)
   
   - **Response Tab**: Shows the exact error message from the server
     ```json
     {
       "error": "Failed to fetch product pricing",
       "details": "Cannot connect to database",
       "suggestion": "Ensure DATABASE_URL is set correctly"
     }
     ```
   
   - **Headers Tab**: Shows request/response headers
   - **Timing Tab**: Shows how long each phase took

5. **Copy the error details** and check against common issues below

## Common Error Scenarios

### Error: "Connection Problem: Unable to load data"

**Possible Causes:**
1. **Database not configured**
   - Check: `/api/diagnostics` → look for DATABASE_URL status
   - Fix: Add DATABASE_URL to Replit Secrets
   
2. **API endpoint failing**
   - Check: Browser Network tab → look for failed `/api/product-pricing-database` request
   - Check: Server logs in Replit console
   - Fix: See detailed error in Response tab

3. **Server not running**
   - Check: Can you access `/api/health`?
   - Fix: Restart the Replit or check for server errors in console

### Error: HTTP 500 (Internal Server Error)

**What it means**: The server received your request but encountered an error

**How to diagnose:**
1. Check the **Response tab** in Network tools for detailed error
2. Look at **server logs** in Replit console
3. Check `/api/diagnostics` for system health

**Common causes:**
- Database connection issues
- Missing environment variables
- Data validation errors
- Code bugs

### Error: HTTP 401/403 (Authentication)

**What it means**: Not logged in or no permission

**How to fix:**
1. Log out and log back in
2. Clear browser cookies
3. Check if your email is approved in the admin panel

### Error: HTTP 0 or "Failed to fetch"

**What it means**: Can't reach the server at all

**How to diagnose:**
1. Check your internet connection
2. Try accessing the Replit URL directly
3. Check if Replit is having service issues
4. Look for CORS errors in browser console

## Environment Variables Checklist

**Required Secrets (set in Replit Secrets tab):**
- `DATABASE_URL` - PostgreSQL connection string
- `REPL_ID` - Should be auto-set by Replit
- `REPL_SLUG` - Should be auto-set by Replit

**How to check:**
1. Go to Replit → Tools → Secrets
2. Verify all required variables are present
3. Click "eye" icon to verify values are not empty
4. Check `/api/diagnostics` endpoint to see which are set

## Replit Deployment Configuration

**Port Configuration:**
- ✅ Server MUST bind to `0.0.0.0:5000`
- ✅ This is already configured in `server/index.ts`
- ✅ Port 5000 is the only allowed port on Replit

**Deployment Type:**
- Use "Autoscale" for production
- Ensure no localhost references in code

## Reading Server Logs

**Where to find logs:**
1. Click "Console" in Replit
2. Look for logs starting with:
   - `===` for structured logs
   - `✓` for success messages
   - `✗` for errors
   - `⚠` for warnings

**What to look for:**
- Database connection errors
- API request logs
- Error stack traces
- Environment variable missing warnings

## Enhanced Error Information

**The app now provides detailed error information:**

1. **In Development**: Full error details shown automatically
2. **In Production**: Click "More Information" to expand error details
3. **Error details include:**
   - Exact error message from backend
   - Suggestions for fixing
   - Timestamp and duration
   - HTTP status codes
   - Database connection status

## Step-by-Step Debugging Workflow

1. **Visit `/api/diagnostics`**
   - Check all systems are healthy
   - Note any red ✗ marks

2. **Open Browser DevTools (F12)**
   - Go to Network tab
   - Reload the page
   - Find failed requests (red color)

3. **Click on failed request**
   - Read the Response tab
   - Note the status code
   - Copy error details

4. **Check server logs**
   - Look in Replit console
   - Find corresponding error messages
   - Check for stack traces

5. **Verify environment variables**
   - Check Replit Secrets tab
   - Ensure DATABASE_URL is present
   - Restart if you just added variables

6. **Test specific endpoints**
   - `/api/health` - Should always work
   - `/api/auth/user` - Test authentication
   - `/api/product-pricing-database` - Test data loading

## Getting Help

When reporting issues, include:
1. Screenshot of error message
2. Contents of `/api/diagnostics`
3. Browser Network tab screenshot showing failed request
4. Server console logs around the time of error
5. Which page/route is failing

## Technical Details

**Server Configuration:**
- Runs on Express.js
- Binds to 0.0.0.0:5000
- Uses PostgreSQL database (Neon)
- Comprehensive error logging enabled

**Error Logging Locations:**
- Backend: Console logs with `===` markers
- Frontend: Browser console (F12)
- Network: Browser DevTools Network tab
- Health: `/api/diagnostics` endpoint
