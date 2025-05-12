import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema =  a.schema({
  Campaign: a
    .model({
      name: a.string().required(),
      description: a.string(),
      system: a.enum(['FORGOTTEN_RUIN', 'FIVE_LEAGUES', 'FIVE_PARSECS']),
      characterGroups: a.hasMany('CharacterGroup', 'campaignId'),
      campaignTurns: a.hasMany('CampaignTurn', 'campaignId'),
    }),

  CampaignTurn: a
    .model({
      description: a.string(),
      campaignId: a.id(),
      campaign: a.belongsTo('Campaign', 'campaignId'),
      turnNumber: a.integer(),
    }),
  
  CharacterGroup: a
    .model({
      name: a.string().required(),
      description: a.string(),
      characters: a.hasMany('Character', 'characterGroupId'),
      campaignId: a.id(),
      campaign: a.belongsTo('Campaign', 'campaignId'),
    }),
   
  Character: a
    .model({
      name: a.string().required(),
      description: a.string(),
      characterGroupId: a.id(),
      characterGroup: a.belongsTo('CharacterGroup', 'characterGroupId'),
      sortOrder: a.integer(),
      imagePath: a.string(),
      imageUrl: a.string(),
    })
})
.authorization(allow => [
  allow.owner(),
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});