import { firebaseConfig } from './firebaseConfig.js';
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const signIn = (email, password) => firebase.auth()
  .signInWithEmailAndPassword(email, password);

export const createUser = (email, password) => firebase.auth()
  .createUserWithEmailAndPassword(email, password);

export const persistencia = () => firebase.auth()
  .setPersistence(firebase.auth.Auth.Persistence.SESSION);

export const googleRegister = () => firebase.auth()
  .signInWithPopup(new firebase.auth.GoogleAuthProvider());

export const signOut = () => firebase.auth().signOut();
export const getUser = () => firebase.auth().currentUser;
export const sendEmail = () => firebase.auth().currentUser.sendEmailVerification();
export const db = firebase.firestore();
