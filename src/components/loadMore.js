import React from 'react'

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

export { LoadMore };