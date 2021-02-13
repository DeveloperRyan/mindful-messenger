import './App.css';
import MessagesView from './views/MessageView';

function App() {
    let chats = [
        {
            name: "Harris Rothaermel",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 1 
        },
        {   
            name: "Aditya Singhal",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 2 
        },
        {   
            name: "Ryan Elliott",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 3 
        },
        {
            name: "Harris Rothaermel",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 4 
        },
        {   
            name: "Aditya Singhal",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 5 
        },
        {   
            name: "Ryan Elliott",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 6 
        },
        {
            name: "Harris Rothaermel",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 7 
        },
        {   
            name: "Aditya Singhal",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 8 
        },
        {   
            name: "Ryan Elliott",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 9 
        },
                {
            name: "Harris Rothaermel",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 10
        },
        {   
            name: "Aditya Singhal",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 11
        },
        {   
            name: "Ryan Elliott",
            imageUrl: "https://i.imgur.com/3LdWieK.png",
            message: "This is an example message to show how the app looks with chats.",
            id: 12
        },
    ]

    let messages = [
        {
            content: "Hello there, this is an example message sent using Avocado Ai!",
            sender: true,
            id: 1
        },
        {
            content: "Using Avocado Ai you are able to get smart calender events from your messages.",
            sender: false,
            id: 2
        },
        {
            content: "We're also able to give smart suggestions and sentiment analysis!",
            sender: true,
            id: 3
        },
        {
            content: "Hello there, this is an example message sent using Avocado Ai!",
            sender: true,
            id: 4
        },
        {
            content: "Using Avocado Ai you are able to get smart calender events from your messages.",
            sender: false,
            id: 5
        },
        {
            content: "We're also able to give smart suggestions and sentiment analysis!",
            sender: true,
            id: 6
        },
    ]
  return (
    <div className="App">
        <MessagesView messages={messages} />
    </div>
  );
}

export default App;
