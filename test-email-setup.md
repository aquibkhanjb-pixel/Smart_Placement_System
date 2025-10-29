# 🧪 Test Your Email Setup

After adding your SMTP credentials, test the setup:

## 1. **Check Configuration Status**
```bash
curl -X GET http://localhost:3003/api/test/email
```

Look for `"hasCredentials": true` in the response.

## 2. **Send Test Email**
```bash
curl -X POST http://localhost:3003/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "email": "your-personal-email@gmail.com"
  }'
```

## 3. **Test Welcome Email Template**
```bash
curl -X POST http://localhost:3003/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "your-personal-email@gmail.com",
    "firstName": "Test",
    "lastName": "Student",
    "rollNumber": "TEST2024",
    "department": "CMPN"
  }'
```

## 4. **Create a Test Student (this will send welcome email automatically)**
Try creating a new student through your placement system interface, and they should receive a welcome email.

## ✅ Success Indicators:
- Configuration shows `"hasCredentials": true`
- Test emails return `"success": true`
- You receive test emails in your inbox
- Console shows "✅ Email sent successfully"

## ❌ If It Doesn't Work:
1. Double-check the app password (no spaces)
2. Ensure 2FA is enabled on your Gmail
3. Check console logs for detailed error messages
4. Try with a different Gmail account