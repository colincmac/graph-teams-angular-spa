// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  oauth: {
    clientId: '439d8c9d-28a2-4418-8d03-2880e8eaac9d',
    authority: 'https://login.microsoftonline.com/331c9bdf-8c02-4d5b-980d-0506bed6c4d2/',
    redirectUri: 'http://localhost:4200',
    scopes: ['user.read', 'people.read', 'user.readbasic.all']
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
