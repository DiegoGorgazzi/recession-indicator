import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

//*********************** components **********************************
import Table from '../../components/Table/Table';
import TimeRangeController from "../../components/TimeRangeController/TimeRangeController";
import ToggleVisibility from '../../components/ToggleVisibility/ToggleVisibility';
import {calcs, numberfyMergedState, xAndYobjects, setStartEndDate, checkDateInput} from "../../logic/logic";
//************************ d3js *************************************
import * as d3 from "d3-time-format";

//************************* react-vis *******************************
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines,
  XAxis, YAxis, VerticalBarSeries, AreaSeries, DiscreteColorLegend, 
 ChartLabel} from 'react-vis';
import 'react-vis/dist/style.css';

//******************** BootstrapTable **********************************
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

//*********************** helperFunctions ******************************
import {filteredResponse, dateFormatConverter} from "../../shared/helperFunctions/helperFunctions";

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
    userEndDate: "", 
    userStartDateError: "",
    userEndDateError: "",
    hideTable: true
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
          
      let userStartDateEvent = event.target.value;
      this.setState(checkDateInput(userStartDateEvent, "userStartDateError"));   
    };

    if(event.target.name === "userEndDate") {
      this.setState ({
          userEndDate: event.target.value		
      });

      let userEndDateEvent = event.target.value;
      this.setState(checkDateInput(userEndDateEvent, "userEndDateError"));

    };

  }

  applyUserInputDate = () => {
    if(this.state.userStartDateError === "" && this.state.userStartDate.length >= 8) {      
      this.setState({
          dateRangeStart: dateFormatConverter(this.state.userStartDate)
      });

    }

    if(this.state.userEndDateError === "" && this.state.userEndDate.length >= 8) {
      this.setState({
        dateRangeEnd: dateFormatConverter(this.state.userEndDate)
      });
    }

  }

  toggleCompVisibility = (event) => {
    let hideComponent = "hide"+event.target.id;
    let hideStatus = this.state[hideComponent];
    this.setState({
      [hideComponent]: !hideStatus
    })
  }

  render() {
    console.log(this.state.userStartDate, "this.state.userStartDate");
    console.log(this.state.userEndDate, "this.state.userEndDate");

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
        
        let errorStartDateMessage = this.state.userStartDateError;
        let errorEndDateMessage = this.state.userEndDateError;

        console.log(this.state.userStartDateError, "this.state.userStartDateError");
        console.log(this.state.userStartDate.length, "this.state.userStartDate.length");

      //************************ RETURN ************************************
    return (
    <div>
      <p>Hello </p>
      <TimeRangeController
        clickTimeRange={this.handleTimeRangeClick}
        userStartTimeState = {this.state.userStartDate}
				userEndTimeState = {this.state.userEndDate} 
        userDateHandler = {this.handleUserDateInput}
        userDateSetter = {this.applyUserInputDate} 					
			/>

      {errorStartDateMessage} {errorEndDateMessage}
      
      <div>
        <XYPlot height={350} width={600}
          margin={{bottom:50, left: 50}}
          xType="time"
          colorType="linear"
          >
          <VerticalGridLines />
          <HorizontalGridLines />
          {/*<XAxis tickFormat={d3.timeFormat("%Y-%b")} tickLabelAngle={-45} />*/}
          <XAxis tickLabelAngle={-45} tickPadding={5}/>
          <YAxis  />
          <ChartLabel 
            text="Recession likelihood, Actual"
            className="alt-y-label"
            includeMargin={false}
            xPercent={-0.06}
            yPercent={0.80}
            style={{
              transform: 'rotate(-90)',
              "font-weight": "bold" 
            }}
            />
          <AreaSeries
              data = {dataRecDescr}
              color="#ff9999" stroke="#f70"
          />
          <LineSeries
              data = {dataNberValue}
              color={0.75}
            />
          <DiscreteColorLegend
            items={[
              {
                title: 'Recession Likelihood 12 months Ahead', 
                color: "#ff9999"
              }, 
              {
                title: 'Actual Recession', 
                color: "black"
              }
            ]}
            orientation="horizontal"
            />


        </XYPlot>


     </div>
     <div className={recessionIndicatorStyles.tableSection} >
     <ToggleVisibility
                whatState = {this.state.hideTable}
                hideID = "Table"
                hideOnClick = {this.toggleCompVisibility}
                showText = "Show Data Table"
                hideText = "Hide Data Table"
              />

        {!this.state.hideTable &&
              <Table data={this.state.tenThreeMerged}/>}

        
      </div>
    </div>
    )

  }

}

export default RecessionIndicator;
