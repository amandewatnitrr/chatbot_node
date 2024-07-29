import React, { Component } from 'react';
import Chat from './Chat';

const rules = [
  { type: 'String', message: 'Please Enter your SSO ID:', name: 'ssoid' },
  { type: 'String', message: 'Please Enter your Modality:', name: 'modality' },
  "Please feel free to ask us any of the queries",
  {
    type: 'SingleChoice',
    message: 'Here are some common queries you can ask:',
    options: [
      { label: 'What is AWS ?', replyMessage: 'AWS stands for Amazon Web Services.' },
      { label: 'What is GCP ?', replyMessage: 'GCP stands for Google Cloud Platform.' },
      { label: 'What is Azure', replyMessage: 'Azure is Microsoft\'s Cloud Service.' },
      { label: 'What is Docker ?', replyMessage: 'Docker is a set of platform as a service products that use OS-level virtualization to deliver software in packages called containers. The service has both free and premium tiers. The software that hosts the containers is called Docker Engine. It was first released in 2013 and is developed by Docker, Inc.' },
      { label: 'What is Heroku ?', replyMessage: 'Heroku is a cloud platform as a service supporting several programming languages. As one of the first cloud platforms, Heroku has been in development since June 2007, when it supported only the Ruby programming language, but now also supports Java, Node.js, Scala, Clojure, Python, PHP, and Go.' },
      { label: 'What is Vercel ?', replyMessage: 'Vercel Inc., formerly ZEIT, is an American cloud platform as a service company. The company maintains the Next.js web development framework. Vercel\'s architecture is built around composable architecture, and deployments are handled through Git repositories, the Vercel CLI, or the Vercel REST API.' },
      { label: 'Custom Query', type: 'String', name: 'query', message: 'Enter your Query:' },
    ]
  }
];

class App extends Component {
  render() {
    return (
      <div className="App">
        <Chat rules={rules} />
      </div>
    );
  }
}

export default App;