/*

  The application needed to be fast and snappy so I implemented the game history data structure by having an array of objects
  that store a name of player and all the games the player has played. So there will be as many objects as there are different names.
  This will take about 2x memory since two different objects will usually have the same game stored in them with the advantage of having a lot faster search.

  The array looks like this:
  gameHistoryByNames = [
    {name: "Ukko Virtanen", games: [game1, game2, game3, ...]},
    {name: "Marjatta Mäkelä", games: [game1, game2, game3, ...]},
    {name: "Aino Jokinen", games: [game1, game2, game3, ...]},
    ...
  ]

  EDIT: I implemented "load more" functionality for the table and now the rendering isn't slowing down the page anymore.

*/

import React from 'react'
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

const global = {
  socket: new WebSocket("wss://bad-api-assignment.reaktor.com/rps/live"),
  gameHistoryByNames: [],
  gamesPlayedItemsLoaded: 0,
  gamesPlayedItemsToLoad: 100,
  playersData: []
};

const InProgressTable = ({elem}) => {
  return (
    <tr>
      <td>{elem.playerA.name}</td>
      <td>{elem.playerB.name}</td>
    </tr>
    )}

const PlayedTable = ({elem, index}) => {
  return (
    <tr>
      <td>{new Date(elem.t).toLocaleString()}</td>
      <td>{elem.playerA.name} [{elem.playerA.played}]</td>
      <td>{elem.playerB.name} [{elem.playerB.played}]</td>
    </tr>
    )}

const Form = (props) => {
  const [text, setText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    props.function(text);
    setText("");
  }

  const handleChange = (event) => {
    setText(event.target.value);
  }

  return(
    <form onSubmit={handleSubmit}>
      <input value={text} placeholder="Maija Mehiläinen" onChange={handleChange}/>
      <button type="submit">Search</button>
    </form>
  )}

const LoadMore = (props) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    props.function();
  }

  const handleChange = (event) => {
    global.gamesPlayedItemsToLoad = parseInt(event.target.value);
  }

  return(
    <form onSubmit={handleSubmit}>
      <button type="submit">Load More...</button>
      <br/>
      <p>Load </p>
      <select name="options" id="loadMoreOptions" defaultValue={100} onChange={handleChange}>
        <option value={100}>100</option>
        <option value={500}>500</option>
        <option value={1000}>1000</option>
        <option value={5000}>5000</option>
      </select>
      <p> games </p>
    </form>
  )}

const ReturnPlayerData = ({database, searchText}) => {
  const playerData = database.find(elem => elem.name === searchText);
  if (playerData === undefined || playerData.length === 0) {
    return (<div className="playerInformationData"><p><b>Player not found</b></p></div>);
  }

  let rocks = 0;
  let papers = 0;
  let scissors = 0;
  let wins = 0;
  let totalMatches = playerData.games.length;
  let player = undefined;
  let enemy = undefined;
  let mostPlayedHand = undefined;

  playerData.games.forEach((game) => {
    if (game.playerA.name === searchText) {
      player = game.playerA;
      enemy = game.playerB;
    }
    else {
      player = game.playerB;
      enemy = game.playerA;
    }

    // Draw will be counted as loss
    if (player.played === "ROCK") {
      rocks += 1;
      if(enemy.played === "SCISSORS") { wins += 1; }
    }

    else if (player.played === "PAPER") {
      papers += 1;
      if(enemy.played === "ROCK") { wins += 1; }
    }

    else if (player.played === "SCISSORS") {
      scissors += 1;
      if (enemy.played === "PAPER") { wins += 1; }
    }

    let arr = [rocks, papers, scissors];
    let index = arr.indexOf(Math.max.apply(null, arr));

    if (index === 0) { mostPlayedHand = "ROCK"; }
    if (index === 1) { mostPlayedHand = "PAPER"; }
    if (index === 2) { mostPlayedHand = "SCISSORS"; }
  })
  return (
    <div className="playerInformationData">
      <p><b>Name: </b><br/>{player.name}</p>
      <p><b>Total Games: </b><br/>{totalMatches}</p>
      <p><b>Wins: </b><br/>{wins}</p>
      <p><b>Win Ratio: </b><br/>{Math.round(100 * wins / totalMatches)} %</p>
      <p><b>Most Played Hand: </b><br/>{mostPlayedHand}</p>
    </div>
  )
}

