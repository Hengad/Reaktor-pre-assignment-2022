import React from 'react'

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

export { ReturnPlayerData };