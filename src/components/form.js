import React from 'react'
import { useState } from 'react';

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

export { Form };