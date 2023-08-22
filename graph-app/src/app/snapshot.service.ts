import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * This service is used to share a canvas element to be shared in Team's chat.
 */
@Injectable({ providedIn: 'root' })
export class SnapshotService {
  shareWidget = new Subject<HTMLCanvasElement>();
}