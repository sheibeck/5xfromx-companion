import { defineAuth, secret } from '@aws-amplify/backend'

export const auth = defineAuth({
    loginWith: {
      email: true,
      externalProviders: {
        google: {
          clientId: secret('GOOGLE_CLIENT_ID'),
          clientSecret: secret('GOOGLE_CLIENT_SECRET'),
          attributeMapping: {
            email: 'email'
          },
          scopes: ['profile']
        },
        // signInWithApple: {
        //   clientId: secret('SIWA_CLIENT_ID'),
        //   keyId: secret('SIWA_KEY_ID'),
        //   privateKey: secret('SIWA_PRIVATE_KEY'),
        //   teamId: secret('SIWA_TEAM_ID')
        // },
        // loginWithAmazon: {
        //   clientId: secret('LOGINWITHAMAZON_CLIENT_ID'),
        //   clientSecret: secret('LOGINWITHAMAZON_CLIENT_SECRET')
        // },
        // facebook: {
        //   clientId: secret('FACEBOOK_CLIENT_ID'),
        //   clientSecret: secret('FACEBOOK_CLIENT_SECRET')
        // },
        callbackUrls: [
          'http://localhost:5174/signin',
          'https://main.d2e92q6lz39lb.amplifyapp.com/signin'
        ],
        logoutUrls: ['http://localhost:5174/', 'https://main.d2e92q6lz39lb.amplifyapp.com/'],
      }
    }
  });
