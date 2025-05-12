import { defineStorage } from '@aws-amplify/backend';

export const portraits = defineStorage({
  name: 'portraits',
  access: (allow) => ({
    'portrait/*': [
      allow.authenticated.to(['read','write', 'delete']),
    ],
  })
});