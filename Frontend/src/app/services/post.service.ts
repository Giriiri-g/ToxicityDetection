import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface CreatePostRequest {
  title?: string;
  message: string;
  mediaUrl?: string;
  linkUrl?: string;
  thread?: string;
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
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = 'https://localhost:5001/api/posts';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    const token = this.auth.getToken();
    if (!token) {
      console.warn('No auth token available');
      // Return headers without authorization - let the backend handle auth errors
      return new HttpHeaders({});
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  createPost(req: CreatePostRequest) {
    return this.http.post<PostResponse>(this.apiUrl, req, { headers: this.headers() });
  }

  getFeed(page = 1, pageSize = 20, thread?: string) {
    const params: any = { page, pageSize };
    if (thread) {
      params.thread = thread;
    }
    return this.http.get<PostResponse[]>(`${this.apiUrl}/feed`, {
      headers: this.headers(),
      params: params
    });
  }

  getThreadCounts() {
    return this.http.get<{ thread: string; count: number }[]>(`${this.apiUrl}/thread-counts`, {
      headers: this.headers()
    });
  }
}
