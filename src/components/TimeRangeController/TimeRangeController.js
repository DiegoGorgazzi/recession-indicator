import React from "react";
import TimeRange from "../TimeRange/TimeRange";

const timeRangeController = (props) => (
      <div>
        <TimeRange
          timeRangeName="10Y"
          controlClickTimeRange={props.clickTimeRange}
          timeRangeID="10yrRange" />
      </div>

    );

export default timeRangeController;
