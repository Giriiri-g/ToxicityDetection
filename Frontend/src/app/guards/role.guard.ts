import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const expectedRole = route.data?.['role'] as string | undefined;

    return this.auth.me().pipe(
      map((me: any) => {
        const role = me?.role;
        return expectedRole && role === expectedRole ? true : this.router.parseUrl('/signin');
      }),
      catchError(() => of(this.router.parseUrl('/signin')))
    );
  }
}

