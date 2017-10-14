import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { LazyLoadImageModule } from 'ng-lazyload-image';
import { YoutubePlayerModule } from 'ng2-youtube-player';

import { AppComponent } from './app.component';

import { YoutubeChannelComponent } from './youtube-channel.component';
import { YoutubeVideoComponent } from './youtube-video.component';
import { YoutubePlayerWrapperComponent } from './youtube-player-wrapper.component';

import { SafeUrlPipe } from './safeurl.pipe';
import { RoundPipe } from './round.pipe';

@NgModule({
  imports:      [ CommonModule, BrowserModule, FormsModule, HttpModule, YoutubePlayerModule, LazyLoadImageModule ],
  declarations: [ AppComponent, YoutubeChannelComponent, YoutubeVideoComponent, YoutubePlayerWrapperComponent, SafeUrlPipe, RoundPipe ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }