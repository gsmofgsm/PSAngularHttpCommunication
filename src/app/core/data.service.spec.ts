import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';

import { DataService } from "./data.service";
import { Book } from '../models/book';
import { BookTrackerError } from 'app/models/bookTrackerError';

describe('DataService', () => {
    let dataService: DataService;
    let httpTestingController: HttpTestingController;

    let testBooks: Book[] = [
        { bookID: 1, title: 'Book 1', author: 'author one', publicationYear: 2001 },
        { bookID: 2, title: 'Book 2', author: 'author two', publicationYear: 2002 },
        { bookID: 3, title: 'Book 3', author: 'author three', publicationYear: 2003 },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService]
        });

        dataService = TestBed.get(DataService);
        httpTestingController = TestBed.get(HttpTestingController);
    });

    it('should get all books', () => {
        dataService.getAllBooks().subscribe((data: Book[]) => {
            expect(data.length).toBe(3);
        });

        const booksRequest: TestRequest = httpTestingController.expectOne('/api/books');
        expect(booksRequest.request.method === 'GET');

        booksRequest.flush(testBooks);

        httpTestingController.verify();
    });

    it('should return a BookTrackerError', () => {
        dataService.getAllBooks().subscribe(
            (data: Book[]) => fail('This should have been a error'),
            (error: BookTrackerError) => {
                expect(error.errorNumber).toBe(100);
                expect(error.friendlyMessage).toBe('An error occured retrieving data');
            }
        );

        const booksRequest: TestRequest = httpTestingController.expectOne('/api/books');

        booksRequest.flush('error', {
            status: 500,
            statusText: 'Server Error'
        });

        httpTestingController.verify();
    })
})