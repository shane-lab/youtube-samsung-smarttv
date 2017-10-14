import { Component, Input } from '@angular/core';

import { IVideo } from './youtube.service';

@Component({
    selector: 'youtube-video',
    template: `
    <div *ngIf="video" class="container">
        <img [defaultImage]="'assets/video_thumbnail.png'" [lazyLoad]="video.thumbnail_large"/>
        <p class="duration">{{getFormattedDuration()}}</p>
        <p class="title">{{video.title}}</p>
        <div class="content">
            <p>{{video.view_count}} views</p>
            <p>{{video.upload_date}}</p>
        </div>
    </div>
    `,
    styles: [`
        .container {
            height: 19.5em;
            width: 16.5em;
            float: left;
            color: #fff;
            margin-right: 12px;
            margin-bottom: 12px;
            text-align: center;
        }

        .container img {
            width: 100%;
        }

        .container .duration { 
            position: relative;
            top: -6px;
            right: 3px;
            padding: 0;
            color: #bbb;
            text-align: right;
            margin: 0;
            margin-top: -18px;
        }
        
        .container .title {
            height: 36px;
        }

        .content {
            text-align: left;
            color: #949494;
            text-indent: 12px;
        }

        .content p {
            margin-bottom: 0;
            margin-top: 0;
        }
    `]
})
export class YoutubeVideoComponent {
    
    @Input('video')
    public video: IVideo;

    private getFormattedDuration(prev?: string): string {
        let duration = prev || this.video.duration;

        if (/^00/.test(duration) && duration.split(':').length > 2) {
            return this.getFormattedDuration(duration.slice(3));
        }

        return duration;
    }

}