import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'

// Import Board and Scoreboard views
import { Board } from './components/board'
import { Scoreboard } from './components/scoreboard'

import './styles/board.css'
import './styles/box.css'
import './styles/buttons.css'
import './styles/scoreboard.css'

// Create App component
class App extends React.Component {
  render() {
    return (
      <div className="app">
        <BrowserRouter>
          <Route exact path="/tic" component={Scoreboard}/>
          <Route path="/tic/board" component={Board}/>
        </BrowserRouter>
      </div>
    )
  }
}

// Render the App component into DOM
ReactDOM.render(<App />, document.getElementById('root'))