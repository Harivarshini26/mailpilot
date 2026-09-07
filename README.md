# MailPilot

## AI-Powered Mail Web Application

MailPilot is a web-based email client integrated with a real email service. It provides Inbox, Sent, Compose, Email Detail, Reply, Search, and a natural-language assistant that can control common email operations through simple commands.

## 🎥 Demo Video

[Watch the MailPilot Demo](https://drive.google.com/file/d/10ZlY7V5-NAmTw3KBjLjQosGmf1UkdYLf/view?usp=sharing)

The demo shows the assistant controlling the email interface, including composing emails, searching emails, filtering unread messages, opening the latest email, and navigating between Inbox and Sent.

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
* Responsive and polished email interface

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
                 ┌─────────────────────┐
                 │    React Frontend   │
                 │                     │
                 │ Inbox / Sent /      │
                 │ Compose / Assistant │
                 └──────────┬──────────┘
                            │
                       REST API
                            │
                 ┌──────────▼──────────┐
                 │   Express Backend   │
                 │                     │
                 │ API + Email Logic   │
                 └──────────┬──────────┘
                            │
                       MailSlurp API
                            │
                 ┌──────────▼──────────┐
                 │    Email Service    │
                 │ Receive / Send Mail │
                 └─────────────────────┘
```

## 🧠 AI Assistant

The MailPilot assistant converts natural-language commands into actions in the email interface.

Examples:

```text
Show my unread emails
```

```text
Show my sent emails
```

```text
Open latest email
```

```text
Search meeting
```

```text
Compose an email to someone@example.com subject: Meeting Update body: Hello, this is a meeting update.
```

The assistant can therefore control the main UI instead of requiring the user to manually navigate through every operation.

## ⚙️ Setup and Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Harivarshini26/mailpilot.git
cd mailpilot
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a file:

```text
server/.env
```

Add:

```text
MAILSLURP_API_KEY=your_mailslurp_api_key
MAILSLURP_INBOX_ID=your_mailslurp_inbox_id
```

Do not commit `.env` to GitHub.

### 5. Start the backend

From the `server` folder:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal in the main `mailpilot` folder:

```bash
npm run dev
```

Open the URL shown by Vite, usually:

```text
http://localhost:5173
```

## 🔐 Security

API credentials are stored in environment variables and excluded from Git using `.gitignore`.

The MailSlurp API key is never stored in the frontend code.

## 💡 Architecture Decisions and Trade-offs

### React + Vite

React was chosen for building a responsive single-page email interface, while Vite provides a fast development environment.

**Trade-off:** The project uses JavaScript instead of TypeScript to keep development faster and simpler within the available implementation time.

### Express Backend

An Express backend acts as an intermediary between the frontend and MailSlurp.

**Decision:** API credentials remain on the server instead of being exposed to the browser.

**Trade-off:** This requires running two services locally: the React frontend and Express backend.

### MailSlurp

MailSlurp was selected to provide a real email provider integration without exposing personal email credentials.

**Trade-off:** The free sandbox has limitations on email delivery and API usage.

### Natural-Language Command Engine

The assistant currently uses a deterministic command-processing layer to map common natural-language requests to UI actions.

**Decision:** This makes the demonstrated commands predictable and reliable.

**Trade-off:** It is less flexible than a full LLM-based assistant and does not understand arbitrary conversations.

### Local Sent Email Storage

Recently sent emails are also stored locally so the Sent interface can consistently display the sent message content.

**Trade-off:** This local storage is intended for the prototype and would be replaced by a more persistent database in a production application.

## 🚀 What I Would Improve With More Time

* Replace the rule-based assistant with an LLM-powered agent
* Add richer conversational context and memory
* Add email threading
* Improve advanced search and filtering
* Add Forward functionality
* Add rich-text email composition
* Add attachments
* Add stronger error handling and retry logic
* Add automated frontend and backend tests
* Add database-backed message metadata
* Deploy the application to a cloud platform
* Add support for additional email providers such as Gmail and Microsoft Outlook

## 👩‍💻 Project

**MailPilot — AI-Powered Mail Web Application**
