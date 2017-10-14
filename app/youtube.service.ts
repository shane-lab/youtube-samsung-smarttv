import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/RX';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface IChannel {
    title: string,
    channelId: string,
    thumbnail: string
}

export interface IVideo {
    id: string,
    title?: string,
    description?: string,
    duration?: string,
    upload_date?: string,
    view_count?: string,
    thumbnail_small?: string,
    thumbnail_large?: string
}

export interface IPlayList {
    nextPageToken?: string,
    prevPageToken?: string,
    videos: IVideo[]
}

type YoutubeResult<T> = {
    route: string,
    result: T,
    args?: object
};

/**
 * 
 * @param prop unique identifying property
 * @param obj matching T
 */
function isInstanceOf<T>(prop: string, obj: any): obj is T {
    if (!prop || typeof obj !== 'object') {
        return false;
    }

    return prop in obj;
}

export const isChannel = (channelObj: any) => isInstanceOf<IChannel>('channelId', channelObj);

export const isVideo = (videoObj: any) => isInstanceOf<IVideo>('id', videoObj);

@Injectable()
export class YoutubeService {

    private static URI: string = 'https://youtube.shanelab.nl/api.php';

    private static ROUTES = {
        SUBSCRIPTIONS: 'subscriptions',
        CHANNEL: 'channel',
        VIDEO: 'video'
    };

    constructor(private httpClient: Http) { }

    /**
     * 
     * @param macAddress 
     */
    public getSubscriptions(macAddress: string) {
        return this.requestQ<IChannel[]>(YoutubeService.ROUTES.SUBSCRIPTIONS, macAddress);
    }

    /**
     * 
     * @param macAddress 
     * @param channelId 
     */
    public getChannelVideos(macAddress: string, channelId: string, pageToken?: string) {
        return this.requestQ<IPlayList>(YoutubeService.ROUTES.CHANNEL, macAddress, { channelId, pageToken });
    }

    /**
     * 
     * @param macAddress 
     * @param videoId 
     */
    public getVideoDetails(macAddress: string, videoId: string) {
        return this.requestQ<IVideo>(YoutubeService.ROUTES.VIDEO, macAddress, { videoId })
    }

    /**
     * 
     * @param route 
     * @param macAddress 
     * @param args 
     */
    public getByRoute<K extends keyof typeof YoutubeService.ROUTES>(route: K, macAddress: string, args: object = null) {
        return this.requestQ(YoutubeService.ROUTES[route], macAddress, args);
    }

    private requestQ<T>(route: string, macAddress: string, args: object = null): Promise<YoutubeResult<T>> {
        const endpoint = `${YoutubeService.URI}?action=${route}&mac=${macAddress}`.concat(this.resolveParams(args));

        return new Promise((resolve, reject) => {
            if (SamsungAPI.isSamsungTv()) {
                let request = new XMLHttpRequest();
                request.onreadystatechange = () => {
                  if (request.readyState === 4 && request.responseText) {
                    let result = JSON.parse(request.responseText);
                    if (!result) {
                        return reject(new Error(`Server error while resolving, possible outdated api endpoint '${endpoint}'`));
                    }
                    if (result.error) {
                        return reject(new Error(result.error || 'No items were found'));
                    }
            
                    resolve({ route, result, args });
                  }
                };
                request.onerror = (error: any) => {
                    reject(error || new Error(`Server error, possible outdated api endpoint '${endpoint}'`));
                }
                request.open('GET', endpoint, true);
                request.setRequestHeader('Access-Control-Allow-Origin', '*');
                request.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
                request.setRequestHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
                request.send();
            } else {
                this.httpClient.get(endpoint)
                    .map((res: Response) => res.json())
                    .catch((error: any) => Observable.throw(error || error.json().error || 'Server error'))
                    .subscribe(result => {
                        if (!result) {
                            return reject(new Error(`Server error while resolving, possible outdated api endpoint '${endpoint}'`));
                        }
                        if (result.error) {
                            return reject(new Error(result.error || 'No items were found'));
                        }
    
                        resolve({ route, result, args });
                    }, error => {
                        return reject(error || new Error(`Server error, possible outdated api endpoint '${endpoint}'`))
                    });
            }
        });
    }
    
    private resolveParams(args: object): string {
        if (!args) {
            return '';
        }

        return Object.keys(args).map(key => !args[key] ? '' : (`&${key}=${args[key]}`)).join('');
    }
}