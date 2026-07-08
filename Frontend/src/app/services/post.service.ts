import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface CreatePostRequest {
  title?: string;
  message: string;
  mediaUrl?: string;
  linkUrl?: string;
  thread?: string;
  PPID?: string;
}

export interface TagScoreResponse {
  tag: string;
}

export interface PostResponse {
  pid: string;
  userName: string;
  title?: string;
  message: string;
  mediaUrl?: string;
  linkUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  tagScores: TagScoreResponse[];
  thread?: string;
  ppid?: string;
  isBlurred: boolean;
  isLikedByUser: boolean;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = 'https://localhost:5001/api/posts';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    const token = this.auth.getToken();
    if (!token) {
      console.warn('No auth token available');
      return new HttpHeaders({});
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  createPost(req: CreatePostRequest) {
    return this.http.post<PostResponse>(this.apiUrl, req, { headers: this.headers() });
  }

  getFeed(page = 1, pageSize = 20, thread?: string) {
    const params: any = { page, pageSize };
    if (thread) params.thread = thread;
    return this.http.get<PostResponse[]>(`${this.apiUrl}/feed`, {
      headers: this.headers(),
      params,
    });
  }

  getThreadCounts() {
    return this.http.get<{ thread: string; count: number }[]>(
      `${this.apiUrl}/thread-counts`,
      { headers: this.headers() }
    );
  }

  getPostById(postId: string): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${this.apiUrl}/${postId}`, {
      headers: this.headers(),
    });
  }

  getCommentsForPost(postId: string): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/${postId}/comments`, {
      headers: this.headers(),
    });
  }

  likePost(postId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${postId}/like`,
      {},
      { headers: this.headers() }
    );
  }

  unlikePost(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${postId}/like`,
      { headers: this.headers() }
    );
  }
}
