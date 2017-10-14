import { Component, Input, Output, ViewChild, ElementRef } from '@angular/core';

import { IVideo } from './youtube.service';

const setPromisedTimeout = (handler: Function, delay: number) => new Promise((resolve, reject) => {
    let timeout = setTimeout(() => {
        clearTimeout(timeout);

        resolve(handler());
    }, delay);
});

@Component({
    selector: 'youtube-player-wrapper',
    template: `
        <div class="container">
            <youtube-player [hidden]="preparing"
                [videoId]="video?.id"
                (ready)="onReady($event)"
                (change)="onStateChange($event)"
                [width]="1280"
                [height]="720"
                [playerVars]="playerVars"
            ></youtube-player>
            <div *ngIf="status" class="toast">
                <div class="status" [style.background]="status.color">{{status.type.toUpperCase()}}</div>
            </div>
            <div [hidden]="!info" class="backdrop">
                <div class="details">
                    <h4>{{video?.title}}</h4>
                    <table>
                        <tr>
                            <td>views:</td>
                            <td>{{video?.view_count}}</td>
                        </tr>
                        <tr>
                            <td>duration:</td>
                            <td style="text-align: right;">{{video?.duration}}</td>
                        </tr>
                        <tr>
                            <td>runtime:</td>
                            <td style="text-align: right;">{{formattedRuntime}}</td>
                        </tr>
                    </table>
                </div>
                <div *ngIf="progress" class="progress">
                    <div class="progress-bar" [style.width.%]="progress"></div>
                    <p class="progress-text">{{progress.toFixed(2)}}%</p>
                </div>
            </div>
            <div *ngIf="preparing" class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
        </div>
    `,
    styles: [`
        .container {
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
            background: #000;
        }

        .toast {
            box-shadow: 0.1em 0 1em 0em black;
            position: absolute;
            top: 0;
            left: 1120px;
            background: #333;
            height: 40px;
            width: 160px;
            color: #fff;
            font-weight: bold;
        }

        .status {
            position: relative;
            top: 10px;
            left: 10px;
            background: #b9b9b9;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            text-indent: 40px;
            line-height: 20px;
            border: 2px solid #222;
            text-shadow: black 1px 2px 3px;
        }

        .backdrop { 
            width: 100%;
            min-width: 1280px;
            height: 100%;
            min-height: 720px;
            /* background: #b90e03; */
            position: fixed;
            top: 0;
            left: 0;
            -webkit-box-shadow: inset 0 0 156px #000;
            box-shadow: inset 0 0 156px #000;
        }

        .details { 
            position: absolute;
            top: 0;
            left: 0;
            margin: 12px 0 0 12px;
            color: #e6e6e6;
            text-shadow: 1px 1px 1px #000;
        }

        .details h4 {
            margin-top: 0;
        }

        .progress {
            position: absolute;
            margin: 0;
            width: 1024px;
            left: 128px;
            top: 682px;
            padding: 4px;
            background: rgba(0, 0, 0, 0.25);
            border-radius: 6px;
            -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08);
        }

        .progress-bar {
            height: 18px;
            border-radius: 4px;
            background-image: -webkit-linear-gradient(top, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0.2));
            background-image: -moz-linear-gradient(top, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0.2));
            background-image: -o-linear-gradient(top, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0.2));
            background-image: linear-gradient(to bottom, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0.2));
            -webkit-transition: 0.4s linear;
            -moz-transition: 0.4s linear;
            -o-transition: 0.4s linear;
            transition: 0.4s linear;
            -webkit-transition-property: width, background-color;
            -moz-transition-property: width, background-color;
            -o-transition-property: width, background-color;
            transition-property: width, background-color;
            -webkit-box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.25), inset 0 1px rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.25), inset 0 1px rgba(255, 255, 255, 0.1);
        }

        .progress-text {
            position: absolute;
            top: 4px;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 18px;
            line-height: 18px;
            color: #e6e6e6;
            text-align: center;
            text-shadow: 1px 1px 1px #000;
        }

        .spinner {
            margin: 330px auto 0;
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
})
export class YoutubePlayerWrapperComponent {

    private static STATUSES = {
        0: { type: 'ended', color: '#FFFF00' },
        // 1: { type: 'playing', color: '#6DFF00' },
        2: { type: 'paused', color: '#DD2C00' },
        3: { type: 'buffering', color: '#FF6D00' },
        5: { type: 'ready', color: '#AA00FF' },
        6: { type: 'resume', color: '#6DFF00' },
    }

    @Input('video')
    public video: IVideo;

    @Input('start')
    public startTime: number;

    private playerVars: YT.PlayerVars = {
        rel: 0, // disable related videos 
        fs: 0, // disable full screen
        disablekb: 1 // disable keyboard
    }

    private preparing = true;

    private player: YT.Player;

    private status: { type: string, color: string };

    private statusCode: number = -1;

    private formattedRuntime: string;

    private progress: number;

    private timer: NodeJS.Timer;

    private info = false;

    public getCurrentTime() {
        return this.statusCode > 0 ? this.player.getCurrentTime() : 0;
    }

    public getDuration() {
        return this.player.getDuration();
    }

    private onReady(player: YT.Player) {
        this.preparing = false;
        this.player = player;

        player.playVideo();

        if (SamsungAPI.isSamsungTv() && this.startTime > 0) {
            this.startAt(this.startTime);
        }
    }

    private startAt(startTime: number) {
        startTime = Math.floor(startTime);

        this.player.seekTo(startTime, true);

        // check if a valid starttime was given
        if (startTime > 0 && startTime < this.player.getDuration()) {

            // add additional buffer-time for maple browsers
            if (SamsungAPI.isSamsungTv()) {

                // disable sound while buffering
                this.player.setVolume(0);

                // needs to pause temporarly at the requested starttime, 
                // resume after some additional buffering
                setPromisedTimeout(() => this.player.pauseVideo(), 1000)
                    .then(() => {
                        this.setState(3);

                        setPromisedTimeout(() => {
                            this.player.playVideo();

                            this.player.setVolume(100);
                        }, 2000);
                    });
            }
        } else {
            if (this.statusCode === 1) {
                return;
            }

            this.player.playVideo();
        }
    }

    private onStateChange(event: Event & { data: number }) {
        this.setState(event.data);
    }

    private setState(state: number) {
        this.statusCode = state;
        this.status = (state in YoutubePlayerWrapperComponent.STATUSES) ? YoutubePlayerWrapperComponent.STATUSES[state] : null;

        if (state === 0 && this.player.getCurrentTime() >= this.player.getDuration()) {
            this.info = false;
            this.player.stopVideo();
        }

        if (state === 1) {
            if (this.timer) {
                return;
            }

            if (this.preparing) {
                this.preparing = false;
            }

            const duration = this.getDuration();

            this.timer = setInterval(() => {
                let currentTime = this.getCurrentTime();

                let date = new Date(null);
                date.setSeconds(currentTime);

                this.formattedRuntime = date.toISOString().substr(11, 8);
                this.progress = (currentTime / duration) * 100;
            }, 1000);
        } else {
            this.info = false;
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    private setRelativeTime(seconds: number) {
        let duration = this.player.getDuration();
        let next = this.player.getCurrentTime() + seconds;
        if (next > 0 && next < duration) {
            this.player.seekTo(next, true);
        }
    }

    public onKeyDown(keyCode: number) {
        if (!this.video) {
            return;
        }
        let duration = this.player.getDuration();
        let currentTime = this.player.getCurrentTime();

        switch (keyCode) {
            case SamsungAPI.tvKey.KEY_ENTER:
                switch (this.statusCode) {
                    case 2:
                        this.setState(6);
                    case 5:
                        this.player.playVideo();
                        break;
                    default:
                        this.player.pauseVideo();
                        break;
                }
                break;
            case SamsungAPI.tvKey.KEY_FF:
                this.setRelativeTime(15);
                break;
            case SamsungAPI.tvKey.KEY_RW:
                this.setRelativeTime(-15);
                break;
            case (this.statusCode === 1 && SamsungAPI.tvKey.KEY_INFO):
                this.info = !this.info;
                break;
            case SamsungAPI.tvKey.KEY_0: // attempt to fix the videoplayer at the current time
                this.startAt(currentTime);
                break;
        }
    }
}
