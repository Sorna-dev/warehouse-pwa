import { google } from 'googleapis';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const getOAuth2Client = () => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`
  );
  return oAuth2Client;
};
