<h1 align="center">
Hapi-Firebase Auth
</h1>

## Overview

If you have an App using Firebase Auth and need to connect them with your backend API, this is the plugin for you.

This auth strategy verify the token sent in the request and only grant access to valid tokens. Invalid tokens will get a `401 - Unauthorized` response.

## Features

* Compatible with Hapi v17
* Firebase Admin initializer and loader
* Gluten-free

## Instalation

### Using NPM

```
npm install hapi-firebase-auth --save
```

### Using Yarn

```
yarn add hapi-firebase-auth
```

## Usage

### Step 1 - Add auth strategy 

#### Using a new Firebase Admin instance

In case you don't want to initialize Firebase Admin externally, pass your Firebase credentials using the property `credential` as shown below. This way the plugin will handle all this for you.

```
// Load Hapi-Firebase Auth Strategy
const HapiFirebaseAuth = require('hapi-firebase-auth');

// Register the plugin
await server.register({
  plugin: HapiFirebaseAuth
});

// Include auth strategy
server.auth.strategy('firebase', 'firebase', {
  credential: {
    projectId: '<PROJECT_ID>',
    clientEmail: 'foo@<PROJECT_ID>.iam.gserviceaccount.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\n<KEY>\n-----END PRIVATE KEY-----\n',
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
  }
})
```

You can get the credentials for your project in your Firebase Console. More details <a href="https://firebase.google.com/docs/admin/setup" target="_blank">here</a>.


### Using a pre-existing Firebase Admin instance

If there is already an existing Firebase Admin instance, pass it using the property `instance` as shown below.

```
// Load Hapi-Firebase Auth Strategy
const HapiFirebaseAuth = require('hapi-firebase-auth');

// Initialize the default app
const admin = require('firebase-admin');

// Register the plugin
await server.register({
  plugin: HapiFirebaseAuth
});

// Initialize the Admin SDK with your credentials
// This is an example of what it should look in your code
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: '<PROJECT_ID>',
    clientEmail: 'foo@<PROJECT_ID>.iam.gserviceaccount.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\n<KEY>\n-----END PRIVATE KEY-----\n'
  }),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

// Include auth strategy using existing Firebase Admin instance
server.auth.strategy('firebase', 'firebase', {
  instance: admin
})
```

If you are having issues with Firebase Admin SDK, <a href="https://firebase.google.com/docs/admin/setup" target="_blank">click here</a> and make sure all your credentials are correct.

### Step 2 - Setup routes

Add property `auth` with value `firebase` to the `config` object in the routes you want to protect.

```
server.route({ 
  method: 'GET', 
  path: '/',
  config: { 
    auth: 'firebase' 
  },
  handler(request, reply) { 
    return "Can't touch this!" 
  }
});
```

### Step 3 - Test requests

Send requests to the protected endpoints using the `authorization` header:

```
Authorization: Bearer ey3tn03g2no5ig0gimt9gwglkrg0495gj(...)
```

* If the provided token IS `VALID`, the endpoint will be accessible as usual.
* If the provided token is `INVALID` or `EXPIRED`, a `401 - Unauthorized` error will be returned. 

## Error codes

| Code                                | Description |
|-------------------------------------|-------------------------------------------------------|
| `token_not_provided`                | `Authorization` header with `Bearer` keyword not found|
| `auth_provider_not_initialized`     | Firebase Admin was not initialized properly (check your credentials)  |
| `invalid_token`                     | The token is not valid. It could also be expired. |

## Support

24/7 customer service available. You can find the number for your area on the back of this page.

## Contribute

Contribuitions are welcome and highly encouraged! This is a simple plugin but we can always make it better ;)


