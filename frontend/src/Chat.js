import React, { Component } from 'react';
import YveBot from 'yve-bot/ui';
import 'yve-bot/ext/types/StringSearch';
import axios from 'axios';
import './Chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.bot = new YveBot(props.rules || [], {
      target: '.Chat',
    });

    this.state = {
      ssoid: '',
      modality: '',
    };

    this.bot.on('message', async (message) => {
      if (message.name === 'ssoid') {
        this.setState({ ssoid: message.value });
      } else if (message.name === 'modality') {
        this.setState({ modality: message.value });
      } else if (message.name === 'query') {
        await this.sendCustomQuery(message.value);
      }
    });
  }

  componentDidMount() {
    this.bot.start();
  }

  sendCustomQuery = async (query) => {
    const { ssoid, modality } = this.state;
    try {
      await axios.post('http://localhost:5000/send-email', {
        ssoid,
        modality,
        query
      });
      this.bot.say('Your query has been sent!');
    } catch (error) {
      this.bot.say('There was an error sending your query.');
      console.error('Error sending email:', error);
    }
  };

  render() {
    return (
      <div className="Chat" />
    );
  }
}

export default Chat;