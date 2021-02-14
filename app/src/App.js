import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import io from 'socket.io-client';
import axios from 'axios';
import { Spring } from 'react-spring/renderprops';
import { save } from 'save-file'
import './App.css';
import MessagesView from './views/MessageView';
import ChatsView from './views/ChatsView';
import ComposeChatView from './views/ComposeChatView';
import NewEventNotification from './components/NewEventNotification';

class App extends Component {
    state = {
        username: 'testUser',
        socket: io('http://localhost:8000'),
        chats: [],
        messages: [],
        popup: false,
        eventName: "",
        eventDate: "",
        eventTime: "",
    }

    constructor(props) {
        super(props);

        this.state.socket.on('private_message', (data) => {

            // We add message first so we can get an accurate chat preview
            this.addMessage(data);

            console.log(data);
            this.updateChat(data, data.sender);

            // Send to GPT3
            this.sendToGPT3(data);

        });

        // todo: remove after debug
        window.app = this;
    }

    componentDidMount() {
        let usernamePrompt = prompt("Please enter your username");
        this.setState(prevState => ({
            ...this.state,
            username: usernamePrompt
        }), () => this.identify());
    }

    identify() {
        this.state.socket.emit('identify', { username: this.state.username });
    }

    addChat(chat) {
        let joined = this.state.chats.concat(chat);
        this.setState({ chats: joined });
    }

    updateChat(data, targetUser) {
        // Find most recent message to use as preview for chat box
        let previewMessage;

        for (let i = this.state.messages.length - 1; i >= 0; i--) {
            if (this.state.messages[i].sender == data.sender) {
                previewMessage = this.state.messages[i].message;
                break;
            }
        }

        // Create chat object to compare to exist to see if we need to add or just update
        let chat = {
            name: targetUser,
            imageUrl: 'https://ui-avatars.com/api/?name=' + targetUser,
            preview: previewMessage,
            id: targetUser
        }

        // Custom index of function that only compares names
        function indexOfChat(o, arr) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].name == o.name) {
                    return i;
                }
            }
            return -1;
        }

        let chatIndex = indexOfChat(chat, this.state.chats)
        if (chatIndex == -1) {
            this.addChat(chat);
        } else {
            this.updateChatContents(chatIndex, chat)
        }
    }

    updateChatContents(index, chat) {
        let chatsCopy = [...this.state.chats]
        chatsCopy[index] = chat;
        this.setState({ chats: chatsCopy })
    }

    addMessage(message) {
        if (!message.sender) message.sender = this.state.username;
        let joined = this.state.messages.concat(message);
        this.setState({ messages: joined });
    }

    sendMessage(message) {
        this.state.socket.emit('private_message', message);
        this.addMessage(message);
        this.updateChat(message, message.target);
    }

    sendToGPT3(data) {
        axios.post('http://localhost:4242/reminder/', {
            sender: data.sender,
            epoch: data.epoch,
            text: data.message
        }).then((response) => {
            if (response.data.eventType == "Event") {
                this.getTimeFromGPT3(data.message).then((res) => {
                    this.setState({
                        popup: true,
                        eventName: response.data.title,
                        eventDate: response.data.date,
                        eventTime: res.data.time
                    });
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    async getTimeFromGPT3(data) {
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:4242/getTime/', {
                text: data
            }).then((response) => {
                resolve(response);
            }).catch((err) => {
                reject(err);
            })
        })
    }



    handleOnAcceptEvent() {
        this.createCalendarEvent(this.state.eventName, this.state.eventDate, this.state.eventTime);
        this.closePopup();
    }

    handleOnDenyEvent() {
        this.closePopup();
    }

    closePopup() {
        this.setState({
            popup: false,
            eventName: "",
            eventDate: ""
        })
    }

    handleConnect(target) {
        let chat = {
            name: target,
            imageUrl: 'https://ui-avatars.com/api/?name=' + target,
            preview: "",
            id: target
        }

        this.addChat(chat);
    }

    createCalendarEvent(eventTitle, date, time) {

        const ics = require('ics');

        let charArray = date.split('');
        charArray = charArray.filter((c) => (!(/[^a-zA-Z0-9]/.test(c))));

        console.log(charArray);

        let [hour, minutes] = time.split(':');

        // todo to make proper event that matches up, will probably need another GPT3 function to extract a reasonable hour time from the text
        const event = {
            start: [2021, 2, 15, hour, minutes],
            duration: { hours: 1, minutes: 0 },
            title: eventTitle,
            status: 'CONFIRMED',
            busyStatus: 'BUSY'
        }

        ics.createEvent(event, (error, value) => {
            if (error) {
                console.log(error);
                return;
            }
            save(value.toString(), 'event.ics');
        });
    }

    render() {

        return (
            <Router>
                <div className="App">
                    <Switch>
                        <Route path="/compose"
                            render={(props) => (<ComposeChatView {...props} onConnect={this.handleConnect.bind(this)} />)} />
                        <Route
                            path="/messages/:target"
                            render={(props) => (<MessagesView {...props} messages={this.state.messages} viewer={this.state.username} onSend={this.sendMessage.bind(this)} />)} />
                        <Route path="/" render={(props) => (<ChatsView {...props} chats={this.state.chats} />)} />
                    </Switch>
                    {(this.state.popup) ? <Spring
                        from={{
                            top: "100vh",
                            width: "100%",
                            position: "fixed"
                        }}
                        to={{
                            top: "65vh",
                            position: "fixed"
                        }}
                    >
                        {props => <div style={props}>
                            <NewEventNotification eventName={this.state.eventName}
                                eventDate={this.state.eventDate}
                                eventTime={this.state.eventTime}
                                onAccept={this.handleOnAcceptEvent.bind(this)}
                                onDeny={this.handleOnDenyEvent.bind(this)} />
                        </div>}
                    </Spring> : null}
                </div>
            </Router >
        );
    }
}

export default App;