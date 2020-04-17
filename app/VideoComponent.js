import React, { Component } from 'react';
import Video from 'twilio-video';
import axios from 'axios';
import { render } from 'react-dom';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Card, CardHeader, CardText} from 'material-ui/Card';

export default class VideoComponent extends Component{
    constructor(props){
        super(props);
        this.state = {
            identity: null,
            roomName: '',
            roomNameErr: false,
            previewTracks: null,
            localMediaAvailable:false,
            hasJoinedRoom:false,
            activeRoom: null
        };
        this.joinRoom = this.joinRoom.bind(this);
        this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
    }

    componentDidMount(){
        axios.get('/token').then(results =>{
            const {identity,token} = result.data;
            this.setState({identity,token});

        });
    }

    handleRoomNameChange(e){
        let roomName = e.target.value;
        this.setState({roomName})
    }
    
    joinRoom(){
        if(!this.state.roomName.trim()){
            this.setState({roomNameErr: true});
            return;
        }

        console.log("Joining room "+ this.state.roomName + "");
        let connectOptions = {
            name: this.state.roomName
        };

        if(this.state.previewTracks){
            connectOptions.tracks = this.state.previewTracks;
        };
        
        console.log(this.state.token);
        
        Video.connect(this.state.token, connectOptions).then(this.roomJoined, error => {
            alert('Could not connect to Celery: ' + error.message);
        });
    }

    render(){
        //<div>Video Component</div>
    let showLocalTrack = this.state.localMediaAvailable ? (
    <div className="flex-item"><div ref="localMedia" /> </div>) : '';
        let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
            <RaisedButton label = "Leave Room" secondary={true} onClick={() => alert("Thanks for Using Celery")} /> ) : (
            <RaisedButton label='Join Room' primary={true} onClick={this.joinRoom}/>
            );     

        return(
            <Card>
                <CardText>
                    <div className='flex-container'>
                        {showLocalTrack}
                        <div className='flex-item'>
                            {}
                        </div>
                        <TextField hintText="Room Name" onChange={this.handleRoomNameChange} errorText = {this.state.roomNameErr? 'A Celery Room Name is required' : undefined}/><br/>
                        {joinOrLeaveRoomButton}
                    </div>
                </CardText>
            </Card>

        );
    }
}
