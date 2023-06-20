import express from "express";
import querystring from "querystring";
import dotenv from "dotenv";
import axios from "axios";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());
const port = process.env.PORT;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length: number) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = "user-read-private user-read-email";

  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.use((req, res, next) => {
  const { spotify_access_token } = req.cookies;
  console.log("request", spotify_access_token);
  next();
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;

  const client = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "authorization_code",
      // @ts-ignore
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${client}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        console.log(response.data);
        res
          .cookie("spotify_access_token", response.data.access_token, {
            httpOnly: true,
          })
          .cookie("spotify_refresh_token", response.data.refresh_token, {
            httpOnly: true,
          })
          .cookie("spotify_token_type", response.data.token_type, {
            httpOnly: true,
          })
          .send({ status: "authenticated" });
      } else {
        res.send(response);
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/test", (req, res) => {
  const { spotify_access_token, spotify_token_type } = req.cookies;
  axios
    .get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `${spotify_token_type} ${spotify_access_token}`,
      },
    })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
