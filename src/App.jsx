import React, { useEffect, useState } from "react";

import {
  Inbox,
  Send,
  PenSquare,
  Sparkles,
  X,
  ArrowLeft,
  RefreshCw,
  Reply,
  CheckCircle
} from "lucide-react";


// ======================================================
// HELPER FUNCTIONS
// ======================================================

function extractEmailAddress(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    return extractEmailAddress(value[0]);
  }

  if (typeof value === "object") {
    return (
      value.emailAddress ||
      value.address ||
      value.email ||
      value.value ||
      ""
    );
  }

  return "";
}


function getSender(email) {
  return extractEmailAddress(email?.from);
}


function getRecipient(email) {
  return extractEmailAddress(email?.to);
}


function getEmailBody(email) {
  return (
    email?.body ||
    email?.bodyContent ||
    email?.text ||
    email?.textBody ||
    email?.html ||
    email?.htmlBody ||
    email?.content ||
    email?.message ||
    email?.messageBody ||
    email?.preview ||
    email?.bodyExcerpt ||
    ""
  );
}


function stripHtml(text) {
  if (!text) return "";

  const div = document.createElement("div");

  div.innerHTML = text;

  return div.textContent || div.innerText || "";
}


function getPreview(email) {
  const body = getEmailBody(email);

  const clean = stripHtml(body);

  if (!clean) {
    return "No email body available.";
  }

  return clean
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}


function getDate(email) {
  if (!email?.createdAt) {
    return "";
  }

  return new Date(email.createdAt).toLocaleString();
}


// ======================================================
// APP
// ======================================================

