import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

//*********************** components **********************************
import Table from '../../components/Table/Table';
import TimeRangeController from "../../components/TimeRangeController/TimeRangeController";
import {calcs, numberfyMergedState, xAndYobjects, setStartEndDate} from "../../logic/logic";

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
    vixState: [],
    tenThreeMerged: [],
    //VERY IMPORTANT: YOU MUST USE YYYY-MM-DD as your input (just like the JSON API)
    dateRangeStart: "2000-01-01",
    dateRangeEnd: "",
    userStartDate: "",
    userEndDate: ""
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
        console.log(event.target.id, "event.target.id");
        //setStartEndDate(event.target.id);

            this.setState({
              dateRangeStart: setStartEndDate(event.target.id, 0),
              dateRangeEnd: setStartEndDate(event.target.id, 1),
            });

      }

      handleUserDateInput = (event) => {
        console.log(event.target.value, "event.targed.value")
        console.log(event.target.name, "event.target.name");
        
        if(event.target.name === "userStartDate") {
          this.setState ({
            userStartDate: event.target.value		
          });
        };

        if(event.target.name === "userEndDate") {
          this.setState ({
            userEndDate: event.target.value		
          });
        };
        /*
        this.setState ({
          userStartDate: event.target.value,
          userEndDate: event.target.value			
        });
        */
      }


  render() {
    console.log(this.state.userStartDate, "this.state.userStartDate");
    console.log(this.state.userEndDate, "this.state.userEndDate");
    //Regex code for date
  //^(((0?[1-9]|1[012])/(0?[1-9]|1\d|2[0-8])|(0?[13456789]|1[012])/(29|30)|(0?[13578]|1[02])/31)/((19|18)|[2-9]\d)\d{2}|0?2/29/(((19|18)|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([2468][048]|[3579][26])00)))$


    //************************** VISUALIZATION STUF ******************************
   // -----EVENTUALLY this data needs to be user selected so for example, "recDescription"
    //--is going to have to be part of state.
    const dataRecDescr = xAndYobjects(
      numberfyMergedState(
        this.state.tenThreeMerged), "date", "recDescription", this.state.dateRangeStart, this.state.dateRangeEnd);

    const dataNberValue = xAndYobjects(
                  numberfyMergedState(
                    this.state.tenThreeMerged), "date", "nberValue", this.state.dateRangeStart, this.state.dateRangeEnd);

        console.log(this.state.dateRangeStart, "this.state.dateRangeStart")
        console.log(this.state.dateRangeEnd, "this.state.dateRangeEnd")
      //************************ RETURN ************************************
    return (
    <div>
      <p>Hello </p>
      <TimeRangeController
        clickTimeRange={this.handleTimeRangeClick}
        userStartTimeState = {this.state.userStartDate}
				userEndTimeState = {this.state.userEndDate} 
				userDateHandler = {this.handleUserDateInput}					
			/>
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
