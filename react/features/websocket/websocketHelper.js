import React, { Component } from 'react';
// eslint-disable-next-line require-jsdoc
const WebSocket = require('ws');

const URL = 'wss://vps.ranonline.co.id:8443';

// eslint-disable-next-line no-unused-vars,require-jsdoc
class WebsocketHelper extends Component {
    ws = new WebSocket(URL);

    state = {
        name: 'Guest',
        messages: []
    }

    // eslint-disable-next-line require-jsdoc
    componentDidMount() {
        this.ws.onopen = () => {
            console.log('connected');
        };

        this.ws.onmessage = evt => {
            const message = JSON.parse(evt.data);

            this.addMessage(message);
        };

        this.ws.onclose = () => {
            console.log('disconnected');
            this.setState({
                ws: new WebSocket(URL)
            });
        };
    }

    addMessage = message => this.setState(state => ({
        messages: [ message, ...state.messages ]
    }))

    submitMessage = messageString => {
        const message = {
            name: this.state.name,
            message: messageString
        }

        this.ws.send(JSON.stringify(message));
        this.addMessage(message);
    }

    // eslint-disable-next-line require-jsdoc
    render() {
        return super.render();
    }
}
export default WebsocketHelper;
