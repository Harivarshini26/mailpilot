const dotenv = require("dotenv");
const { MailSlurp } = require("mailslurp-client");

dotenv.config();

const mailslurp = new MailSlurp({
  apiKey: process.env.MAILSLURP_API_KEY,
});

async function createInbox() {
  try {
    const inbox = await mailslurp.createInbox({
      name: "MailPilot Demo",
      emailAddress: "example1user1@sandbox.zamazamail.link"
    });

    console.log("Inbox created!");
    console.log("Email:", inbox.emailAddress);
    console.log("Inbox ID:", inbox.id);
  } catch (error) {
    console.error("Could not create custom inbox:");
    console.error(error.message);
  }
}

createInbox();