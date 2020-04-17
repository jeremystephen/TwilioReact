import React, { Component } from 'react';
import Video from 'twilio-video';
import axios from 'axios';
import { render } from 'react-dom';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardHeader, CardText } from 'material-ui/Card';

export default class VideoComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            identity: null,
            roomName: '',
            roomNameErr: false,
            previewTracks: null,
            localMediaAvailable: false,
            hasJoinedRoom: false,
            activeRoom: null
        };
        this.joinRoom = this.joinRoom.bind(this);
        this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
        this.leaveRoom = this.leaveRoom.bind(this);
        this.detachTracks = this.detachTracks.bind(this);
        this.detachParticipantTracks = this.detachParticipantTracks.bind(this);
        this.roomJoined = this.roomJoined.bind(this);

        // this.attachTrack = this.attachTrack.bind(this);
    }

    /*componentDidUpdate(){
        axios.get('/token').then(results => {
            const {identity,token} = results.data;
            this.setState({identity,token});

        });
    }*/

    componentDidMount() {
        axios.get('/token').then(results => {
            const { identity, token } = results.data;
            this.setState({ identity, token });

        });
    }

    handleRoomNameChange(e) {
        let roomName = e.target.value;
        this.setState({ roomName })
    }

    // joinRoom(){
    //     if(!this.state.roomName.trim()){
    //         this.setState({roomNameErr: true});
    //         return;
    //     }

    //     console.log("Joining room "+ this.state.roomName + "");
    //     let connectOptions = {
    //         name: this.state.roomName
    //     };

    //     if(this.state.previewTracks){
    //         connectOptions.tracks = this.state.previewTracks;
    //     };

    //     console.log(this.state.token);

    //     Video.connect(this.state.token, connectOptions).then(this.roomJoined, error => {
    //         alert('Could not connect to Celery: ' + error.message);
    //     });
    // }
    joinRoom() {

        if (!this.state.roomName.trim()) {
            this.setState({ roomNameErr: true });
            return;
        }

        console.log("Joining room '" + this.state.roomName + "'...");
        let connectOptions = {
            name: this.state.roomName
        };

        if (this.state.previewTracks) {
            connectOptions.tracks = this.state.previewTracks;
        }

        Video.connect(this.state.token, connectOptions).then(this.roomJoined, error => {
            alert('Could not connect to Celery: ' + error.message);
        });
    }

    leaveRoom() {
        this.state.activeRoom.disconnect();
        this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
    }

    // attachTracks(tracks, container) {
    //     tracks.forEach(track => {
    //         container.appendChild(track.attach());
    //     });
    // }

    attachTracks(tracks, container) {
        tracks.forEach(function (track) {
            this.attachTrack(track, container);
        });
    }

    attachTrack(track, container) {
        container.appendChild(track.attach());
    }

    detachTracks(tracks) {
        tracks.forEach(track => {
            track.detach().forEach(detachedElement => {
                detachedElement.remove();
            });
        });
    }

    detachParticipantTracks(participant) {
        var tracks = Array.from(participant.tracks.values());
        this.detachTracks(tracks);
    }

    // Attach the Participant's Tracks to the DOM.
    attachParticipantTracks(participant, container) {
        var tracks = Array.from(participant.tracks.values());
        this.attachTracks(tracks, container);
    }

    roomJoined(room) {
        // Called when a participant joins a room
        console.log("Joined as '" + this.state.identity + "'");
        this.setState({
            activeRoom: room,
            localMediaAvailable: true,
            hasJoinedRoom: true  // Removes ‘Join Room’ button and shows ‘Leave Room’
        });

        // Attach LocalParticipant's tracks to the DOM, if not already attached.
        var previewContainer = this.refs.localMedia;
        if (!previewContainer.querySelector('video')) {
            this.attachParticipantTracks(room.localParticipant, previewContainer);
        }
        // Attach the Tracks of the room's participants.
        room.participants.forEach(participant => {
            console.log("Already in Room: '" + participant.identity + "'");
            var previewContainer = this.refs.remoteMedia;
            this.attachParticipantTracks(participant, previewContainer);
        });

        // Participant joining room
        room.on('participantConnected', participant => {
            console.log("Joining: '" + participant.identity + "'");
        });

        // Attach participant’s tracks to DOM when they add a track
        room.on('trackAdded', (track, participant) => {
            console.log(participant.identity + ' added track: ' + track.kind);
            var previewContainer = this.refs.remoteMedia;
            this.attachTracks([track], previewContainer);
        });

        // Detach participant’s track from DOM when they remove a track.
        room.on('trackRemoved', (track, participant) => {
            this.log(participant.identity + ' removed track: ' + track.kind);
            this.detachTracks([track]);
        });

        // Detach all participant’s track when they leave a room.
        room.on('participantDisconnected', participant => {
            console.log("Participant '" + participant.identity + "' left the room");
            this.detachParticipantTracks(participant);
        });

        // Once the local participant leaves the room, detach the Tracks
        // of all other participants, including that of the LocalParticipant.
        room.on('disconnected', () => {
            if (this.state.previewTracks) {
                this.state.previewTracks.forEach(track => {
                    track.stop();
                });
            }
            this.detachParticipantTracks(room.localParticipant);
            room.participants.forEach(this.detachParticipantTracks);
            this.state.activeRoom = null;
            this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
        });
    }




    render() {
        let showLocalTrack = this.state.localMediaAvailable ? (
            <div className="flex-item"><div ref="localMedia" /> </div>) : '';
        let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
            <RaisedButton label="Leave Room" secondary={true} onClick={this.leaveRoom} />) : (
                <RaisedButton label="Join Room" primary={true} onClick={this.joinRoom} />
            );
        return (
            <Card>
                <CardText>
                    <div className="flex-container">
                        {showLocalTrack}
                        <div className="flex-item">
                            <TextField hintText="Room Name" onChange={this.handleRoomNameChange}
                                errorText={this.state.roomNameErr ? 'Room Name is required' : undefined}
                            /><br />
                            {joinOrLeaveRoomButton}
                        </div>
                        <div className="flex-item" ref="remoteMedia" id="remote-media" />
                    </div>
                </CardText>
            </Card>
        );
    }
}
