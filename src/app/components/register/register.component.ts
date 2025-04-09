import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  // name = '';
  // email = '';
  // password = '';
  // error = '';
  // success = '';
  registerForm!: FormGroup;
  success = '';
  error = '';
 

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {}
  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        password: ['', [Validators.required, this.passwordComplexityValidator]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  passwordValidations = {
    minLength: false,
    uppercase: false,
    number: false,
    specialChar: false
  };
  onPasswordInput() {
    const password = this.registerForm.get('password')?.value || '';
  
    this.passwordValidations.minLength = password.length >= 8;
    this.passwordValidations.uppercase = /[A-Z]/.test(password);
    this.passwordValidations.number = /\d/.test(password);
    this.passwordValidations.specialChar = /[$%\/()[\]{}=?!.,\-_*@|+~#]/.test(password);
  }
  getValidationClass(rule: keyof typeof this.passwordValidations): string {
    const control = this.registerForm.get('password');
    
    if (!control?.touched) {
      return ''; // default: black
    }
  
    return this.passwordValidations[rule] ? 'text-success' : 'text-danger';
  }
  passwordMismatch: boolean = false;
  checkPasswords() {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    
    // this.passwordMismatch = !!password && !!confirmPassword && password !== confirmPassword;
    this.passwordMismatch =
    this.registerForm.get('confirmPassword')?.touched &&
    password &&
    confirmPassword &&
    password !== confirmPassword;
  }

  passwordComplexityValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) return null;
  
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=/~`[\]\\]/.test(value);
    const isLongEnough = value.length >= 8;
  
    return hasUpperCase && hasNumber && hasSpecialChar && isLongEnough
      ? null
      : { passwordComplexity: true };
  }
  
  onSubmit() {
    // templete driven
    // this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
    //   next: (res) => {
    //     this.success = 'Registration successful!';
    //     this.router.navigate(['/login']);
    //   },
    //   error: (err) => {
    //     this.error = err.error?.message || 'Registration failed';
    //   },
    // });
    // reactive form
    if (this.registerForm.invalid) return;

    const { name, email, mobile, password } = this.registerForm.value;

    this.auth.register({ name, email, mobile, password }).subscribe({
      next: (res) => {
        this.success = 'Registration successful!';
        this.router.navigate(['/login']);
        this.registerForm.reset();
        this.error = '';
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.success = '';
      }
    });
  }

}
