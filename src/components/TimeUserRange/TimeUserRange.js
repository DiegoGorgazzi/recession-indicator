import React from 'react';


const timeUserRange = (props) => (
  <input 
    type="text" 
    name={props.nameDate}
    placeholder="MM/DD/YYYY"
    value={props.controlUserTimeState}
    onChange={props.controlUserDateHandler} 
    />
);

export default timeUserRange;