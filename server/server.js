const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");

const MailSlurp = require("mailslurp-client").default;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mailslurp = new MailSlurp({
  apiKey: process.env.MAILSLURP_API_KEY
});

const inboxId = String(
  process.env.MAILSLURP_INBOX_ID
).trim();

const SENT_FILE = "./sentEmails.json";

console.log("Using Inbox ID:", inboxId);


// ==========================================
// LOCAL SENT EMAIL STORAGE
// ==========================================

function readLocalSentEmails() {
  try {
    if (!fs.existsSync(SENT_FILE)) {
      return [];
    }

    const data = fs.readFileSync(
      SENT_FILE,
      "utf8"
    );

    return JSON.parse(data || "[]");

  } catch (error) {
    console.error(
      "Error reading sent emails:",
      error.message
    );

    return [];
  }
}


function saveLocalSentEmail(email) {

  const emails =
    readLocalSentEmails();

  emails.unshift(email);

  fs.writeFileSync(
    SENT_FILE,
    JSON.stringify(
      emails,
      null,
      2
    )
  );
}


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {

  res.send(
    "MailPilot backend is running!"
  );

});


// ==========================================
// INBOX DETAILS
// ==========================================

app.get("/api/inbox", async (req, res) => {

  try {

    const inbox =
      await mailslurp.inboxController.getInbox(
        inboxId
      );

    res.json({

      id: inbox.id,

      emailAddress:
        inbox.emailAddress,

      name:
        inbox.name || ""

    });

  } catch (error) {

    console.error(
      "Inbox details error:",
      error.message
    );

    res.status(500).json({

      error:
        error.message
    });
  }
});


// ==========================================
// GET INBOX EMAILS
// ==========================================

app.get("/api/emails", async (req, res) => {

  try {

    console.log(
      "Fetching inbox emails..."
    );


    const result =
      await mailslurp.emailController
        .getEmailsPaginated({

          inboxId: inboxId,

          page: 0,

          size: 20,

          sort: "DESC"
        });


    const emails =
      result.content || [];


    const formattedEmails =
      emails.map((email, index) => {

        return {

          id:
            email?.id ||
            email?.emailId ||
            `inbox-${index}`,

          subject:
            email?.subject ||
            "(No subject)",

          from:
            email?.from ||
            email?.sender ||
            "",

          to:
            email?.to ||
            [],

          body:
            email?.body ||
            email?.bodyContent ||
            email?.text ||
            email?.textBody ||
            email?.html ||
            email?.htmlBody ||
            email?.content ||
            email?.preview ||
            email?.bodyExcerpt ||
            "",

          createdAt:
            email?.createdAt ||
            email?.receivedAt ||
            null,

          unread:
            email?.read === false

        };

      });


    console.log(
      `Found ${formattedEmails.length} inbox emails`
    );


    res.json(
      formattedEmails
    );


  } catch (error) {

    console.error(
      "Inbox error:",
      error.message
    );

    res.status(500).json({

      error:
        error.message ||
        "Failed to load inbox."
    });

  }

});


// ==========================================
// GET SENT EMAILS
// ==========================================

app.get("/api/sent", async (req, res) => {

  try {

    console.log(
      "Fetching sent emails..."
    );


    const localEmails =
      readLocalSentEmails();


    let mailSlurpEmails = [];


    try {

      const result =
        await mailslurp.sentController
          .getSentEmails({

            inboxId: inboxId,

            page: 0,

            size: 20,

            sort: "DESC"

          });


      mailSlurpEmails =
        result.content || [];


    } catch (error) {

      console.error(
        "MailSlurp sent error:",
        error.message
      );

    }


    const apiEmails =
      mailSlurpEmails.map(
        (email) => {

          return {

            id:
              email?.id ||
              email?.emailId ||
              "",

            subject:
              email?.subject ||
              "(No subject)",

            to:
              email?.to ||
              [],

            from:
              email?.from ||
              "",

            body:
              email?.body ||
              email?.bodyContent ||
              email?.text ||
              email?.textBody ||
              email?.html ||
              email?.htmlBody ||
              email?.content ||
              "",

            createdAt:
              email?.createdAt ||
              null

          };

        }
      );


    // Combine local saved emails
    // with MailSlurp sent emails

    const combined = [

      ...localEmails,

      ...apiEmails

    ];


    // Remove duplicates

    const unique = [];

    const seen = new Set();


    for (const email of combined) {

      const recipient =
        Array.isArray(email.to)
          ? email.to.join(",")
          : String(
              email.to || ""
            );


      const key =
        `${email.subject}|${recipient}|${email.createdAt}`;


      if (!seen.has(key)) {

        seen.add(key);

        unique.push(email);

      }

    }


    // Newest first

    unique.sort(
      (a, b) => {

        const dateA =
          new Date(
            a.createdAt || 0
          ).getTime();


        const dateB =
          new Date(
            b.createdAt || 0
          ).getTime();


        return dateB - dateA;

      }
    );


    console.log(
      `Returning ${unique.length} sent emails`
    );


    res.json(unique);


  } catch (error) {

    console.error(
      "Sent error:",
      error.message
    );


    res.status(500).json({

      error:
        error.message ||
        "Failed to load sent emails."

    });

  }

});


// ==========================================
// SEND EMAIL
// ==========================================

app.post("/api/send", async (req, res) => {

  try {

    const {
      to,
      subject,
      body
    } = req.body;


    console.log(
      "Sending email..."
    );

    console.log(
      "To:",
      to
    );

    console.log(
      "Subject:",
      subject
    );


    // Validation

    if (
      !to ||
      !subject ||
      !body
    ) {

      return res.status(400).json({

        error:
          "To, subject and body are required."

      });

    }


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(to)) {

      return res.status(400).json({

        error:
          "Please enter a valid email address."

      });

    }


    // Send REAL email

    const result =
      await mailslurp.emailController
        .sendEmailSourceOptional({

          inboxId: inboxId,

          sendEmailOptions: {

            to: [to],

            subject: subject,

            body: body

          }

        });


    console.log(
      "MailSlurp send result:",
      result
    );


    // Save locally so the Sent page
    // can display the email body

    const localEmail = {

      id:
        result?.id ||
        result?.emailId ||
        `local-${Date.now()}`,

      subject:
        subject,

      to:
        [to],

      from:
        "",

      body:
        body,

      createdAt:
        new Date().toISOString()

    };


    saveLocalSentEmail(
      localEmail
    );


    console.log(
      "Email saved locally."
    );


    res.json({

      success:
        true,

      message:
        "Email sent successfully! ✉️",

      id:
        localEmail.id

    });


  } catch (error) {

    console.error(
      "Send error:",
      error
    );


    res.status(500).json({

      error:
        error.message ||
        "Failed to send email."

    });

  }

});


// ==========================================
// START SERVER
// ==========================================

const PORT = 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `MailPilot backend running on http://localhost:${PORT}`
    );

    console.log(
      "Using MailSlurp Inbox ID:",
      inboxId
    );

  }
);