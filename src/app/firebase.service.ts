import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db: firebase.database.Database;
  private auth: firebase.auth.Auth;
  todayStudentData: BehaviorSubject<{
    fingerID: string;
    confidence: string;
    dateTime: string;
  } | null> = new BehaviorSubject<{
    fingerID: string;
    confidence: string;
    dateTime: string;
  } | null>(null);

  constructor() {
    this.db = firebase.database();
    this.auth = firebase.auth();
  }

  login(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout(): Promise<void> {
    return this.auth
      .signOut()
      .then((e) => {
        console.log('logged out');
      })
      .catch((ee) => {
        console.error(ee);
      });
  }

  isLoggedIn(): firebase.User | null {
    return this.auth.currentUser;
  }

  getContacts(date: string): void {
    this.db.ref(`/${date}`).on('child_added', (data) => {
      const val = data.val();
      this.todayStudentData.next(val);
    });
  }

  onAuthStateChanged(arg0: (user: firebase.User | null) => void) {
    this.auth.onAuthStateChanged((user) => {
      arg0(user);
    });
  }
}
