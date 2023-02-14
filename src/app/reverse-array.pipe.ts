import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverseArray',
})
export class ReverseArrayPipe implements PipeTransform {
  transform(value: any[]): unknown {
    return value.slice().reverse();
  }
}
