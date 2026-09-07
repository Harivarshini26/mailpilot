require("dotenv").config();

const MailSlurp = require("mailslurp-client").default;

const mailslurp = new MailSlurp({
  apiKey: process.env.MAILSLURP_API_KEY,
});

async function testMailSlurp() {
  try {
    const inbox = await mailslurp.getInbox(
      process.env.MAILSLURP_INBOX_ID
    );

    console.log("MailPilot inbox:");
    console.log(inbox.emailAddress);

    await mailslurp.sendEmail(inbox.id, {
      to: [inbox.emailAddress],
      subject: "Welcome to MailPilot",
      body: "This is a real test email for our MailPilot project.",
    });

    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Error:");
    console.error(error.message);
  }
}

testMailSlurp();
