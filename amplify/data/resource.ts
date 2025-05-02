import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { defineAuth, secret } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema =  a.schema({
  Campaign: a
    .model({
      //id: a.id().required(),
      name: a.string().required(),
      system: a.enum(['FORGOTTEN_RUIN', 'FIVE_LEAGUES', 'FIVE_PARSECS']),
      characterGroups: a.hasMany('CharacterGroup', 'campaignId'),
    })
    .authorization((allow) => [
      allow.owner()
    ]),
    
  CharacterGroup: a
    .model({
      name: a.string().required(),
      description: a.string(),
      characters: a.hasMany('Character', 'characterGroupId'),
      campaignId: a.id(),
      campaign: a.belongsTo('Campaign', 'campaignId'),
    })
    .authorization((allow) => [
      allow.owner()
    ]),

  Character: a
    .model({
      name: a.string().required(),
      description: a.string(),
      characterGroupId: a.id(),
      characterGroup: a.belongsTo('CharacterGroup', 'characterGroupId'),
    })
    .authorization((allow) => [
      allow.owner()
    ])
})
.authorization(allow => [
  allow.guest().to(['read'])
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});

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