import { Component, OnInit } from '@angular/core';
import { fromEvent, take, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  devices:MediaDeviceInfo[] = [];
  context:AudioContext = new (window.AudioContext || ( window as any ).webkitAudioContext)();
  osc:OscillatorNode = this.context.createOscillator();

  audioMasterDestination:MediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode( this.context )
  audioMasterStream!:MediaStream;

  audio = new Audio();

  constructor () {

    fromEvent( window, 'mousedown' ).pipe(
      take( 1 ),
      tap( _ => {
        navigator.mediaDevices.getUserMedia({audio: true, video: false})
        .then( stream => {

          const sourceStream = this.context.createMediaStreamSource( stream );

          sourceStream.connect( this.audioMasterDestination )

          const newStream = this.audioMasterDestination.stream

          this.audioMasterStream = newStream;

          this.audio.srcObject = this.audioMasterStream;

          this.audio.play();

          return ( navigator.mediaDevices.enumerateDevices() )

        } ).then(
          devices => this.devices = devices
        )
      } )
    ).subscribe()

  }

  get filteredDevices ():MediaDeviceInfo[] {

    return ( this.devices.filter( device => device.kind === 'audiooutput' ) );

  }

  changeSinkId = async ( event:any ) => {

    const device = <MediaDeviceInfo>event.value;

    await ( this.audio as any ).setSinkId( device.deviceId );

    //await ( this.context as any ).setSinkId(  device.deviceId  );

  }

  ngOnInit(): void {

  }

}
