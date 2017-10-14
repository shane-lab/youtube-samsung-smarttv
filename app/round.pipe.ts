import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'round'
})
export class RoundPipe implements PipeTransform {
    
    transform(value: number) {
        return Math.ceil(value || 0);
    }
}