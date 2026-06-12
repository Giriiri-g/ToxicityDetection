import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface TagScoreResponse { tag: string; score: number; }

export interface ReviewPostResponse {
  pid: string;
  userName: string;
  title: string | null;
  message: string;
  createdAt: string;
  totalToxicityScore: number;
  tagScores: TagScoreResponse[];
}

export interface ReviewHistoryItem {
  pid: string;
  title: string | null;
  totalToxicityScore: number;
  createdAt: string;
}

export interface ReviewPostDetailResponse extends ReviewPostResponse {
  mediaUrl: string | null;
  linkUrl: string | null;
  userJoined: string;
  history: ReviewHistoryItem[];
}

export interface FlaggedPostsPage {
  posts: ReviewPostResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReviewActionRequest {
  approve: boolean;
  clearScores: boolean;
  editedTags: string[] | null;
  feedback: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReviewerService {
  private readonly apiUrl = 'https://localhost:5001/api/reviewer';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getFlaggedPosts(page = 1, pageSize = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<FlaggedPostsPage>(
      `${this.apiUrl}/posts`,
      { headers: this.headers(), params }
    );
  }

  getPostDetail(id: string) {
    return this.http.get<ReviewPostDetailResponse>(
      `${this.apiUrl}/posts/${id}`,
      { headers: this.headers() }
    );
  }

  reviewPost(id: string, action: ReviewActionRequest) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/posts/${id}/review`,
      action,
      { headers: this.headers() }
    );
  }
}
