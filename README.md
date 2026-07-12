# TranspitOps
TransitOps is a tool which makes the life of Fleet Managers easy

## Brevo transactional email setup

1. Create or log in to a Brevo account.
2. Verify the sender email address in Brevo.
3. Generate a Brevo API key for transactional email.
4. Add these backend environment variables:

```env
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=verified_sender@example.com
BREVO_SENDER_NAME=TransitOps
FRONTEND_URL=http://localhost:5173
```

5. Restart the backend.
6. Test successful login and trip lifecycle status-change emails.
