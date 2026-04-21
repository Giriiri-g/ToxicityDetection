import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedItem } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class FeedService {
  constructor(private http: HttpClient) {}

  getFeed(): Observable<FeedItem[]> {
    return this.http.get<FeedItem[]>('assets/data/feed.json');
  }
}
