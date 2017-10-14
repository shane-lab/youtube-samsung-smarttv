import { Component, ViewChild, HostListener } from '@angular/core';

import { YoutubePlayerWrapperComponent } from './youtube-player-wrapper.component';

import { YoutubeService, IChannel, IVideo, IPlayList } from './youtube.service';

enum Mode {
    Loading = -1,
    Subscriptions = 0,
    Channel = 1
};

type Video = IVideo & {
    exitTime?: number;
    resume?: boolean;
};

@Component({
    selector: 'my-app',
    template: `
        <div class="container">
            <div class="top">
                <div class="logo"></div>
            </div>
            <h1 *ngIf="debug" style="color: #0000ff">Debug: {{debug | json}}</h1>
            <div class="content">
                <div class="routes">
                    <div class="route" [ngClass]="{'active': mode === 0}">Subscriptions</div>
                    <div class="route" [ngClass]="{'active': mode === 1}">{{activeChannel?.title || 'Channel'}}</div>
                </div>

                <h1 *ngIf="error" style="text-align: center; color: #ff0000">{{error}}</h1>

                <ng-container *ngIf="!error">
                    <div [hidden]="mode !== 0">
                        <youtube-channel *ngFor="let channel of channels | slice:12 * channelPageIndex:12 * (channelPageIndex + 1); let i = index" [ngClass]="{'active': (i + (channelPageIndex * 12)) === channelIndex}" [channel]="channel" (click)="onChannelClick(channel)"></youtube-channel>

                        <div *ngIf="channels && channels.length > 12" class="paginator">page {{channelPageIndex + 1}} of {{1 + (12 / channels.length)| round}}</div>
                    </div>

                    <div class="videocontainer" [hidden]="mode !== 1" *ngIf="activeChannel" [style.width.px]="getDynamicWidth()" [style.left.px]="getVerticalScroll()" [style.opacity]="acceptance ? 0.4 : 1">
                        <youtube-video *ngFor="let video of playList?.videos; let i = index;" [ngClass]="{'active': i === videoIndex, 'resumable': video.exitTime > 0, 'resume': video.resume}" [video]="video" (click)="onVideoClick(video)"></youtube-video>
                    </div>

                    <div *ngIf="mode === -1" class="spinner">
                        <div class="bounce1"></div>
                        <div class="bounce2"></div>
                        <div class="bounce3"></div>
                    </div>

                    <div *ngIf="acceptance" class="simple-modal">
                        <h4 [innerHTML]="acceptanceText">Accept</h4>
                    </div>
                </ng-container>
            </div>
        </div>
        <youtube-player-wrapper *ngIf="activeVideo" [video]="activeVideo" [start]="activeVideo.resume ? activeVideo.exitTime : 0"></youtube-player-wrapper>
    `,
    styles: [`
        .container {
            margin-left: 144px;
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
        }

        .top {
            height: 5em;
            left: 0;
            position: relative;
            right: 0;
            top: 0;
        }

        .logo {
            display: block;
            top: 2em;
            position: absolute;
            background: no-repeat url('assets/icons.png') -24px -600px;
            background-size: auto;
            width: 73px;
            height: 30px;
        }

        .content {
            position: relative;
        }

        .routes {
            height: 5em;
            left: 0;
            right: 0;
            top: 0;
        }

        .route {
            line-height: 2.6em;
            height: 2.6em;
            width: 12.9em;
            color: #b9b9b9;
            text-align: center;
            vertical-align: middle;
            background-color: #505050;
            padding-top: 0.2em;
            float: left;
            margin-right: 12px;
        }

        .route.active {
            background-color: #e12c26;
            color: #fff;
        }

        .paginator {
            position: fixed;
            top: 636px;
            color: #b9b9b9 !important;
            width: 98px;
            height: 35px;
            line-height: 35px;
            display: block;
            text-align: center;
            opacity: 0.5;
        }

        .videocontainer {
            position: absolute;
        }

        .simple-modal {
            position: absolute;
            line-height: 2.6em;
            width: 12.9em;
            text-align: center;
            vertical-align: middle;
            padding-top: 0.2em;
            top: 134px;
            left: 465px;
            background-color: #e12c26;
            color: #fff;
            box-shadow: 2px 4px 2px 0px rgba(0,0,0, .25);
        }
        
        :host >>> youtube-channel > .container:hover {
            background: #333 !important;
        }

        :host >>> youtube-video > .container:hover {
            background: #333 !important;
        }

        :host >>> youtube-channel.active > .container {
            background: #fff !important;
            color: #111 !important;
        }

        :host >>> youtube-video.active > .container {
            background: #fff !important;
            color: #111 !important;
        }
        
        :host >>> youtube-video.resumable > .container::after {
            content: 'resume';
            position: relative;
            color: #b9b9b9 !important;
            background: #505050;
            width: 70px;
            height: 35px;
            line-height: 35px;
            left: 97px;
            margin-top: 12px;
            display: block;
            opacity: 0.2;
        }
        
        :host >>> youtube-video.resume > .container::after {
            background: #e12c26;
            color: #ffffff !important;
        }

        :host >>> youtube-video.active > .container::after {
            opacity: 1;
        }

        /*:host >>> youtube-video.active.resumable.resume:after {
            content: 'resume';
            position: absolute;
            color: #b9b9b9 !important;
            width: 70px;
            height: 24px;
            line-height: 24px;
            left: 97px;
            margin-top: 354px;
            display: block;
            opacity: 0.8;
            text-align: center;
            content: '00:49';
        }*/

        .spinner {
            margin: 144px auto 0;
            width: 240px;
            text-align: center;
        }
        .spinner > div {
            width: 56px;
            height: 56px;
            background-color: #FFFFFF;
            
            border-radius: 100%;
            display: inline-block;
            -webkit-animation: bouncedelay 1.4s infinite ease-in-out;
            animation: bouncedelay 1.4s infinite ease-in-out;
            /* Prevent first frame from flickering when animation starts */
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
        }
        .spinner .bounce1 {
            -webkit-animation-delay: -0.32s;
            animation-delay: -0.32s;
        }
        .spinner .bounce2 {
            -webkit-animation-delay: -0.16s;
            animation-delay: -0.16s;
        }
        @-webkit-keyframes bouncedelay {
            0%, 80%, 100% { -webkit-transform: scale(0.0) }
            40% { -webkit-transform: scale(1.0) }
        }
        @keyframes bouncedelay {
            0%, 80%, 100% { 
              transform: scale(0.0);
              -webkit-transform: scale(0.0);
            } 40% { 
              transform: scale(1.0);
              -webkit-transform: scale(1.0);
            }
        }   
    `],
    providers: [YoutubeService]
})
export class AppComponent {

