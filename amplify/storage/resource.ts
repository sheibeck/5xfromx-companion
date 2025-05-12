import { defineStorage } from '@aws-amplify/backend';

export const portraits = defineStorage({
  name: 'portraits',
  access: (allow) => ({
    'portrait/{entity_id}/*': [
      allow.authenticated.to(['read','write']),
      allow.entity('identity').to(['read', 'write', 'delete'])
    ],
  })
});