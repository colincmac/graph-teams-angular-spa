export const environment = {
  production: true,
  oauth: {
    clientId: '<client-id>',
    authority: 'https://login.microsoftonline.com/<tenant-id>/',
    redirectUri: 'http://localhost:4200',
    scopes: ['user.read', 'people.read', 'user.readbasic.all']
  }
};
