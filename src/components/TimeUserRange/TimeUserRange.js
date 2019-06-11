import React from 'react';

const timeUserRange = (props) => (
  <div>
  <span> From </span><input type="text" name="userStartDate" placeholder="MM/DD/YYYY"/>
    <span> To </span><input type="text" name="userEndDate" placeholder="MM/DD/YYYY"/>

    <button id={props.timeRangeID} onClick={props.controlClickTimeRange}>
        {props.timeRangeName}
    </button>
  </div>
);

export default timeUserRange;