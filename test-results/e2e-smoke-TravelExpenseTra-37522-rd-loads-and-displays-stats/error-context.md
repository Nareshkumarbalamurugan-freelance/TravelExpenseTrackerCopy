# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- text: Noveltech Feeds
- paragraph: Employee Travel Expense Tracker
- heading "Welcome" [level=3]
- tablist:
  - tab "Sign In" [selected]
  - tab "Register"
- tabpanel "Sign In":
  - text: Email
  - textbox "Email": testuser@example.com
  - text: Password
  - textbox "Password": testpassword
  - button "Forgot password?"
  - button "Sign In"
```