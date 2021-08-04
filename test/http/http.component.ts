import {Component, Input, OnInit} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {map} from 'rxjs/operators';

interface GreetingResponse {
    message: string;
}

interface UserDetailsResponse {
    name: string;
}

interface UserResponse {
    name: string;
    id: number;
}

@Component({
    selector: 'http',
    templateUrl: './http.component.html'
})
export class HttpComponent implements OnInit {
    public username;
    public greetingMessage: string;
    public greetingToken: string;
    public updateStatus: number;
    public partialUpdateStatus: number;
    public users: UserResponse[] = [];

    @Input()
    public userId: number;

    constructor(private readonly http: HttpClient) {
    }

    public ngOnInit(): void {
        this.http.get<UserDetailsResponse>(`/users/${this.userId}/details`)
            .subscribe(({name}) => this.username = name);
    }

    public onGreetingClick() {
        this.http.post<GreetingResponse>(
            '/greeting',
            {name: 'Jim'},
            {headers: {token: 'greeting token'}, observe: 'response'}
        ).subscribe(response => this.onGreetingResponse(response));
    }

    public onUpdateUserClick() {
        this.http.put('/me', {name: 'Tom'}, {observe: 'response'}).pipe(
            map(response => response.status)
        ).subscribe(status => this.updateStatus = status);
    }

    public onPartialUpdateUserClick() {
        this.http.patch('/me', {name: 'Tom'}, {observe: 'response'}).pipe(
            map(response => response.status)
        ).subscribe(status => this.partialUpdateStatus = status);
    }

    public onSendFormDataClick() {
        const formData = new FormData();
        formData.set('field-1', 'value-1');
        this.http.post('/me', formData).subscribe();
    }

    public onFetchUsersClick() {
        this.http.get<UserResponse[]>('/users', {params: {name: 'John'}})
            .subscribe(users => this.users = users);
    }

    private onGreetingResponse(response: HttpResponse<GreetingResponse>) {
        const {body, headers} = response;
        this.greetingMessage = body.message;

        this.greetingToken = headers.get('token');
    }
}
