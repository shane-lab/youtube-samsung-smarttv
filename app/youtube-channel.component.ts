import { IChannel } from './youtube.service';

import { Component, Input } from '@angular/core';

@Component({
    selector: 'youtube-channel',
    template: `
        <div *ngIf="channel" class="container">
            <img [defaultImage]="'assets/channel_thumbnail.png'" [lazyLoad]="channel.thumbnail"/>
            <p>{{channel.title}}</p>
        </div>
    `,
    styles: [`
        .container {
            height: 14em;
            width: 10em;
            float: left;
            color: #fff;
            margin-right: 12px;
            margin-bottom: 12px;
            text-align: center;
        }

        .container img {
            width: 100%;
        }
    `]
})
export class YoutubeChannelComponent {

    @Input('channel')
    public channel: IChannel;

}