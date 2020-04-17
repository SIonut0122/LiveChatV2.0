 import * as firebase from 'firebase/app';
 import 'firebase/database';
 import 'firebase/auth';
 const apikey = `${process.env.REACT_APP_API_KEY}`

 

  var firebaseConfig = {
    apiKey: apikey,
    authDomain: "livechat-v20.firebaseapp.com",
    databaseURL: "https://livechat-v20.firebaseio.com",
    projectId: "livechat-v20",
    storageBucket: "livechat-v20.appspot.com",
    messagingSenderId: "90898545617",
    appId: "1:90898545617:web:7fbf6111135b97811b7ef0",
    measurementId: "G-SE3GHPY8Y3"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
 
  // Online users database
  let dbRef = firebase.database().ref('dbRef');

  // Define Database 
  let getDataBase    = firebase.database();

  // Get online users from database
  let getdbRefData = getDataBase.ref('dbRef');


export {
   firebase, dbRef,getdbRefData as default
  }