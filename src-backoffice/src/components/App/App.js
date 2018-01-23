import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';
import axios from 'axios';
import io from 'socket.io-client';

import TableUser from '../TableUser/TableUser';
import ModalUser from '../ModalUser/ModalUser';

import logo from '../../logo.svg';
import shirts from '../../shirts.png';
import './App.css';

class App extends Component {

  constructor() {
    super();

    this.server = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    this.socket = io.connect(this.server);

    this.state = {
      technologies: [],
      online: 0
    }

    this.fetchTechnologies = this.fetchTechnologies.bind(this);
    this.handleUserAdded = this.handleUserAdded.bind(this);
    this.handleUserUpdated = this.handleUserUpdated.bind(this);
    this.handleUserDeleted = this.handleUserDeleted.bind(this);
  }

  // Place socket.io code inside here
  componentDidMount() {
    this.fetchTechnologies();
    this.socket.on('visitor enters', data => this.setState({ online: data }));
    this.socket.on('visitor exits', data => this.setState({ online: data }));
    this.socket.on('add', data => this.handleUserAdded(data));
    this.socket.on('update', data => this.handleUserUpdated(data));
    this.socket.on('delete', data => this.handleUserDeleted(data));
  }

  // Fetch data from the back-end
  fetchTechnologies() {
    axios.get(`${this.server}/api/technologies/`)
    .then((response) => {
      this.setState({ technologies: response.data });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  handleUserAdded(user) {
    let technologies = this.state.technologies.slice();
    technologies.push(user);
    this.setState({ technologies: technologies });
  }

  handleUserUpdated(technology) {
    let technologies = this.state.technologies.slice();
    for (let i = 0, n = technologies.length; i < n; i++) {
      if (technologies[i]._id === technology._id) {
        technologies[i].name = technology.name;
        technologies[i].ring = technology.ring;
        technologies[i].quadrant = technology.quadrant;
        technologies[i].isNew = technology.isNew;
        technologies[i].description = technology.description;
        break; // Stop this loop, we found it!
      }
    }
    this.setState({ technologies });
  }

  handleUserDeleted(user) {
    let users = this.state.users.slice();
    users = users.filter(u => { return u._id !== user._id; });
    this.setState({ users: users });
  }

  render() {

    let online = this.state.online;
    let verb = (online <= 1) ? 'is' : 'are'; // linking verb, if you'd prefer
    let noun = (online <= 1) ? 'person' : 'people';

    return (
      <div>
        <div className='App'>
          <div className='App-header'>
            <img src={logo} className='App-logo' alt='logo' />
            <h1 className='App-intro'>MERN CRUD</h1>
            <p>A simple records system using MongoDB, Express.js, React.js, and Node.js with real-time Create, Read, Update, and Delete operations using Socket.io.</p>
            <p>REST API was implemented on the back-end. Semantic UI React was used for the UI.</p>
            <p>
              <a className='social-link' href='https://github.com/cefjoeii' target='_blank' rel='noopener noreferrer'>GitHub</a> &bull; <a className='social-link' href='https://linkedin.com/in/cefjoeii' target='_blank' rel='noopener noreferrer'>LinkedIn</a> &bull; <a className='social-link' href='https://twitter.com/cefjoeii' target='_blank' rel='noopener noreferrer'>Twitter</a>
            </p>
            <a className='shirts' href='https://www.teepublic.com/user/codeweario' target='_blank' rel='noopener noreferrer'>
              <img src={shirts} alt='Programmer Shirts' />
              <span>Ad</span>
            </a>
          </div>
        </div>
        <Container>
          <ModalUser
            headerTitle='Add User'
            buttonTriggerTitle='Add New'
            buttonSubmitTitle='Add'
            buttonColor='green'
            onUserAdded={this.handleUserAdded}
            server={this.server}
            socket={this.socket}
          />
          <em id='online'>{`${online} ${noun} ${verb} online.`}</em>
          <TableUser
            onUserUpdated={this.handleUserUpdated}
            onUserDeleted={this.handleUserDeleted}
            technologies={this.state.technologies}
            server={this.server}
            socket={this.socket}
          />
        </Container>
        <br/>
      </div>
    );
  }
}

export default App;
