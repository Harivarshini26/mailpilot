# MailPilot

## AI-Powered Mail Web Application

MailPilot is a web-based email client that integrates real email services with a natural-language AI assistant. It allows users to manage inbox and sent emails, compose and send messages, search emails, and perform common email actions using simple commands.

## 🎥 Demo Video

[Watch the MailPilot Demo](https://drive.google.com/file/d/10ZlY7V5-NAmTw3KBjLjQosGmf1UkdYLf/view?usp=sharing)

## ✨ Features

* Real email integration using MailSlurp
* Inbox and Sent email management
* Email detail view
* Compose and send emails
* Reply functionality
* AI-assisted email composition
* Natural-language email search
* Unread email filtering
* Latest email access
* UI control through natural-language commands
* Automatic email synchronization
* Confirmation before sending emails

## 🛠️ Technologies Used

* React
* Vite
* JavaScript
* Node.js
* Express.js
* MailSlurp API
* CSS

## 🏗️ Architecture

```text
React Frontend
      ↓
Express Backend
      ↓
MailSlurp API
      ↓
Email Service
```

The frontend provides the email interface and AI assistant. The Express backend communicates with MailSlurp, while API credentials are stored securely in environment variables.

## 🔐 Security

API credentials are stored in `.env` files and excluded from Git using `.gitignore`.

## 🚀 Future Improvements

* LLM-powered conversational assistant
* Advanced email filtering
* Thread-based conversations
* Rich email formatting
* Cloud deployment
* Additional email provider integrations

## 👩‍💻 Project

**MailPilot — AI-Powered Mail Web Application**