function App() {

  // ====================================================
  // UI STATE
  // ====================================================

  const [activeView, setActiveView] = useState("inbox");

  const [aiMessage, setAiMessage] = useState("");

  const [aiStatus, setAiStatus] = useState("");


  // ====================================================
  // COMPOSE STATE
  // ====================================================

  const [to, setTo] = useState("");

  const [subject, setSubject] = useState("");

  const [body, setBody] = useState("");


  // ====================================================
  // EMAIL STATE
  // ====================================================

  const [selectedEmail, setSelectedEmail] = useState(null);

  const [emails, setEmails] = useState([]);

  const [sentEmails, setSentEmails] = useState([]);


  // ====================================================
  // LOADING
  // ====================================================

  const [loading, setLoading] = useState(false);

  const [sentLoading, setSentLoading] = useState(false);


  // ====================================================
  // SEARCH / FILTER
  // ====================================================

  const [filter, setFilter] = useState("all");

  const [searchText, setSearchText] = useState("");


  // ====================================================
  // SEND
  // ====================================================

  const [sending, setSending] = useState(false);


  // ====================================================
  // DETAIL SOURCE
  // ====================================================

  const [detailSource, setDetailSource] = useState("inbox");


  // ====================================================
  // LOAD INBOX
  // ====================================================

  async function loadInbox() {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/emails"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load inbox"
        );
      }

      setEmails(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.error(
        "Inbox loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }


  // ====================================================
  // LOAD SENT
  // ====================================================

  async function loadSent() {
    try {
      setSentLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/sent"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load sent emails"
        );
      }

      setSentEmails(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.error(
        "Sent loading error:",
        error
      );
    } finally {
      setSentLoading(false);
    }
  }


  // ====================================================
  // INITIAL LOAD + AUTO REFRESH
  // ====================================================

  useEffect(() => {

    loadInbox();

    loadSent();

    const interval = setInterval(() => {

      loadInbox();

      loadSent();

    }, 60000);

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ====================================================
  // REFRESH
  // ====================================================

  async function refreshEmails() {

    setAiStatus(
      "Refreshing emails..."
    );

    await Promise.all([
      loadInbox(),
      loadSent()
    ]);

    setAiStatus(
      "Emails refreshed successfully."
    );
  }


  // ====================================================
  // OPEN EMAIL
  // ====================================================

  function openEmail(email, source) {

    setSelectedEmail(email);

    setDetailSource(source);

    setActiveView("detail");
  }


  // ====================================================
  // OPEN COMPOSE
  // ====================================================

  function openCompose() {

    setTo("");

    setSubject("");

    setBody("");

    setActiveView("compose");

    setAiStatus("");
  }


  // ====================================================
  // REPLY
  // ====================================================

  function handleReply(email) {

    const sender = getSender(email);

    setTo(sender);

    setSubject(
      `Re: ${email?.subject || ""}`
    );

    setBody("");

    setActiveView("compose");
  }


  // ====================================================
  // SEND EMAIL
  // ====================================================

  async function sendEmail() {

    if (!to.trim()) {

      alert(
        "Please enter recipient email."
      );

      return;
    }


    if (!subject.trim()) {

      alert(
        "Please enter subject."
      );

      return;
    }


    if (!body.trim()) {

      alert(
        "Please enter email body."
      );

      return;
    }


    const confirmed = window.confirm(
      `Send this email to ${to}?`
    );


    if (!confirmed) {
      return;
    }


    try {

      setSending(true);


      const response = await fetch(
        "http://localhost:5000/api/send",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            to: to.trim(),
            subject: subject.trim(),
            body: body.trim()
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to send email."
        );
      }


      alert(
        "Email sent successfully! ✉️"
      );


      setTo("");

      setSubject("");

      setBody("");


      await loadInbox();

      await loadSent();


      setActiveView("sent");


    } catch (error) {

      console.error(
        "Send error:",
        error
      );

      alert(
        error.message ||
        "Failed to send email."
      );

    } finally {

      setSending(false);
    }
  }


  // ====================================================
  // AI ASSISTANT
  // ====================================================

  function handleAICommand() {

    const command =
      aiMessage.trim().toLowerCase();


    if (!command) {

      setAiStatus(
        "Please enter a command."
      );

      return;
    }


    // ==================================================
    // COMPOSE
    // ==================================================

    if (
      command.includes("compose") ||
      command.includes("write an email") ||
      command.includes("send an email")
    ) {

      setActiveView("compose");


      // Find email address

      const emailMatch =
        command.match(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
        );


      if (emailMatch) {

        setTo(
          emailMatch[0]
        );
      }


      // Find subject

      const subjectMatch =
        command.match(
          /subject\s*[:\-]\s*(.+?)(?:\s+body\s*[:\-]|$)/i
        );


      if (subjectMatch) {

        setSubject(
          subjectMatch[1].trim()
        );
      }


      // Find body

      const bodyMatch =
        command.match(
          /body\s*[:\-]\s*(.+)$/i
        );


      if (bodyMatch) {

        setBody(
          bodyMatch[1].trim()
        );
      }


      setAiStatus(
        "Compose window opened."
      );

      return;
    }


    // ==================================================
    // SHOW SENT
    // ==================================================

    if (
      command === "sent" ||
      command.includes("show sent") ||
      command.includes("sent emails") ||
      command.includes("show my sent")
    ) {

      setActiveView("sent");

      setSelectedEmail(null);

      loadSent();


      setAiStatus(
        "Showing sent emails."
      );

      return;
    }


    // ==================================================
    // SHOW UNREAD
    // ==================================================

    if (
      command.includes("unread") ||
      command.includes("unread emails") ||
      command.includes("show unread")
    ) {

      setActiveView("inbox");

      setSelectedEmail(null);

      setFilter("unread");

      setSearchText("");


      setAiStatus(
        "Showing unread emails."
      );

      return;
    }


    // ==================================================
    // LATEST EMAIL
    // ==================================================

    if (
      command.includes("latest email") ||
      command.includes("latest mail") ||
      command.includes("most recent email") ||
      command.includes("open latest")
    ) {

      setFilter("all");

      setSearchText("");

      setActiveView("inbox");


      if (emails.length > 0) {

        setSelectedEmail(
          emails[0]
        );

        setDetailSource(
          "inbox"
        );

        setActiveView(
          "detail"
        );


        setAiStatus(
          "Opened your latest email."
        );

      } else {

        setAiStatus(
          "No emails found."
        );
      }

      return;
    }


    // ==================================================
    // OPEN EMAIL FROM SOMEONE
    // ==================================================

    if (
      command.includes("open from") ||
      command.includes("email from") ||
      command.includes("mail from")
    ) {

      let search = "";


      if (
        command.includes("open from")
      ) {

        search =
          command.split(
            "open from"
          )[1];

      } else if (
        command.includes("email from")
      ) {

        search =
          command.split(
            "email from"
          )[1];

      } else {

        search =
          command.split(
            "mail from"
          )[1];
      }


      search =
        search
          .replace(
            "please",
            ""
          )
          .trim();


      const found =
        emails.find(
          (email) => {

            const sender =
              getSender(
                email
              ).toLowerCase();


            return (
              sender.includes(search) ||
              sender
                .split("@")[0]
                .includes(search)
            );
          }
        );


      if (found) {

        setSelectedEmail(
          found
        );

        setDetailSource(
          "inbox"
        );

        setActiveView(
          "detail"
        );


        setAiStatus(
          "Opened the matching email."
        );

      } else {

        setAiStatus(
          `No email found from "${search}".`
        );
      }

      return;
    }


    // ==================================================
    // SEARCH
    // ==================================================

    if (
      command.startsWith("search ") ||
      command.startsWith("find ") ||
      command.includes("search for ")
    ) {

      let search =
        command;


      if (
        search.startsWith(
          "search for "
        )
      ) {

        search =
          search.substring(11);

      } else if (
        search.startsWith(
          "search "
        )
      ) {

        search =
          search.substring(7);

      } else if (
        search.startsWith(
          "find "
        )
      ) {

        search =
          search.substring(5);
      }


      search =
        search.trim();


      setActiveView(
        "inbox"
      );

      setSelectedEmail(
        null
      );

      setFilter(
        "all"
      );

      setSearchText(
        search
      );


      setAiStatus(
        `Searching emails for "${search}".`
      );

      return;
    }


    // ==================================================
    // SHOW ALL
    // ==================================================

    if (
      command === "show all" ||
      command === "show all emails" ||
      command === "all emails" ||
      command === "reset"
    ) {

      setActiveView(
        "inbox"
      );

      setSelectedEmail(
        null
      );

      setFilter(
        "all"
      );

      setSearchText(
        ""
      );


      setAiStatus(
        "Showing all emails."
      );

      return;
    }


    // ==================================================
    // REFRESH
    // ==================================================

    if (
      command === "refresh" ||
      command === "refresh emails" ||
      command === "reload"
    ) {

      refreshEmails();

      return;
    }


    // ==================================================
    // INBOX
    // ==================================================

    if (
      command === "inbox" ||
      command === "show inbox" ||
      command === "show my inbox"
    ) {

      setActiveView(
        "inbox"
      );

      setSelectedEmail(
        null
      );

      setFilter(
        "all"
      );

      setSearchText(
        ""
      );


      loadInbox();


      setAiStatus(
        "Showing your inbox."
      );

      return;
    }


    // ==================================================
    // UNKNOWN COMMAND
    // ==================================================

    setAiStatus(
      "Try: Compose email, Show unread, Search meeting, Show sent, Open latest email, or Refresh."
    );
  }


  // ====================================================
  // FILTER EMAILS
  // ====================================================

  const filteredEmails =
    emails.filter(
      (email) => {

        if (
          filter === "unread" &&
          !email.unread
        ) {

          return false;
        }


        if (
          searchText.trim()
        ) {

          const query =
            searchText
              .toLowerCase();


          const sender =
            getSender(email)
              .toLowerCase();


          const recipient =
            getRecipient(email)
              .toLowerCase();


          const emailSubject =
            (
              email?.subject ||
              ""
            ).toLowerCase();


          const emailBody =
            stripHtml(
              getEmailBody(email)
            ).toLowerCase();


          return (
            sender.includes(query) ||
            recipient.includes(query) ||
            emailSubject.includes(query) ||
            emailBody.includes(query)
          );
        }


        return true;
      }
    );


  // ====================================================
  // STYLES
  // ====================================================

  const styles = {

    app: {
      minHeight: "100vh",
      background: "#f5f3ff",
      color: "#1f1b2d",
      display: "flex",
      fontFamily: "Arial, sans-serif"
    },


    sidebar: {
      width: "230px",
      background: "#24113f",
      color: "white",
      padding: "24px 16px",
      boxSizing: "border-box"
    },


    logo: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "30px"
    },


    button: {
      width: "100%",
      padding: "12px",
      marginBottom: "10px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "15px"
    },


    main: {
      flex: 1,
      padding: "25px",
      overflow: "auto"
    },


    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px"
    },


    title: {
      fontSize: "28px",
      fontWeight: "bold"
    },


    searchBox: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      marginBottom: "20px",
      boxSizing: "border-box"
    },


    card: {
      background: "white",
      borderRadius: "14px",
      padding: "18px",
      marginBottom: "12px",
      cursor: "pointer",
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.06)"
    },


    assistant: {
      width: "300px",
      background: "white",
      borderLeft: "1px solid #ddd",
      padding: "20px",
      boxSizing: "border-box"
    }
  };


  // ====================================================
  // UI
  // ====================================================

  return (

    <div style={styles.app}>

      {/* ================================================
          SIDEBAR
      ================================================= */}

      <aside style={styles.sidebar}>

        <div style={styles.logo}>
          ✦ MailPilot
        </div>


        <button
          style={{
            ...styles.button,
            background:
              activeView === "compose"
                ? "#9b6cff"
                : "#372052",
            color: "white"
          }}

          onClick={openCompose}
        >

          <PenSquare size={18} />

          Compose

        </button>


        <button
          style={{
            ...styles.button,
            background:
              activeView === "inbox"
                ? "#9b6cff"
                : "#372052",
            color: "white"
          }}

          onClick={() => {

            setActiveView(
              "inbox"
            );

            setSelectedEmail(
              null
            );

          }}
        >

          <Inbox size={18} />

          Inbox

        </button>


        <button
          style={{
            ...styles.button,
            background:
              activeView === "sent"
                ? "#9b6cff"
                : "#372052",
            color: "white"
          }}

          onClick={() => {

            setActiveView(
              "sent"
            );

            setSelectedEmail(
              null
            );

            loadSent();

          }}
        >

          <Send size={18} />

          Sent

        </button>

      </aside>


      {/* ================================================
          MAIN CONTENT
      ================================================= */}

      <main style={styles.main}>


        {/* ==============================================
            INBOX
        =============================================== */}

        {activeView === "inbox" && (

          <>

            <div style={styles.topBar}>

              <div style={styles.title}>
                Inbox
              </div>


              <button
                onClick={
                  refreshEmails
                }

                style={{
                  border: "none",
                  background: "white",
                  padding: "10px",
                  borderRadius: "10px",
                  cursor: "pointer"
                }}
              >

                <RefreshCw size={18} />

              </button>

            </div>


            <input
              style={styles.searchBox}

              placeholder="Search emails..."

              value={searchText}

              onChange={(e) => {

                setSearchText(
                  e.target.value
                );

                setFilter(
                  "all"
                );

              }}
            />


            {loading && (
              <p>
                Loading emails...
              </p>
            )}


            {!loading &&
              filteredEmails.length === 0 && (

                <div style={styles.card}>
                  No emails found.
                </div>

              )}


            {filteredEmails.map(
              (email, index) => (

                <div
                  key={
                    email.id ||
                    index
                  }

                  style={{
                    ...styles.card,

                    borderLeft:
                      email.unread
                        ? "4px solid #9b6cff"
                        : "4px solid transparent"
                  }}

                  onClick={() =>
                    openEmail(
                      email,
                      "inbox"
                    )
                  }
                >

                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "6px"
                    }}
                  >

                    {getSender(email) ||
                      "Unknown sender"}

                  </div>


                  <div
                    style={{
                      fontWeight: "600"
                    }}
                  >

                    {email.subject ||
                      "(No subject)"}

                  </div>


                  <div
                    style={{
                      color: "#777",
                      marginTop: "6px"
                    }}
                  >

                    {getPreview(email)}

                  </div>


                  <div
                    style={{
                      color: "#999",
                      fontSize: "12px",
                      marginTop: "8px"
                    }}
                  >

                    {getDate(email)}

                  </div>

                </div>

              )
            )}

          </>

        )}


        {/* ==============================================
            SENT
        =============================================== */}

        {activeView === "sent" && (

          <>

            <div style={styles.topBar}>

              <div style={styles.title}>
                Sent
              </div>


              <button
                onClick={loadSent}

                style={{
                  border: "none",
                  background: "white",
                  padding: "10px",
                  borderRadius: "10px",
                  cursor: "pointer"
                }}
              >

                <RefreshCw size={18} />

              </button>

            </div>


            {sentLoading && (

              <p>
                Loading sent emails...
              </p>

            )}


            {!sentLoading &&
              sentEmails.length === 0 && (

                <div style={styles.card}>
                  No sent emails yet.
                </div>

              )}


            {sentEmails.map(
              (email, index) => (

                <div
                  key={
                    email.id ||
                    index
                  }

                  style={styles.card}

                  onClick={() =>
                    openEmail(
                      email,
                      "sent"
                    )
                  }
                >

                  <div
                    style={{
                      fontWeight: "bold"
                    }}
                  >

                    To:{" "}

                    {getRecipient(email) ||
                      "Unknown recipient"}

                  </div>


                  <div
                    style={{
                      fontWeight: "600",
                      marginTop: "7px"
                    }}
                  >

                    {email.subject ||
                      "(No subject)"}

                  </div>


                  <div
                    style={{
                      color: "#777",
                      marginTop: "6px"
                    }}
                  >

                    {getPreview(email)}

                  </div>


                  <div
                    style={{
                      color: "#999",
                      fontSize: "12px",
                      marginTop: "8px"
                    }}
                  >

                    {getDate(email)}

                  </div>

                </div>

              )
            )}

          </>

        )}


        {/* ==============================================
            EMAIL DETAIL
        =============================================== */}

        {activeView === "detail" &&
          selectedEmail && (

            <>

              <div style={styles.topBar}>

                <button
                  onClick={() => {

                    setSelectedEmail(
                      null
                    );

                    setActiveView(
                      detailSource
                    );

                  }}

                  style={{
                    border: "none",
                    background: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >

                  <ArrowLeft size={18} />

                </button>


                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold"
                  }}
                >

                  Email

                </div>

              </div>


              <div style={styles.card}>

                <h2>
                  {selectedEmail.subject ||
                    "(No subject)"}
                </h2>


                <p>

                  <strong>
                    From:
                  </strong>{" "}

                  {getSender(
                    selectedEmail
                  ) ||
                    "Unknown"}

                </p>


                <p>

                  <strong>
                    To:
                  </strong>{" "}

                  {getRecipient(
                    selectedEmail
                  ) ||
                    "Unknown"}

                </p>


                <p
                  style={{
                    color: "#888"
                  }}
                >

                  {getDate(
                    selectedEmail
                  )}

                </p>


                <hr />


                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.6"
                  }}
                >

                  {stripHtml(
                    getEmailBody(
                      selectedEmail
                    )
                  ) ||
                    "No email body available."}

                </div>


                {detailSource === "inbox" && (

                  <button
                    onClick={() =>
                      handleReply(
                        selectedEmail
                      )
                    }

                    style={{
                      marginTop: "20px",
                      border: "none",
                      background: "#24113f",
                      color: "white",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >

                    <Reply size={16} />

                    Reply

                  </button>

                )}

              </div>

            </>

          )}


        {/* ==============================================
            COMPOSE
        =============================================== */}

        {activeView === "compose" && (

          <>

            <div style={styles.topBar}>

              <div style={styles.title}>
                Compose Email
              </div>


              <button
                onClick={() =>
                  setActiveView(
                    "inbox"
                  )
                }

                style={{
                  border: "none",
                  background: "white",
                  padding: "10px",
                  borderRadius: "10px",
                  cursor: "pointer"
                }}
              >

                <X size={18} />

              </button>

            </div>


            <div style={styles.card}>

              <input
                style={styles.searchBox}

                placeholder="To"

                value={to}

                onChange={(e) =>
                  setTo(
                    e.target.value
                  )
                }
              />


              <input
                style={styles.searchBox}

                placeholder="Subject"

                value={subject}

                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }
              />


              <textarea
                style={{
                  ...styles.searchBox,
                  minHeight: "250px",
                  resize: "vertical"
                }}

                placeholder="Write your message..."

                value={body}

                onChange={(e) =>
                  setBody(
                    e.target.value
                  )
                }
              />


              <button
                onClick={
                  sendEmail
                }

                disabled={
                  sending
                }

                style={{
                  border: "none",
                  background: "#24113f",
                  color: "white",
                  padding: "12px 22px",
                  borderRadius: "10px",
                  cursor:
                    sending
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >

                {sending
                  ? "Sending..."
                  : (
                    <>
                      <Send size={17} />
                      Send
                    </>
                  )}

              </button>

            </div>

          </>

        )}

      </main>


      {/* ================================================
          AI ASSISTANT
      ================================================= */}

      <aside style={styles.assistant}>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "bold",
            fontSize: "20px",
            marginBottom: "15px"
          }}
        >

          <Sparkles size={20} />

          AI Assistant

        </div>


        <p
          style={{
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.5"
          }}
        >

          Control MailPilot using
          natural language.

        </p>


        <textarea
          value={aiMessage}

          onChange={(e) =>
            setAiMessage(
              e.target.value
            )
          }

          onKeyDown={(e) => {

            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {

              e.preventDefault();

              handleAICommand();

            }

          }}

          placeholder={
            "Try:\nCompose email to...\nShow unread emails\nSearch meeting\nShow sent emails\nOpen latest email\nRefresh"
          }

          style={{
            width: "100%",
            minHeight: "130px",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "inherit"
          }}
        />


        <button
          onClick={
            handleAICommand
          }

          style={{
            width: "100%",
            marginTop: "10px",
            padding: "12px",
            border: "none",
            borderRadius: "10px",
            background: "#24113f",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >

          <Sparkles size={16} />

          Ask Assistant

        </button>


        {aiStatus && (

          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              background: "#f1edff",
              borderRadius: "10px",
              fontSize: "13px",
              display: "flex",
              gap: "7px"
            }}
          >

            <CheckCircle size={16} />

            {aiStatus}

          </div>

        )}


        <div
          style={{
            marginTop: "25px",
            fontSize: "13px",
            color: "#777",
            lineHeight: "1.7"
          }}
        >

          <strong>
            Examples
          </strong>

          <br />

          • Compose email to
          someone@example.com

          <br />

          • Show unread emails

          <br />

          • Search meeting

          <br />

          • Show sent emails

          <br />

          • Open latest email

          <br />

          • Refresh

        </div>

      </aside>

    </div>
  );
}


export default App;