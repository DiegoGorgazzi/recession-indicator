import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

//*********************** components **********************************
import Table from '../../components/Table/Table';
import TimeRangeController from "../../components/TimeRangeController/TimeRangeController";
import {calcs, reactVisMergedState, xAndYobjects} from "../../logic/logic";

//************************ d3js *************************************
import * as d3 from "d3-time-format";

//************************* react-vis *******************************
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines,
  XAxis, YAxis, VerticalBarSeries, AreaSeries } from 'react-vis';
import 'react-vis/dist/style.css';

//******************** BootstrapTable **********************************
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

//*********************** helperFunctions ******************************
import {filteredResponse} from "../../shared/helperFunctions/helperFunctions";

//************************ data ****************************************
import {tenYearYield} from "../../data/fedReserveAPI";
import {threeMonthYield} from "../../data/fedReserveAPI";
import {nberUSrecess} from "../../data/fedReserveAPI";
import {wilshire5000} from "../../data/fedReserveAPI";
import {vix} from "../../data/fedReserveAPI";

class RecessionIndicator extends Component {

  state = {
    tenYearInt: [],
    threeMonthInt: [],
    nberRecession: [],
    wilshireState: [],
    vixState:[],
    tenThreeMerged:[]
  }

  componentDidMount () {
    axios.all([
      axios.get(tenYearYield),
      axios.get(threeMonthYield),
      axios.get(nberUSrecess),
      axios.get(wilshire5000),
      axios.get(vix)
      ])
        .then(axios.spread(
          (tenYrYldResponse,
            threeMthYldResponse,
            nberResponse, wilshireResponse, vixResponse ) => {

            this.setState({
            tenYearInt:
              filteredResponse(tenYrYldResponse.data.observations, "10-yr-yields"),
            threeMonthInt:
              filteredResponse(threeMthYldResponse.data.observations, "3-month-yields"),
            nberRecession:
              filteredResponse(nberResponse.data.observations, "US-recession"),
            wilshireState:
              filteredResponse(wilshireResponse.data.observations, "Whilshire-5000"),
            vixState:
              filteredResponse(vixResponse.data.observations, "Vix")
            });

          console.log(this.state.tenYearInt, "ten");
          //console.log(this.state.threeMonthInt, "three");
          //console.log(this.state.nberRecession, "nber");
          //console.log(this.state.wilshireState, "wilshire");
          //console.log(this.state.vixState, "vix");
          }
        ));

      }

      componentDidUpdate(previousProps, previousState, snapshot) {
        if(previousState.tenThreeMerged.length === 0 || previousState.tenThreeMerged.length === 1 ) {
          this.setState({
            tenThreeMerged: calcs(this.state.tenYearInt, this.state.threeMonthInt, this.state.nberRecession, "mergedTenThree" )
          });
        }

      }

      handleTimeRangeClick = (event) => {
        console.log(event.target.id)
      }


  render() {

    //************************** VISUALIZATION STUF ******************************
   //VERY IMPORTANT: YOU MUST USE YYYY-MM-DD as your input (just like the JSON API)
   //otherwise, when you run new Date() on it, you might get the wrong answer when doing
   // the getDate() method to compare dates.
   const startDate = "1990-06-01";
   const endDate =  "2020-06-01";

    const dataRecDescr = xAndYobjects(
      reactVisMergedState(
        this.state.tenThreeMerged), "date", "recDescription", startDate, endDate);

    const dataNberValue = xAndYobjects(
                  reactVisMergedState(
                    this.state.tenThreeMerged), "date", "nberValue", startDate, endDate);


      //************************ RETURN ************************************
    return (
    <div>
      <p>Hello </p>
      <TimeRangeController
        clickTimeRange={this.handleTimeRangeClick}/>
      <div>
        <XYPlot height={350} width={600}
          margin={{bottom:60}}
          xType="time"
          colorType="linear"
          >
          <VerticalGridLines />
          <HorizontalGridLines />
          {/*<XAxis tickFormat={d3.timeFormat("%Y-%b")} tickLabelAngle={-45} />*/}
          <XAxis tickLabelAngle={-45} tickPadding={5}/>
          <YAxis />
            <AreaSeries
              data = {dataRecDescr}
                  color="#ff9999" stroke="#f70"
            />
            <LineSeries
                  data = {dataNberValue}
                  color={0.75}
            />
       </XYPlot>


     </div>
     <div>
        <Table data={this.state.tenThreeMerged}/>
    </div>
    </div>
    )

  }

}

export default RecessionIndicator;
