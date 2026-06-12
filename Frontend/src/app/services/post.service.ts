import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface CreatePostRequest {
  title?: string;
  message: string;
  mediaUrl?: string;
  linkUrl?: string;
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
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = 'https://localhost:5001/api/posts';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  createPost(req: CreatePostRequest) {
    return this.http.post<PostResponse>(this.apiUrl, req, { headers: this.headers() });
  }

  getFeed(page = 1, pageSize = 20) {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/feed`, {
      headers: this.headers(),
      params: { page, pageSize }
    });
  }
}
