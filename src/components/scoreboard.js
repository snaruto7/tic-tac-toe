import React from 'react'
import { Link } from 'react-router-dom'

// Import Storage object
import { Storage } from './../storage/storage'

// Create Scoreboard component
export class Scoreboard extends React.Component {
  state = {
    scoreboard: []
  }

    // After component mounts, load any data from local storage and update component state
  async componentDidMount() {
    let storage = await new Storage().getData()

    this.setState({
      scoreboard: storage
    })
  }

  render() {
    return (
      <>
        <div className="game" >
          <h1>Tic Tac Toe:</h1>

                  {/* List with previous games */}

                  {/* Link to start new game */}
          <Link to="/tic/board">
            <button className="btn">Start new game</button>
          </Link>
        </div>
      </>
    )
  }
}