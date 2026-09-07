const dotenv = require("dotenv");
const { MailSlurp } = require("mailslurp-client");

dotenv.config();

const mailslurp = new MailSlurp({
  apiKey: process.env.MAILSLURP_API_KEY,
});

async function test() {
  const inbox = await mailslurp.getInbox(
    process.env.MAILSLURP_INBOX_ID
  );

  console.log("YOUR MAILSLURP EMAIL:");
  console.log(inbox.emailAddress);
}

test();