    private error: string | Error;

    private debug: any;

    private static VIDEO_WIDTH = 276;

    private static TIMEOUT = SamsungAPI.isSamsungTv() ? 1000 : 0; // ~1s

    @ViewChild(YoutubePlayerWrapperComponent)
    private readonly player: YoutubePlayerWrapperComponent;

    private mode: Mode = Mode.Loading;

    private channels: IChannel[];

    private playList: IPlayList;

    private activeChannel: IChannel; // | string = 'Channel';

    private activeVideo: Video;// = { id: 'vjLPX5esklk' };

    private channelIndex = 0;

    private channelPageIndex = 0;

    private playListPageIndex = 0;

    private videoIndex = 0;

    private macAddress: string;

    private acceptanceText: string;

    private acceptance: Function;

    constructor(private service: YoutubeService) {
        this.macAddress = SamsungAPI.getMacAddress();

        this.loadSubscriptions();
    }

    private loadSubscriptions() {
        this.mode = Mode.Loading;

        // restore defaults;
        if (this.error) {
            this.error = 
            this.activeChannel = 
            this.activeVideo = 
            this.acceptance = null;
            
            this.channelIndex = this.channelPageIndex = 0;
        }

        this.service.getSubscriptions(this.macAddress)
            .then(response => {
                this.channels = response.result;

                // adding additional loading time for Samsung's maple browser
                setTimeout(() => {
                    this.mode = Mode.Subscriptions;
                }, AppComponent.TIMEOUT);
            })
            .catch(error => {
                this.error = error;
            });
    }

    private onChannelClick(channel: IChannel, pageToken?: string, lastIndex: boolean = false) {
        this.error = null;

        this.playList = null;

        this.activeChannel = channel;

        this.mode = Mode.Loading;

        this.service.getChannelVideos(this.macAddress, channel.channelId, pageToken)
            .then(response => {
                this.playList = response.result;
                
                this.videoIndex = lastIndex && this.hasVideos() ? this.playList.videos.length - 1 : 0;

                // adding additional loading time for Samsung's maple browser
                setTimeout(() => {
                    this.mode = Mode.Channel;
                }, AppComponent.TIMEOUT);
            })
            .catch(error => {
                this.error = error;

                this.activeChannel = null;

                this.mode = Mode.Subscriptions;
            });
    }

    private onVideoClick(video: Video) {
        this.error = null;

        this.activeVideo = video;
    }

    private hasVideos() {
        return this.playList && this.playList.videos;
    }

    private wasPreviouslyWatched(video: Video) {
        return !!video && video.exitTime;
    }

    private getDynamicWidth() {
        return this.hasVideos() ? this.playList.videos.length * AppComponent.VIDEO_WIDTH : null;
    }

    private getVerticalScroll() {
        let length = this.hasVideos() ? this.playList.videos.length : 0;
        return this.videoIndex <= 1 ? 0 : -(AppComponent.VIDEO_WIDTH * (length <= 0 ? 0 : (this.videoIndex - (this.videoIndex < (length - 1) ? 1 : 2))));
    }

