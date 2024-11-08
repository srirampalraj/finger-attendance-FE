import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonModal,
  IonButton,
  IonButtons,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';
import { MatTableModule } from '@angular/material/table';
import * as _ from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IonLabel,
    IonButtons,
    IonButton,
    IonModal,
    IonItem,
    IonInput,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    MatTableModule,
  ],
})
export class HomePage implements AfterViewInit, OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  isLoggedIn: Observable<boolean> = of(false);
  loginFormGroup!: FormGroup;
  studentData: BehaviorSubject<
    Array<{
      reg: string;
      name: string;
      isPresent: boolean;
      time: string;
    }>
  > = new BehaviorSubject<
    Array<{
      reg: string;
      name: string;
      isPresent: boolean;
      time: string;
    }>
  >([]);

  studentsRec: Record<string, { name: string; reg: number }> = {
    '1': { name: 'Arjun', reg: 1 },
    '2': { name: 'Karthik', reg: 2 },
    '3': { name: 'Lakshmi', reg: 3 },
    '4': { name: 'Vikram', reg: 4 },
    '5': { name: 'Ravi', reg: 5 },
    '6': { name: 'Anjali', reg: 6 },
    '7': { name: 'Mani', reg: 7 },
    '8': { name: 'Meena', reg: 8 },
    '9': { name: 'Ramesh', reg: 9 },
    '10': { name: 'Priya', reg: 10 },
  };
  studentsRecMapped: {
    reg: string;
    name: string;
    isPresent: boolean;
    time: string;
  }[] = Object.values((rec: { name: string; reg: number }) => {
    return {
      name: rec.name,
      reg: rec.reg.toString(),
      time: '',
      isPresent: false,
    };
  });

  displayedColumns = ['reg', 'name', 'isPresent', 'time'];

  constructor(
    private fireService: FirebaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginFormGroup = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
    this.fireService.onAuthStateChanged((d) => {
      this.isLoggedIn = of(!!d);
      this.isLoggedIn.subscribe((d) => {
        if (d) {
          this.modal.dismiss();
          this.getStudentData();
        } else {
          this.studentData.next([]);
        }
      });
    });
  }

  async getStudentData() {
    this.fireService.getContacts(moment().format('YYYYMMDD'));
    this.fireService.todayStudentData.subscribe((d) => {
      if (d) {
        const dd = [d];
        const student_ = dd.map((student) => {
          return {
            name: this.studentsRec[student.fingerID].name,
            time: student.dateTime,
            reg: student.fingerID,
            isPresent: true,
          };
        });
        let allData = _.uniqBy([...student_, ...this.studentData.value], 'reg');
        _.xor(
          allData.map((s) => s.reg),
          Object.keys(this.studentsRec)
        ).forEach((d) => {
          allData.push({
            name: this.studentsRec[d].name,
            reg: d,
            isPresent: false,
            time: '',
          });
        });
        allData.sort((a, b) => parseInt(a.reg) - parseInt(b.reg));
        this.studentData.next(allData);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (this.modal && !(await this.fireService.isLoggedIn())) {
      this.modal.present();
    }
  }

  message = 'Please login to continue';
  name!: string;

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.name, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  async submit() {
    await this.fireService
      .login(
        this.loginFormGroup.value.email,
        this.loginFormGroup.value.password
      )
      .then((results) => {
        console.log(results);
      });
  }

  logoff() {
    this.fireService.logout();
  }
}
