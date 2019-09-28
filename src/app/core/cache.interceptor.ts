import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

import { HttpCacheService } from '../services/http-cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
    constructor(private cacheService: HttpCacheService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // pass along non-cachable request and invalid the cache
        if (req.method !== 'GET') {
            console.log(`Invalidating cache ${req.method} ${req.url}`);
            this.cacheService.invalidCache();
            return next.handle(req);
        }

        // attempt to retrieve a cached response
        const cachedResponse: HttpResponse<any> = this.cacheService.get(req.url);

        // return the cached response
        if (cachedResponse) {
            console.log(`Returning a cached response ${cachedResponse.url}`);
            console.log(cachedResponse);
            return of(cachedResponse);
        }

        // send request to server and add response to cache
        return next.handle(req).pipe(
            tap(event => {
                if (event instanceof HttpResponse) {
                    console.log(`Adding item to cache ${req.url}`);
                    this.cacheService.put(req.url, event);
                }
            })
        );
    }
}