    @HostListener(`window:${SamsungAPI.eventName}`, ['$event'])
    public handleKeyboardEvent(event: Event & { keyCode: number }) {
        // console.log(`app.component.keyboardHandler, keydown: ${event.keyCode}`);

        let keyCode = event.keyCode;

        // select diff channel, but keep videos loaded.
        if (keyCode === SamsungAPI.tvKey.KEY_TOOLS && this.activeChannel) {
            this.acceptance = null;
            this.mode = this.mode !== Mode.Subscriptions ? Mode.Subscriptions : Mode.Channel;
        }

        // if an error occurred (e.g. API server down), attempt to resolve the issue with key 0
        if (this.error && keyCode === SamsungAPI.tvKey.KEY_0) {
            return this.loadSubscriptions();
        }

        if (this.mode === Mode.Subscriptions) {
            this.handleSubscriptionsNav(event.keyCode)
        }
        if (this.mode === Mode.Channel && !this.activeVideo) {
            this.handleChannelNav(event.keyCode);
        }
        if (this.activeVideo) {
            if (this.player) {
                this.player.onKeyDown(event.keyCode);
            }
            if (event.keyCode === SamsungAPI.tvKey.KEY_RETURN) {
                let video = this.playList.videos[this.videoIndex] as Video;
                if (!!video) {
                    let durationWatched = this.player.getCurrentTime();
                    let duration = this.player.getDuration();

                    video.resume = durationWatched >= 30 && durationWatched <= (duration * .95);
                    video.exitTime = video.resume ? durationWatched : null;
                }
                this.activeVideo = null;
            }
        }
    }

    private handleSubscriptionsNav(keyCode: number) {
        switch (keyCode) {
            case SamsungAPI.tvKey.KEY_ENTER:
                if (this.channelIndex >= 0 && this.channelIndex < this.channels.length) {
                    this.onChannelClick(this.channels[this.channelIndex]);
                }
                break;
            case SamsungAPI.tvKey.KEY_UP:
                if (this.channelIndex >= 6) {
                    this.channelIndex -= 6;
                }
                break;
            case SamsungAPI.tvKey.KEY_DOWN:
                this.channelIndex += 6;
                break;
            case SamsungAPI.tvKey.KEY_RIGHT:
                if (this.channelIndex < this.channels.length - 1) {
                    this.channelIndex++;
                }
                break;
            case SamsungAPI.tvKey.KEY_LEFT:
                if (this.channelIndex > 0) {
                    this.channelIndex--;
                }
                break;
            default: break;
        }

        if (this.channelIndex < 0) {
            this.channelIndex = 0;
        }
        if (this.channelIndex >= this.channels.length) {
            this.channelIndex = this.channels.length - 1;
        }

        this.channelPageIndex = Math.floor(this.channelIndex / 12);
    }

    private handleChannelNav(keyCode: number) {
        if (!!this.acceptance) {
            if (keyCode === SamsungAPI.tvKey.KEY_ENTER) {
                this.acceptance();
            }

            this.acceptance = null;
            return;
        }

        switch (keyCode) {
            case SamsungAPI.tvKey.KEY_ENTER:
                if (this.videoIndex >= 0 && this.videoIndex < this.playList.videos.length) {
                    this.onVideoClick(this.playList.videos[this.videoIndex]);
                }
                break;
            case SamsungAPI.tvKey.KEY_RETURN:
                this.mode = Mode.Subscriptions;
                this.activeChannel = null;
                this.playList = null;
                break;
            case SamsungAPI.tvKey.KEY_UP:
            case SamsungAPI.tvKey.KEY_DOWN:
                let video = this.playList.videos[this.videoIndex] as Video;
                if (this.wasPreviouslyWatched(video)) {
                    video.resume = !video.resume;
                }
                break;
            case SamsungAPI.tvKey.KEY_RIGHT:
                if (this.videoIndex < this.playList.videos.length - 1) {
                    this.videoIndex++;
                } else {
                    if (this.playList.nextPageToken) {
                        this.acceptanceText = 'Next &raquo;';
                        this.acceptance = () => this.onChannelClick(this.activeChannel, this.playList.nextPageToken);
                    }
                }
                break;
            case SamsungAPI.tvKey.KEY_LEFT:
                if (this.videoIndex > 0) {
                    this.videoIndex--;
                } else {
                    if (this.playList.prevPageToken) {
                        this.acceptanceText = '&laquo; Previous';
                        this.acceptance = () => this.onChannelClick(this.activeChannel, this.playList.prevPageToken, true);
                    }
                }
                break;
            case SamsungAPI.tvKey.KEY_FF:
                this.videoIndex = this.playList.videos.length - 1;
                break;
            case SamsungAPI.tvKey.KEY_RW:
                this.videoIndex = 0;
                break;
            default: break;
        }
    }
}