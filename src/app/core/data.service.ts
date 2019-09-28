import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'

import { allBooks, allReaders } from 'app/data';
import { Reader } from "app/models/reader";
import { Book } from "app/models/book";
import { OldBook } from "app/models/oldBook";
import { BookTrackerError } from 'app/models/bookTrackerError';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  mostPopularBook: Book = allBooks[0];

  setMostPopularBook(popularBook: Book): void {
    this.mostPopularBook = popularBook;
  }

  getAllReaders(): Reader[] {
    return allReaders;
  }

  getReaderById(id: number): Reader {
    return allReaders.find(reader => reader.readerID === id);
  }

  getAllBooks(): Observable<Book[] | BookTrackerError> {
    console.log('getting books from server...')
    return this.http.get<Book[]>('/api/errors/500').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  private handleHttpError(err: HttpErrorResponse): Observable<BookTrackerError> {
    const dataError = new BookTrackerError();

    dataError.errorNumber = 100;
    dataError.message = err.statusText;
    dataError.friendlyMessage = 'An error occured retrieving data';

    return throwError(dataError);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`/api/books/${id}`, {
      headers: new HttpHeaders({
        Accept: 'application/json',
        Authrozation: 'my-token'
      })
    });
  }

  getOldBookById(id: number): Observable<OldBook> {
    return this.http.get<Book>(`/api/books/${id}`)
      .pipe(
        map((book: Book) => <OldBook>{
          bookTitle: book.title,
          year: book.publicationYear
        }),
        tap(b => { console.log(b); })
      )
  }

  addBook(newBook: Book): Observable<Book> {
    return this.http.post<Book>('/api/books', newBook, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
  }

  updateBook(updatedBook: Book): Observable<void> {
    return this.http.put<void>(`/api/books/${updatedBook.bookID}`, updatedBook, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
  }

  deleteBook(bookID: number): Observable<void> {
    return this.http.delete<void>(`/api/books/${bookID}`);
  }
}
