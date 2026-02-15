# ECHONA Tests

This folder contains test files and testing utilities.

## 📋 Test Files

- **test-body.json** - Sample API request bodies
- **test-login.json** - Login test data
- **test-spotify.html** - Spotify integration testing page
- **demo.html** - Demo and showcase page

## 🧪 Running Tests

### API Tests
Use the JSON files with tools like Postman or curl:

```bash
# Test login endpoint
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d @tests/test-login.json
```

### Spotify Integration Test
Open `test-spotify.html` in your browser to test Spotify authentication flow.

### Demo Page
Open `demo.html` to see a demo of various features.

## ✅ Test Checklist

Before submitting a PR, verify:

- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] ML service responds to requests
- [ ] Authentication flow works
- [ ] Spotify integration functional
- [ ] Mood detection works for all modalities
- [ ] Dashboard displays data correctly
- [ ] Music recommendations load

## 🔍 Manual Testing Guide

### 1. Authentication
1. Register new user → Should succeed
2. Login with credentials → Should receive token
3. Access protected route → Should authenticate
4. Logout → Should clear session

### 2. Mood Detection
1. Upload face image → Should detect emotion
2. Record voice sample → Should analyze emotion
3. Write journal entry → Should detect sentiment
4. Check fusion result → Should combine all inputs

### 3. Music Features
1. Connect Spotify → Should authenticate
2. Get recommendations → Should return playlist
3. Play music → Should stream correctly
4. Try "Surprise Me" → Should suggest contextual music

### 4. Dashboard
1. View mood history → Should display chart
2. Check statistics → Should show accurate data
3. View recent activity → Should list entries
4. Add new mood entry → Should update display

## 🐛 Reporting Test Failures

If tests fail, provide:
- Steps to reproduce
- Expected vs actual behavior
- Console errors
- Environment details (OS, browser, versions)

## 📝 Writing New Tests

When adding features, include:
- Unit tests for functions
- Integration tests for APIs
- E2E tests for user flows
- Test data in appropriate JSON files

## 🚀 Future Testing

Planned improvements:
- Jest unit tests for React components
- Mocha/Chai tests for backend APIs
- Pytest tests for ML models
- Cypress E2E tests
- Automated CI/CD testing
