const fs = require("fs");
const base64 = require("js-base64");
const readline = require("readline");
const { google } = require("googleapis");
const { GaxiosError } = require("gaxios");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time. This file expires after 21 days and needs to be regenerated.
const TOKEN_PATH = "./util/mailclient/credentials/token.json";
const CREDENTIAL_PATH = "./util/mailclient/credentials/credentials.json";
const FROM_EMAIL = "product.notification2@openturf.in";
const messageContexts = [
  {
    key: "Thank you for registering as a",
    type: "RECRUITER_SIGNUP_ACTIVATION",
    template: "Dear (.+),(?:[^)]|\n)*?href='(.+?)'(?:[^)]|\n)*?>Click Here</a>",
    parameters: ["name", "url"],
  },
  {
    key: "Master Recruiter has recently assigned job descriptions",
    type: "JD_ASSIGNMENT",
    template: "Dear (.+),(?:[^)]|\n)*?",
    parameters: ["name"],
  },
  {
    key: "Your OTP",
    type: "CANDIDATE_VERIFY_OTP",
    template: "Dear (|.+),(?:[^)]|\n)+?<p>Your OTP for Curatal is (.+).</p>",
    // template: "Dear (|.+),(?:[^)]|\n)*?Your OTP for Curatal is (.+).</p>",
    parameters: ["name", "otp"],
  },

  {
    key: "We have successfully retrieved your account that has the user name",
    type: "CANDIDATE_RETRIEVE_USERNAME",
    template: "Dear (.+),(?:[^)]|\n)*?", //<a href="(.+?)" (?:[^)]|\n)*?>
    parameters: ["name"], //, "username"],
  },
  ,
];

/**
 * Read file content
 * @param {string} filePath - File to read
 * @returns Promise, which resolve with file content or reject if fail to read
 */
function getFileContent(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(content));
      }
    });
  });
}

/**
 * Get Google API OAuth2 object based on the credentials provided
 * @param {Object} credentials
 * @returns OAuth2 object
 */
function getOAuth2Client(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

/**
 * Get and store new token after prompting for user authorization
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @returns Promise, which resolve with token or reject if fail
 */
function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          reject(err);
        } else {
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(token);
            }
          });
        }
      });
    });
  });
}

/**
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client object.
 * @param {string} query Query string for the API
 * @returns Promise, which resolve with message list or reject if fail
 */
function readMessagesFromInbox(oAuth2Client, query) {
  return new Promise((resolve, reject) => {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    gmail.users.messages.list(
      {
        userId: "me",
        q: query,
        labelIds: ["INBOX"],
      },
      (err, res) => {
        if (err) {
          if (
            err instanceof GaxiosError &&
            err.response &&
            err.response.data &&
            err.response.data.error === "invalid_grant"
          ) {
            // Handle "invalid_grant" error by resolving with a different value
            resolve("invalid_grant");
          }
        } else if (!res.data.messages) {
          resolve(null);
        } else {
          resolve(res.data.messages);
        }
      }
    );
  });
}

/**
 * Get mail message with the msgId provided
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client object.
 * @param {string} msgId
 * @returns Promise, which resolve with mail message or reject if fail
 */
function getMail(oAuth2Client, msgId) {
  return new Promise((resolve, reject) => {
    try {
      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
      gmail.users.messages.get(
        {
          userId: "me",
          id: msgId,
        },
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            var body = res.data.payload.body.data;
            var htmlBody = base64.decode(
              body.replace(/-/g, "+").replace(/_/g, "/")
            );
            let mailObject = parseMail(htmlBody);
            if (mailObject) {
              resolve({ id: msgId, message: mailObject });
            } else {
              console.log(`Mail parse failed: ${htmlBody}`);
            }
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Parse mail and return object with extracted parameters
 * @param {string} mail message
 * @returns object with extracted parameters on success. null on failure
 */
function parseMail(mail) {
  //console.log("Mail HTML in parseMail: ", mail); // For testing
  let mailObject = null;
  for (const context of messageContexts) {
    if (mail.includes(context.key)) {
      let rex = new RegExp(context.template);
      //console.log("\nBuilt Regex while parsing: ", rex);
      let parts = rex.exec(mail);
      //console.log("\nParts while parsing regex: ", parts);
      if (parts == null)
        console.log(
          `\n-----------Mails with Template : \n${context.template} \nnot found.-------------`
        );
      else if (parts && parts.length === context.parameters.length + 1) {
        parts.splice(0, 1);
        let parameters = {};
        for (let index = 0; index < context.parameters.length; index++) {
          parameters[context.parameters[index]] = parts[index];
        }
        mailObject = { type: context.type, parameters: parameters };
        break;
      }
    }
  }
  return mailObject;
}

module.exports = {
  /**
   * Get messages from gmail inbox
   */
  async getMessages(messageType, email) {
    let token = null;
    let query = "";
    try {
      let credentials = await getFileContent(CREDENTIAL_PATH);
      let oAuth2Client = getOAuth2Client(credentials);
      try {
        token = await getFileContent(TOKEN_PATH);
      } catch (err) {
        console.log(err);
        token = await getNewToken(oAuth2Client);
      }
      // TODO : to update for all users separately

      // RECRUITER QUERIES-------------------------
      if (messageType == "RECRUITER_SIGNUP_ACTIVATION")
        query = `from:(${FROM_EMAIL}) to:(${email}) subject:(Verify Your Email Address for Curatal - Master Recruiter Account)`;
      else if (messageType == "JD_ASSIGNMENT")
        query = `from:(${FROM_EMAIL}) to:(${email}) subject:(Assignment of Job Descriptions in Job Portal)`;
      else if (messageType == "CANDIDATE_VERIFY_OTP")
        query = `from:(${FROM_EMAIL}) to:(${email}) subject:(Verify Mobile)`;
      else if (messageType == "CANDIDATE_RETRIEVE_USERNAME")
        query = `from:(${FROM_EMAIL}) to:(${email}) subject:(Retrieve Username)`;

      if (token) {
        oAuth2Client.setCredentials(token);

        let data;
        try {
          data = await readMessagesFromInbox(oAuth2Client, query);
          //console.log("Mailbox data: ", data); // For testing
          if (data === "invalid_grant") {
            console.log("Handling invalid grant error:", data);
            return "invalid_grant";
          } else if (data) {
            let messageList = [];
            for (const message of data) {
              try {
                let mail = await getMail(oAuth2Client, message.id);
                messageList.push(mail);
              } catch (err) {
                console.log(err);
              }
            }
            //console.log(messageList); // For testing- Add debugger
            return { auth: oAuth2Client, messages: messageList };
          } else {
            return null;
          }
        } catch (err) {
          console.error("Error occurred:", err);
          // Handle other errors that may occur during message retrieval
        }
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  /**
   * Get mail message with the msgId provided
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client object.
   * @param {string} msgId
   * @returns Promise, which resolve if success or reject if fail
   */
  markMessageAsRead(oAuth2Client, msgId) {
    return new Promise((resolve, reject) => {
      try {
        const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
        gmail.users.messages.modify({
          userId: "me",
          id: msgId,
          requestBody: { removeLabelIds: ["UNREAD"] },
        });
        resolve();
      } catch (err) {
        reject();
      }
    });
  },
};
