import React, { Component } from 'react';
import { Route } from 'react-router';

export default class App extends Component {
  displayName = App.name

  render() {
    return (
      <h1>Hello World</h1>
    );
  }
}
