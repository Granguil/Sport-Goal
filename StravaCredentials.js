import {CLIENT_ID_STRAVA, SECRET_KEY_STRAVA, REFRESH_TOKEN_STRAVA, ACCESS_TOKEN_STRAVA} from '@env'

const stravaCredentialsSite = {
    clientID:CLIENT_ID_STRAVA,
    clientSecret:SECRET_KEY_STRAVA,
    accessToken:ACCESS_TOKEN_STRAVA
}

export const stravaCredentials={
  client_id:stravaCredentialsSite.clientID,
  client_secret:stravaCredentialsSite.clientSecret,
  grant_type:'refresh_token',
  refresh_token:REFRESH_TOKEN_STRAVA
}