const App = () => {
  const [liveGames, setLiveGames] = useState([]);
  const [playerInformation, setPlayerInformation] = useState([]);
  const [playerGames, setPlayerGames] = useState([]);
  const [searchedPlayerName, setSearchedPlayerName] = useState("By Searched Player");

  // Fetch historical games
  useEffect(() => {
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    const fetchCursor = (cursor) => {
      fetch(cursor)
        .then(response => {
          if (response.status !== 200) {
            fetchCursor(cursor);
            throw new Error(`Error in fetchCursor with status code ${response.status}`);
          }
          return response.json();
        })
        .then(async (out) => {
            out.data.forEach((elem) => {
              let objectPlayerA = global.gameHistoryByNames.find(item => item.name === elem.playerA.name);
              let objectPlayerB = global.gameHistoryByNames.find(item => item.name === elem.playerB.name)

              // Add the object to gameHistoryByNames array if it does not exist for player A. If it exists, add the fetched game to the object's games array.
              if (objectPlayerA === undefined) {
                global.gameHistoryByNames = [...global.gameHistoryByNames, {name: elem.playerA.name, games: [elem]}];
              }
              else {
                let index = global.gameHistoryByNames.indexOf(objectPlayerA);
                global.gameHistoryByNames[index].games.push(elem);
              }

              // Same for player B.
              if (objectPlayerB === undefined) {
                global.gameHistoryByNames = [...global.gameHistoryByNames, {name: elem.playerB.name, games: [elem]}];
              }
              else {
                // Check that the players A and B are not named the same. If they are, no need to add the game again to gameHistoryByNames array
                if(objectPlayerA !== objectPlayerB) {
                  let index = global.gameHistoryByNames.indexOf(objectPlayerB);
                  global.gameHistoryByNames[index].games.push(elem);
                }
              }
            })
            cursor = out.cursor;
            if (cursor !== null) {
              fetchCursor(cursor);
              await sleep(100); // I got too many requests errors sometimes and this seemed to fix it. I bet there is a better solution but this will do for now.
            }
        }).catch(err => console.error(err))
    }
  
    fetchCursor("/rps/history");
  }, [])

  // Fetch live games
  global.socket.onmessage = function (event) {
    const dataObj = JSON.parse(JSON.parse(event.data)); // received game
    let liveGamesCopy = JSON.parse(JSON.stringify(liveGames));

    // Add the received game to liveGames array
    if(dataObj.type === "GAME_BEGIN") {
      liveGamesCopy = [...liveGamesCopy, dataObj];
    }

    else if(dataObj.type === "GAME_RESULT") {
      let index = liveGames.findIndex(item => item.gameId === dataObj.gameId);

      // Add the received game to gameHistoryByNames 
      global.gameHistoryByNames.forEach((elem) => {
        if (elem.name === dataObj.playerA.name || elem.name === dataObj.playerB.name) {
          elem.games.push(dataObj);
        }
      })

      // If the game is found in liveGames, delete it
      if(index !== -1) {
        liveGamesCopy = liveGamesCopy.filter(item => item.gameId !== dataObj.gameId);
      }
    }

    setLiveGames(liveGamesCopy);
  }

  const searchName = (text) => {
    global.gamesPlayedItemsLoaded = global.gamesPlayedItemsToLoad;
    global.playersData = global.gameHistoryByNames.find(elem => elem.name === text);

    if (global.playersData !== undefined) {
      global.playersData = global.playersData.games.map((elem) => (<PlayedTable elem={elem} key={elem.gameId}/>));
    }
    else {
      global.playersData = [];
    }

    setPlayerInformation(<ReturnPlayerData database={global.gameHistoryByNames} searchText={text}/>);
    setSearchedPlayerName("By ".concat(text));
    setPlayerGames(global.playersData.slice(0, global.gamesPlayedItemsLoaded));
  }

  const loadMorePages = () => {
    global.gamesPlayedItemsLoaded += global.gamesPlayedItemsToLoad;
    setPlayerGames(global.playersData.slice(0, global.gamesPlayedItemsLoaded));
  }

  return (
    <div>
      <Helmet>
        <title>Reaktor pre-assignment by Henry Jaakkola</title>
      </Helmet>
      <div className="gamesInProgress">
        <h1>Games In Progress</h1>
        <table>
          <thead>
          <tr>
            <th>Player A</th>
            <th>Player B</th>
          </tr>
          </thead>
          <tbody>
            {liveGames.map((elem) => (
                <InProgressTable elem={elem} key={elem.gameId}/>
              ))}
          </tbody>
        </table>
      </div>
      <div className="playerInformation">
        <h1>Player Information</h1>
        <Form function={searchName}/><br/>
        <div>
          {playerInformation}
        </div>
      </div>
      <div className="gamesPlayed">
        <h1>Games Played {searchedPlayerName}</h1>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Player A</th>
              <th>Player B</th>
            </tr>
          </thead>
          <tbody>
            {playerGames}
          </tbody>
        </table>
        <LoadMore function={loadMorePages}/>
      </div>
    </div>
  )
}

export default App;
