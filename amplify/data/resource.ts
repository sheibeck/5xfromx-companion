import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema =  a.schema({
  Campaign: a
    .model({
      name: a.string().required(),
      description: a.string(),
      system: a.enum(['FORGOTTEN_RUIN', 'FIVE_LEAGUES', 'FIVE_PARSECS']),
      characterGroups: a.hasMany('CharacterGroup', 'campaignId'),
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