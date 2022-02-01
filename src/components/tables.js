import React from 'react'

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

export { InProgressTable, PlayedTable };