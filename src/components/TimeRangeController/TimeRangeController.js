import React from "react";
import TimeRange from "../TimeRange/TimeRange";
import TimeUserRange from "../TimeUserRange/TimeUserRange";

const timeRangeController = (props) => (
      <div>
        <div>
          <TimeRange
            timeRangeName="2Y"
            controlClickTimeRange={props.clickTimeRange}
            timeRangeID="2yrRange" />

          <TimeRange
            timeRangeName="5Y"
            controlClickTimeRange={props.clickTimeRange}
            timeRangeID="5yrRange" />

          <TimeRange
            timeRangeName="10Y"
            controlClickTimeRange={props.clickTimeRange}
            timeRangeID="10yrRange" />

          <TimeRange
            timeRangeName="20Y"
            controlClickTimeRange={props.clickTimeRange}
            timeRangeID="20yrRange" />

          <TimeRange
            timeRangeName="30Y"
            controlClickTimeRange={props.clickTimeRange}
            timeRangeID="30yrRange" />

          <TimeRange
            timeRangeName="50Y"
            controlClickTimeRange={props.clickTimeRange}
            timeRangeID="50yrRange" />

          <TimeRange
            timeRangeName="All"
            controlClickTimeRange={props.clickTimeRange}
            timeRangeID="allyrRange" />
        </div>
        <div>
          <div>
            <span style={{marginRight: "5px"}}> From: </span>
              <TimeUserRange
                    controlUserTimeState = {props.userStartTimeState}
                    nameDate = "userStartDate"
                    controlUserDateHandler = {props.userDateHandler}
                  />
          </div>
          <div>
            <span style={{marginRight: "5px"}}> To: </span>
              <TimeUserRange
                    controlUserTimeState = {props.userEndTimeState}
                    nameDate = "userEndDate"
                    controlUserDateHandler = {props.userDateHandler}
                  />
          </div>
        </div>
        <button onClick = {props.userDateSetter} >
          Apply Date Range
        </button>

      </div>

    );

export default timeRangeController;
