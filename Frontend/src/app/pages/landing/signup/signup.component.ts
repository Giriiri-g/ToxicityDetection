import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Country { name: string; flag: string; code: string; dial: string; }
type SignupStep = 'form' | 'verify-email' | 'verify-phone';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnDestroy {
  @Output() closeModal  = new EventEmitter<void>();
  @Output() goToSignin  = new EventEmitter<void>();

  currentStep: SignupStep = 'form';

  // Form fields
  email = ''; mobile = ''; password = ''; confirmPassword = '';
  agreed = false; showPassword = false; showConfirmPassword = false;

  // Country
  showCountryDropdown = false;
  selectedCountry: Country = { name: 'India', flag: '🇮🇳', code: 'IN', dial: '+91' };
  countries: Country[] = [
    { name: 'United States',  flag: '🇺🇸', code: 'US', dial: '+1'   },
    { name: 'Canada',         flag: '🇨🇦', code: 'CA', dial: '+1'   },
    { name: 'United Kingdom', flag: '🇬🇧', code: 'GB', dial: '+44'  },
    { name: 'Australia',      flag: '🇦🇺', code: 'AU', dial: '+61'  },
    { name: 'India',          flag: '🇮🇳', code: 'IN', dial: '+91'  },
    { name: 'Germany',        flag: '🇩🇪', code: 'DE', dial: '+49'  },
    { name: 'France',         flag: '🇫🇷', code: 'FR', dial: '+33'  },
    { name: 'Japan',          flag: '🇯🇵', code: 'JP', dial: '+81'  },
    { name: 'Singapore',      flag: '🇸🇬', code: 'SG', dial: '+65'  },
    { name: 'UAE',            flag: '🇦🇪', code: 'AE', dial: '+971' },
  ];

  // Errors
  emailError = ''; mobileError = ''; passwordError = '';
  confirmPasswordError = ''; agreedError = '';

  // OTP state — per step: sent flag, digits, error
  emailOtpSent = false; phoneOtpSent = false;
  emailOtp = ['','','','','','']; phoneOtp = ['','','','','',''];
  emailOtpError = ''; phoneOtpError = '';

  // Timers
  emailTimerSeconds = 0; phoneTimerSeconds = 0;
  emailTimerActive = false; phoneTimerActive = false;
  private emailInterval: any; private phoneInterval: any;

  // Loading
  isSubmitting = false;
  isSendingEmailOtp = false; isSendingPhoneOtp = false;
  isVerifyingEmail = false;  isVerifyingPhone = false;

  // ── Computed ────────────────────────────────────────────────────────
  get stepNumber(): number {
    return this.currentStep === 'form' ? 1 : this.currentStep === 'verify-email' ? 2 : 3;
  }
  get emailTimerDisplay(): string {
    const m = Math.floor(this.emailTimerSeconds / 60);
    return `${m}:${(this.emailTimerSeconds % 60).toString().padStart(2, '0')}`;
  }
  get phoneTimerDisplay(): string {
    const m = Math.floor(this.phoneTimerSeconds / 60);
    return `${m}:${(this.phoneTimerSeconds % 60).toString().padStart(2, '0')}`;
  }
  get maskedEmail(): string {
    const [l, d] = this.email.split('@');
    return (l?.slice(0, 2) ?? '') + '***@' + (d ?? '');
  }
  get maskedPhone(): string {
    return this.selectedCountry.dial + ' *** *** ' + this.mobile.slice(-3);
  }

  // ── Country ─────────────────────────────────────────────────────────
  toggleCountryDropdown(): void { this.showCountryDropdown = !this.showCountryDropdown; }
  selectCountry(c: Country): void { this.selectedCountry = c; this.showCountryDropdown = false; }

  // ── Validation ──────────────────────────────────────────────────────
  validateEmail(): void {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !this.email.trim() ? 'Email is required.'
      : !re.test(this.email) ? 'Enter a valid email address.' : '';
  }
  validateMobile(): void {
    const d = this.mobile.replace(/\D/g, '');
    this.mobileError = !this.mobile.trim() ? 'Mobile number is required.'
      : d.length < 7 || d.length > 15 ? 'Enter a valid mobile number (7–15 digits).' : '';
  }
  validatePassword(): void {
    this.passwordError = !this.password ? 'Password is required.'
      : this.password.length < 8 ? 'Password must be at least 8 characters.' : '';
  }
  validateConfirmPassword(): void {
    this.confirmPasswordError = !this.confirmPassword ? 'Please confirm your password.'
      : this.confirmPassword !== this.password ? 'Passwords do not match.' : '';
  }

  // ── Step 1 submit ────────────────────────────────────────────────────
  onSubmit(): void {
    this.validateEmail(); this.validateMobile();
    this.validatePassword(); this.validateConfirmPassword();
    if (!this.agreed) this.agreedError = 'You must agree to the terms to continue.';
    if (this.emailError || this.mobileError || this.passwordError || this.confirmPasswordError || this.agreedError) return;
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.emailOtpSent = false;
      this.currentStep = 'verify-email';
    }, 700);
  }

  // ── Email OTP ────────────────────────────────────────────────────────
  sendEmailOtp(): void {
    this.isSendingEmailOtp = true;
    setTimeout(() => {
      this.isSendingEmailOtp = false;
      this.emailOtpSent = true;
      this.emailOtp = ['','','','','',''];
      this.emailOtpError = '';
      this.startEmailTimer();
      setTimeout(() => (document.getElementById('eotp-0') as HTMLInputElement)?.focus(), 80);
    }, 600);
  }

  startEmailTimer(seconds = 10): void {
    this.emailTimerSeconds = seconds;
    this.emailTimerActive = true;
    clearInterval(this.emailInterval);
    this.emailInterval = setInterval(() => {
      this.emailTimerSeconds--;
      if (this.emailTimerSeconds <= 0) { this.emailTimerActive = false; clearInterval(this.emailInterval); }
    }, 1000);
  }

  onEmailOtpInput(event: Event, i: number): void {
    const val = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
    this.emailOtp[i] = val;
    if (val && i < 5) (document.getElementById(`eotp-${i + 1}`) as HTMLInputElement)?.focus();
  }
  onEmailOtpKeydown(event: KeyboardEvent, i: number): void {
    if (event.key === 'Backspace' && !this.emailOtp[i] && i > 0)
      (document.getElementById(`eotp-${i - 1}`) as HTMLInputElement)?.focus();
  }

  verifyEmail(): void {
    this.isVerifyingEmail = true;
    this.emailOtpError = '';
    setTimeout(() => {
      this.isVerifyingEmail = false;
      clearInterval(this.emailInterval);
      this.phoneOtpSent = false;
      this.currentStep = 'verify-phone';
    }, 800);
  }

  resendEmailOtp(): void {
    this.emailOtp = ['','','','','',''];
    this.startEmailTimer();
  }

  // ── Phone OTP ─────────────────────────────────────────────────────────
  sendPhoneOtp(): void {
    this.isSendingPhoneOtp = true;
    setTimeout(() => {
      this.isSendingPhoneOtp = false;
      this.phoneOtpSent = true;
      this.phoneOtp = ['','','','','',''];
      this.phoneOtpError = '';
      this.startPhoneTimer();
      setTimeout(() => (document.getElementById('potp-0') as HTMLInputElement)?.focus(), 80);
    }, 600);
  }

  startPhoneTimer(seconds = 10): void {
    this.phoneTimerSeconds = seconds;
    this.phoneTimerActive = true;
    clearInterval(this.phoneInterval);
    this.phoneInterval = setInterval(() => {
      this.phoneTimerSeconds--;
      if (this.phoneTimerSeconds <= 0) { this.phoneTimerActive = false; clearInterval(this.phoneInterval); }
    }, 1000);
  }

  onPhoneOtpInput(event: Event, i: number): void {
    const val = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
    this.phoneOtp[i] = val;
    if (val && i < 5) (document.getElementById(`potp-${i + 1}`) as HTMLInputElement)?.focus();
  }
  onPhoneOtpKeydown(event: KeyboardEvent, i: number): void {
    if (event.key === 'Backspace' && !this.phoneOtp[i] && i > 0)
      (document.getElementById(`potp-${i - 1}`) as HTMLInputElement)?.focus();
  }

  verifyPhone(): void {
    this.isVerifyingPhone = true;
    this.phoneOtpError = '';
    setTimeout(() => {
      this.isVerifyingPhone = false;
      clearInterval(this.phoneInterval);
      this.closeModal.emit();
    }, 800);
  }

  resendPhoneOtp(): void {
    this.phoneOtp = ['','','','','',''];
    this.startPhoneTimer();
  }

  // ── Navigation ────────────────────────────────────────────────────────
  goBack(): void {
    if (this.currentStep === 'verify-email') { clearInterval(this.emailInterval); this.currentStep = 'form'; }
    else if (this.currentStep === 'verify-phone') { clearInterval(this.phoneInterval); this.emailOtpSent = false; this.currentStep = 'verify-email'; }
  }
  changeEmail(): void { clearInterval(this.emailInterval); this.currentStep = 'form'; }
  changePhone(): void { clearInterval(this.phoneInterval); this.currentStep = 'form'; }
  onClose(): void { this.closeModal.emit(); }

  ngOnDestroy(): void {
    clearInterval(this.emailInterval);
    clearInterval(this.phoneInterval);
  }
}