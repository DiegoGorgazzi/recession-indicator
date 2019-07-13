import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";
import * as math from 'mathjs';

//*********************** components **********************************
import Table from '../../components/Table/Table';
import TimeRangeController from "../../components/TimeRangeController/TimeRangeController";
import ToggleVisibility from '../../components/ToggleVisibility/ToggleVisibility';

//********************** Logic ****************************************
import {calcs, numberfyMergedState} from "../../logic/logic";
import {xAndYobjects} from '../../logic/xAndY/xAndYobjects';
import {setStartEndDate} from '../../logic/date/setStartEndDate';  
import {checkDateInput} from '../../logic/date/checkDateInput';
import {crosshairDisplayWords} from "../../logic/crosshair/crosshair";
import {otherChartCrosshairVal} from '../../logic/crosshair/otherChartCrosshairVal'; 
import {addDataSeries} from '../../logic/addDataSeries/addDataSeries';
import {future12MonthsSeries} from '../../logic/addDataSeries/future12MonthsSeries';
import {displaySeries} from '../../logic/displayGraph/displaySeries';
import {pastPerformance} from '../../logic/addDataSeries/pastPerformance';
import {futurePerformance} from '../../logic/addDataSeries/futurePerformance';
//************************ d3js *************************************
import * as d3 from "d3-time-format";

//************************* react-vis *******************************
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines,
  XAxis, YAxis, VerticalBarSeries, AreaSeries, DiscreteColorLegend, 
 ChartLabel, Crosshair, FlexibleXYPlot } from 'react-vis';
import 'react-vis/dist/style.css';

//******************** BootstrapTable **********************************
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

//*********************** helperFunctions ******************************
import {filteredResponse, dateFormatConverter, deepJSONArrayClone} from "../../shared/helperFunctions/helperFunctions";

//************************ data ****************************************
import {tenYearYield} from "../../data/fedReserveAPI";
import {threeMonthYield} from "../../data/fedReserveAPI";
import {nberUSrecess} from "../../data/fedReserveAPI";
import {wilshire5000} from "../../data/fedReserveAPI";
import {vix} from "../../data/fedReserveAPI";

class RecessionIndicator extends Component {

  state = {
    //******** DATA RELATED STATES *****
    tenYearInt: [],
    threeMonthInt: [],
    nberRecession: [],
    wilshireState: [],
    vixState: [],
    tenThreeMerged: [],
    // ****** DATE RELATED STATES *******
    //VERY IMPORTANT: YOU MUST USE YYYY-MM-DD as your input (just like the JSON API)
    dateRangeStart: "2000-01-01",
    dateRangeEnd: "",
    //NOTE: user dates are eventually converted to dateRangeStart, End.
    userStartDate: "",
    userEndDate: "", 
    userStartDateError: "",
    userEndDateError: "",
    userDateOutOfRangeError: "",
    // ******* TOGGLE ******
    hideTable: true,
    // ******* WINDOW WIDTH ******
    currentWindowWidth: "",
    //**** CROSSHAIR RELATED STATES ***
    crosshairDataRecDescr: "",
    crosshairDataNberValue: "",
    crosshairDataWilshireIndex: "",
    crosshairDataWilshire12moPerformance: "",
    crosshairDataWilshire18moPerformance: "",
    crosshairDataWilshire24moPerformance: "",
    crosshairDataWilshire12moFuturePerformance: "",
    crosshairDataWilshire18moFuturePerformance: "",
    crosshairDataWilshire24moFuturePerformance: "",
    crosshairAllDataValues: []
  }

  componentDidMount () {
    window.addEventListener("resize", this.getWindowWidth);

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
              filteredResponse(wilshireResponse.data.observations, "Wilshire-5000"),
            vixState:
              filteredResponse(vixResponse.data.observations, "Vix")
            });

          console.log(this.state.tenYearInt, "ten");
          //console.log(this.state.threeMonthInt, "three");
          //console.log(this.state.nberRecession, "nber");
          console.log(this.state.wilshireState, "wilshire");
          //console.log(this.state.vixState, "vix");
          }
        ));

    }

  componentWillUnmount() {
      window.removeEventListener("resize", this.getWindowWidth);
  }

  componentDidUpdate(previousProps, previousState, snapshot) {
    if(previousState.tenThreeMerged.length === 0 || previousState.tenThreeMerged.length === 1 ) {
      this.setState({
        tenThreeMerged: calcs(this.state.tenYearInt, this.state.threeMonthInt, this.state.nberRecession, "mergedTenThree" )
      });
    }

    //CHECK IF DATE INPUT IS OUT OF RANGE AND UPDATE ERROR MESSAGE
    const sameAsfutureDateAddition = xAndYobjects(
      future12MonthsSeries(numberfyMergedState(this.state.tenThreeMerged)), 
      "date", 
      "value", 
      this.state.dateRangeStart, 
      this.state.dateRangeEnd);

    if(sameAsfutureDateAddition.length > 0 ) {
      if(new Date(this.state.dateRangeEnd).getTime() > sameAsfutureDateAddition[0]["x"].getTime() ) {
        if(this.state.userDateOutOfRangeError !== "") {
          this.setState({
            userDateOutOfRangeError: ""
          });
        }
      } else if (new Date(this.state.dateRangeEnd).getTime() < sameAsfutureDateAddition[0]["x"].getTime() ){
          if(this.state.userDateOutOfRangeError === ""){
            this.setState({
              userDateOutOfRangeError: "DATE OUT OF RANGE, PLEASE CHANGE THE DATE RANGE"
            });
          }
      } 

    } 



  }

  handleTimeRangeClick = (event) => {
      this.setState({
        dateRangeStart: setStartEndDate(event.target.id, 0),
        dateRangeEnd: setStartEndDate(event.target.id, 1),
        userStartDate: "",
        userEndDate: "",
        userStartDateError: "",
        userEndDateError: "", 
        userDateOutOfRangeError: ""
        });

  }

  handleUserDateInput = (event) => {
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

  crosshairAllDataHandler = () => {
    this.setState({
      crosshairAllDataValues: 
        [this.state.crosshairDataRecDescr, 
          this.state.crosshairDataNberValue,
          this.state.crosshairDataWilshireIndex,
          this.state.crosshairDataWilshire12moPerformance,
          this.state.crosshairDataWilshire18moPerformance,
          this.state.crosshairDataWilshire24moPerformance,
          this.state.crosshairDataWilshire12moFuturePerformance,
          this.state.crosshairDataWilshire18moFuturePerformance,
          this.state.crosshairDataWilshire24moFuturePerformance
        ]
      })
  }

  crosshairDisplayHandler = () => {
   //Change display values in crosshair
   return crosshairDisplayWords(deepJSONArrayClone(this.state.crosshairAllDataValues));

  }

  toggleCompVisibility = (event) => {
    let hideComponent = "hide"+event.target.id;
    let hideStatus = this.state[hideComponent];
    this.setState({
      [hideComponent]: !hideStatus
    });
  }

  scaledRecProbData = (dataArrayToScaleFrom = [] , dataArrayToScale) => {
        //dataArrayToScaleFrom is an array with Nested data arrays
        //If you only have one data array, you must still wrap it in [] 
        let maxValueDataArrayToScaleFrom = 0;
        let minValueDataArrayToScaleFrom = 0;
          if (dataArrayToScaleFrom !== undefined) {
            for (let j = 0; j < dataArrayToScaleFrom.length; ++j){ 
                for (let i = 0; i < dataArrayToScaleFrom[j].length; ++i ) {
                    if(dataArrayToScaleFrom[j][i].y > maxValueDataArrayToScaleFrom) {
                      maxValueDataArrayToScaleFrom = dataArrayToScaleFrom[j][i].y;
                    };
                    if(dataArrayToScaleFrom[j][i].y < minValueDataArrayToScaleFrom) {
                      minValueDataArrayToScaleFrom = dataArrayToScaleFrom[j][i].y;
                    };
                  }
            }
          }
    
    let dataToScale;
    if (dataArrayToScale !== undefined) {
      dataToScale = deepJSONArrayClone(dataArrayToScale);
    
      if (dataToScale !== undefined) {
        dataToScale.map( (eachObject, index) => {
          if(eachObject.y >= 4) {
            return eachObject.y = maxValueDataArrayToScaleFrom;
          }
          else {
            return eachObject.y = minValueDataArrayToScaleFrom
          }
        })
          
      }
    }
    
    return dataToScale;
  }

  //This is needed for variableChartLabel
  getWindowWidth = () => {
    this.setState({
      currentWindowWidth: window.innerWidth
    });
  }

  //Function to physically fix the location of the y-axis
    //label in the component ChartLabel
    //whenever the width of the chart is variable
    //Since no id is available as a prop in the ChartLabel
    //use the className as the replacement for Id so, 
    //make sure you use UNIQUE names
    variableChartLabel = (UniqueClassName, margin) => {
      if(document.getElementsByClassName(UniqueClassName)[0] !== undefined) {
        const width = document.getElementsByClassName(UniqueClassName)[0]
                        .parentElement.width.animVal.value
        let  xPos = margin / width;
       
        return xPos;
      }
      
    }

  render() {
    //************************** VISUALIZATION STUF ******************************
    // -----EVENTUALLY this data needs to be user selected so for example, "recDescription"
    //--is going to have to be part of state.
    const dataRecDescr = xAndYobjects(
                    numberfyMergedState(this.state.tenThreeMerged), 
                    "date", 
                    "recDescription", 
                    this.state.dateRangeStart, 
                    this.state.dateRangeEnd);

    const dataNberValue = xAndYobjects(
                    numberfyMergedState(this.state.tenThreeMerged), 
                    "date", 
                    "nberValue", 
                    this.state.dateRangeStart, 
                    this.state.dateRangeEnd);

    // ADD WILSHIRE DATA
    //Since I'm reusing addDataSeries(this.state.wilshireState), store it in a variable
    const wilshireWorkableData = addDataSeries(this.state.wilshireState);   
    const wilshireIndex = xAndYobjects(
                    wilshireWorkableData, 
                    "date", 
                    "value", 
                    this.state.dateRangeStart, 
                    this.state.dateRangeEnd);                

    const futureDateAddition = xAndYobjects(
                    future12MonthsSeries(numberfyMergedState(this.state.tenThreeMerged)), 
                    "date", 
                    "value", 
                    this.state.dateRangeStart, 
                    this.state.dateRangeEnd);
    
    //WILSHIRE PAST PERFORMANCE
    const wilshire12moPerformance = xAndYobjects(
      pastPerformance(wilshireWorkableData, 12), 
      "x", 
      "y", 
      this.state.dateRangeStart, 
      this.state.dateRangeEnd);
    
    const wilshire18moPerformance = xAndYobjects(
      pastPerformance(wilshireWorkableData, 18), 
      "x", 
      "y", 
      this.state.dateRangeStart, 
      this.state.dateRangeEnd);

    const wilshire24moPerformance = xAndYobjects(
      pastPerformance(wilshireWorkableData, 24), 
      "x", 
      "y", 
      this.state.dateRangeStart, 
      this.state.dateRangeEnd);
    
    //WILSHIRE FUTURE PERFORMANCE
    const wilshire12moFuturePerformance = xAndYobjects(
      futurePerformance(wilshireWorkableData, 12), 
      "x", 
      "y", 
      this.state.dateRangeStart, 
      this.state.dateRangeEnd);
    
    const wilshire18moFuturePerformance = xAndYobjects(
      futurePerformance(wilshireWorkableData, 18), 
      "x", 
      "y", 
      this.state.dateRangeStart, 
      this.state.dateRangeEnd);

    const wilshire24moFuturePerformance = xAndYobjects(
      futurePerformance(wilshireWorkableData, 24), 
      "x", 
      "y", 
      this.state.dateRangeStart, 
      this.state.dateRangeEnd);
    
    console.log(wilshire12moPerformance, "wilshire12moPerformance");
    
    console.log(dataNberValue, "dataNberValue");
    console.log(dataRecDescr, "dataRecDescr")
    console.log(wilshireIndex, "wilshireIndex");

    console.log(this.state.userEndDate, "this.state.userEndDate");
        
    
    
    //**** Left y-axis label *********
    const WORDS = [
          '0',
          'Very Low',
          'Low',
          'Medium',
          'High',
          'Very High'
    ];

    // ******** Crosshair stuff *********************
    //Change display time format in crosshair
    const yrMonthFormat = d3.timeFormat("%Y-%B");
    console.log(this.state.crosshairAllDataValues, "crosshairAllDataValues");


    console.log(this.scaledRecProbData(wilshire12moPerformance, dataRecDescr), "scaledRecProbData");  

    // ************ Legend  *********************
    const legendStyle = {
      display: "flex",
      flexWrap: "wrap",
      maxHeight: 100
    }

    //************************ RETURN ************************************
    return (
    <div className = {recessionIndicatorStyles.container}>
      <header>
        <h1 className={recessionIndicatorStyles.title}>
          The Stock Market & Predicting Recessions 
        </h1>
      </header>
      
      <div>
        <TimeRangeController
          clickTimeRange={this.handleTimeRangeClick}
          userStartTimeState = {this.state.userStartDate}
          userEndTimeState = {this.state.userEndDate} 
          userDateHandler = {this.handleUserDateInput}
          userDateSetter = {this.applyUserInputDate} 	
          timeRangeContainerClassName= {recessionIndicatorStyles["TimeRangeController-container"]}				
          timeRangeClassName= {recessionIndicatorStyles.TimeRangeController}				
          timeUserRangeContainerClassName = {recessionIndicatorStyles["TimeUserRange-container"]}
          timeUserRangeClassName = {recessionIndicatorStyles.TimeUserRange}
        />
        <span className={recessionIndicatorStyles.dateErrorMessage}>
          {this.state.userStartDateError} {this.state.userEndDateError}
          {this.state.userDateOutOfRangeError}
        </span>
      </div>

      {/* ------------- RECESSION AND PREDICTIONS CHART --------------*/}
      <div className= {recessionIndicatorStyles.chartArea}>
      
        <FlexibleXYPlot 
          margin={{bottom:35, left: 70}}
          className = {recessionIndicatorStyles.plot}
          xType="time"
          colorType="linear"
          onMouseMove = {this.crosshairAllDataHandler}
          onMouseLeave= {() => {
            this.setState({
              crosshairDataRecDescr: "",
              crosshairDataNberValue: "",
              crosshairAllDataValues: []
              })
          }}
        >
          <VerticalGridLines />
          <HorizontalGridLines />
          {/*<XAxis tickFormat={d3.timeFormat("%Y-%b")} tickLabelAngle={-45} />*/}
          <XAxis tickLabelAngle={-45} tickPadding={5}/>
          <YAxis  
            tickFormat={v => WORDS[v]} 
            tickLabelAngle={-45} tickPadding={5}
            />
        
          <ChartLabel 
            text="Recession likelihood, Actual"
            //IMPORTANT, DO NOT DELETE OR RENAME CLASSNAME
            //AS IT IS USED BY THE variableChartLabel FUNCTION
            className="altYlabelRecession"
            includeMargin={false}
            xPercent={this.variableChartLabel("altYlabelRecession", -65)}
            yPercent={0.80}
            style={{
              transform: 'rotate(-90)',
              fontWeight: "bold"
            }}
            />
          
          <AreaSeries
              data = { displaySeries(this.state.dateRangeEnd, dataRecDescr, "x")}
              color="#ff9999" stroke="#f70"
              onNearestX = {(value) => {
                this.setState({crosshairDataRecDescr: value })}}
          />
          <LineSeries
              data = { displaySeries(this.state.dateRangeEnd, dataNberValue, "x")}
              color={0.75}
              onNearestX = {(value, {index}) => {
                this.setState({
                  crosshairDataNberValue: value,  
                  crosshairDataWilshireIndex: otherChartCrosshairVal(dataNberValue, wilshireIndex, index+12),
                  crosshairDataWilshire12moPerformance: otherChartCrosshairVal(dataNberValue, wilshire12moPerformance, index+12),
                  crosshairDataWilshire18moPerformance: otherChartCrosshairVal(dataNberValue, wilshire18moPerformance, index+12),
                  crosshairDataWilshire24moPerformance: otherChartCrosshairVal(dataNberValue, wilshire24moPerformance, index+12),
                  crosshairDataWilshire12moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire12moFuturePerformance, index+12),
                  crosshairDataWilshire18moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire18moFuturePerformance, index+12),
                  crosshairDataWilshire24moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire24moFuturePerformance, index+12)
                })
              }}
            />

          <DiscreteColorLegend
            style={legendStyle}
            items={[
              {
                title: 'Recession Likelihood (12 months Ahead)', 
                color: "#ff9999"
              }, 
              {
                title: 'Actual Recession', 
                color: "black"
              }
            ]}
            orientation="horizontal"
            />
          
          <Crosshair 
            values={this.crosshairDisplayHandler()}
            titleFormat={(d) => ({title: 'Date', value: yrMonthFormat(d[0].x)})}
            itemsFormat={(d) => 
              [{title: 'Recession Likelihood', value: d[0].y}, 
              {title: 'Actual Recession', value: d[1].y}]
              }
            />
          
        </FlexibleXYPlot>
      </div>
      
      {/* -------------WILSHIRE CUMULATIVE PERFORMANCE CHART --------------*/}
      <div className={recessionIndicatorStyles.chartArea}>

        <FlexibleXYPlot 
          margin={{bottom:50, left: 70}}
          className = {recessionIndicatorStyles.plot}
          xType="time"
          colorType="linear"
          onMouseMove = {this.crosshairAllDataHandler}
          onMouseLeave= {() => {
            this.setState({
              crosshairDataWilshireIndex: "",
              crosshairDataRecDescr: "",
              crosshairDataNberValue: "",
              crosshairAllDataValues: []
              })
          }}
          >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis  
            tickLabelAngle={-45} tickPadding={5}
            />
          <YAxis  
             tickLabelAngle={-45} tickPadding={5}
            />
          <ChartLabel 
            text="Price Index"
            className="altYlabelWilshire"
            includeMargin={false}
            xPercent={this.variableChartLabel("altYlabelWilshire", -65)}
            yPercent={0.65}
            style={{
              transform: 'rotate(-90)',
              "fontWeight": "bold" 
            }}
            />
          <AreaSeries
            data = { displaySeries(this.state.dateRangeEnd, this.scaledRecProbData([wilshireIndex], dataRecDescr), "x")}
            color= "#ff9999"
            /> 
          <LineSeries
               data = { displaySeries(this.state.dateRangeEnd, wilshireIndex, "x")}
               color="#800080"
               onNearestX = {(value, {index}) => {
                this.setState({
                  crosshairDataRecDescr: otherChartCrosshairVal(dataNberValue, dataRecDescr, index),
                  crosshairDataNberValue: otherChartCrosshairVal(dataNberValue, dataNberValue, index),
                  crosshairDataWilshireIndex: value,
                  crosshairDataWilshire12moPerformance: otherChartCrosshairVal(dataNberValue, wilshire12moPerformance, index+12),
                  crosshairDataWilshire18moPerformance: otherChartCrosshairVal(dataNberValue, wilshire18moPerformance, index+12),
                  crosshairDataWilshire24moPerformance: otherChartCrosshairVal(dataNberValue, wilshire24moPerformance, index+12),
                  crosshairDataWilshire12moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire12moFuturePerformance, index+12),
                  crosshairDataWilshire18moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire18moFuturePerformance, index+12),
                  crosshairDataWilshire24moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire24moFuturePerformance, index+12)
                })
              }}
            />
          <AreaSeries
                data = {displaySeries(this.state.dateRangeEnd, futureDateAddition, "x")}
                color= "transparent"
              />
          <DiscreteColorLegend
            style={legendStyle}
            items={[
              {
                title: 'Recession >= "High" Likelihood (12 months Ahead)', 
                color: "#ff9999"
              }, 
              {
                title: 'Wilshire 5000, Price Index', 
                color: "#800080"
              }
            ]}
            orientation="horizontal"
            />
          
          <Crosshair 
            values={this.state.crosshairAllDataValues}
            titleFormat={(d) => ({title: 'Date', value: yrMonthFormat(d[0].x)})}
            itemsFormat={(d) => 
              [{title: 'Index Value', value: d[2].y}
              ]
              }
            />
          

        </FlexibleXYPlot >

  
        </div>
        
        {/* -------------WILSHIRE PAST PERFORMANCE CHART --------------*/}
        <div className={recessionIndicatorStyles.chartArea}>

          <FlexibleXYPlot 
            margin={{bottom:50, left: 70}}
            className = {recessionIndicatorStyles.plot}
            xType="time"
            colorType="linear"
            onMouseMove = {this.crosshairAllDataHandler}
            onMouseLeave= {() => {
              this.setState({
                crosshairDataWilshire12moPerformance: "",
                crosshairDataWilshire18moPerformance: "",
                crosshairDataWilshire24moPerformance: "",
                crosshairAllDataValues: []
                })
            }} 
            >
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis  
              tickLabelAngle={-45} tickPadding={5}
              />
            <YAxis  
              tickLabelAngle={-45} tickPadding={5}
              />
            <ChartLabel 
              text="Percentage"
              className="altYlabelPastPerf"
              includeMargin={false}
              xPercent={this.variableChartLabel("altYlabelPastPerf", -65)}
              yPercent={0.65}
              style={{
                transform: 'rotate(-90)',
                "fontWeight": "bold" 
              }}
              />
            <AreaSeries
              data = { displaySeries(this.state.dateRangeEnd, 
                  this.scaledRecProbData([wilshire12moPerformance, 
                    wilshire18moPerformance, wilshire24moPerformance], 
                    dataRecDescr), "x")}
              color= "#ff9999"
              />  
            <LineSeries
                  data = { displaySeries(this.state.dateRangeEnd, wilshire24moPerformance, "x")} 
                  color="#00ff00"
                  onNearestX = {(value, {index}) => {
                    this.setState({
                      crosshairDataRecDescr: otherChartCrosshairVal(dataNberValue, dataRecDescr, index),
                      crosshairDataNberValue: otherChartCrosshairVal(dataNberValue, dataNberValue, index),
                      crosshairDataWilshireIndex: otherChartCrosshairVal(dataNberValue, wilshireIndex, index+12),
                      crosshairDataWilshire12moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire12moFuturePerformance, index+12),
                      crosshairDataWilshire18moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire18moFuturePerformance, index+12),
                      crosshairDataWilshire24moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire24moFuturePerformance, index+12),
                      crosshairDataWilshire24moPerformance: value
                    })
                  }}
              />  
            <LineSeries
                  data = { displaySeries(this.state.dateRangeEnd, wilshire18moPerformance, "x")} 
                  color="#009900"
                  onNearestX = {(value, {index}) => {
                    this.setState({
                      crosshairDataRecDescr: otherChartCrosshairVal(dataNberValue, dataRecDescr, index),
                      crosshairDataNberValue: otherChartCrosshairVal(dataNberValue, dataNberValue, index),
                      crosshairDataWilshireIndex: otherChartCrosshairVal(dataNberValue, wilshireIndex, index+12),
                      crosshairDataWilshire12moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire12moFuturePerformance, index+12),
                      crosshairDataWilshire18moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire18moFuturePerformance, index+12),
                      crosshairDataWilshire24moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire24moFuturePerformance, index+12),
                      crosshairDataWilshire18moPerformance: value
                    })
                  }}
              />  
            <LineSeries
                  data = { displaySeries(this.state.dateRangeEnd, wilshire12moPerformance, "x")} 
                  color="#003300"
                  onNearestX = {(value, {index}) => {
                    this.setState({
                      crosshairDataRecDescr: otherChartCrosshairVal(dataNberValue, dataRecDescr, index),
                      crosshairDataNberValue: otherChartCrosshairVal(dataNberValue, dataNberValue, index),
                      crosshairDataWilshireIndex: otherChartCrosshairVal(dataNberValue, wilshireIndex, index+12),
                      crosshairDataWilshire24moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire24moFuturePerformance, index+12),
                      crosshairDataWilshire18moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire18moFuturePerformance, index+12),
                      crosshairDataWilshire12moFuturePerformance: otherChartCrosshairVal(dataNberValue, wilshire12moFuturePerformance, index+12),
                      crosshairDataWilshire12moPerformance: value
                    })
                  }}
                />
            <AreaSeries
                  data =  {displaySeries(this.state.dateRangeEnd, futureDateAddition, "x")} 
                  color= "transparent"
                />
            <DiscreteColorLegend
                style={legendStyle}
                items={[
                  {
                    title: 'Recession >= "High" Likelihood (12 months Ahead)', 
                    color: "#ff9999"
                  }, 
                  {
                    title: 'Wilshire 12-month Performance', 
                    color: "#003300"
                  },
                  {
                    title: 'Wilshire 18-month Performance', 
                    color: "#009900"
                  },
                  {
                    title: 'Wilshire 24-month Performance', 
                    color: "#00ff00"
                  }
                ]}
                orientation="horizontal"
                />
            <Crosshair 
              values={this.state.crosshairAllDataValues}
              titleFormat={(d) => ({title: 'Date', value: yrMonthFormat(d[0].x)})}
              itemsFormat={(d) => 
                [{title: '12-mo Performance', value: math.format(d[3].y, 3)+"%"},
                 {title: '18-mo Performance', value: math.format(d[4].y, 3)+"%"},
                 {title: '24-mo Performance', value: math.format(d[5].y, 3)+"%"}
                ]
                }
              />

          </FlexibleXYPlot >


        </div>

        {/* -------------WILSHIRE FUTURE PERFORMANCE CHART --------------*/}
        <div className={recessionIndicatorStyles.chartArea}>

        <FlexibleXYPlot 
          margin={{bottom:50, left: 70}}
          className = {recessionIndicatorStyles.plot}
          xType="time"
          colorType="linear"
          onMouseMove = {this.crosshairAllDataHandler}
          onMouseLeave= {() => {
            this.setState({
              crosshairDataWilshire12moFuturePerformance: "",
              crosshairDataWilshire18moFuturePerformance: "",
              crosshairDataWilshire24moFuturePerformance: "",
              crosshairAllDataValues: []
              })
          }} 
          >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis  
            tickLabelAngle={-45} tickPadding={5}
            />
          <YAxis  
            tickLabelAngle={-45} tickPadding={5}
            />
          <ChartLabel 
            text="Percentage"
            className="altYlabelFutPerf"
            includeMargin={false}
            xPercent={this.variableChartLabel("altYlabelFutPerf", -65)}
            yPercent={0.65}
            style={{
              transform: 'rotate(-90)',
              "fontWeight": "bold" 
            }}
            />
          <AreaSeries
            data = { displaySeries(this.state.dateRangeEnd, 
                this.scaledRecProbData([wilshire12moFuturePerformance, 
                  wilshire18moFuturePerformance, wilshire24moFuturePerformance], 
                  dataRecDescr), "x")}
            color= "#ff9999"
            />  
          <LineSeries
                data = { displaySeries(this.state.dateRangeEnd, wilshire24moFuturePerformance, "x")} 
                color="#6666ff"
                onNearestX = {(value, {index}) => {
                  this.setState({
                    crosshairDataRecDescr: otherChartCrosshairVal(dataNberValue, dataRecDescr, index),
                    crosshairDataNberValue: otherChartCrosshairVal(dataNberValue, dataNberValue, index),
                    crosshairDataWilshire24moPerformance: otherChartCrosshairVal(dataNberValue, wilshire24moPerformance, index+12),
                    crosshairDataWilshire24moFuturePerformance: value
                  })
                }}
            />  
          <LineSeries
                data = { displaySeries(this.state.dateRangeEnd, wilshire18moFuturePerformance, "x")} 
                color="#0000e6"
                onNearestX = {(value, {index}) => {
                  this.setState({
                    crosshairDataRecDescr: otherChartCrosshairVal(dataNberValue, dataRecDescr, index),
                    crosshairDataNberValue: otherChartCrosshairVal(dataNberValue, dataNberValue, index),
                    crosshairDataWilshireIndex: otherChartCrosshairVal(dataNberValue, wilshireIndex, index+12),
                    crosshairDataWilshire18moPerformance: otherChartCrosshairVal(dataNberValue, wilshire18moPerformance, index+12),
                    crosshairDataWilshire18moFuturePerformance: value
                  })
                }}
            />  
          <LineSeries
                data = { displaySeries(this.state.dateRangeEnd, wilshire12moFuturePerformance, "x")} 
                color="#000066"
                onNearestX = {(value, {index}) => {
                  this.setState({
                    crosshairDataRecDescr: otherChartCrosshairVal(dataNberValue, dataRecDescr, index),
                    crosshairDataNberValue: otherChartCrosshairVal(dataNberValue, dataNberValue, index),
                    crosshairDataWilshireIndex: otherChartCrosshairVal(dataNberValue, wilshireIndex, index+12),
                    crosshairDataWilshire12moPerformance: otherChartCrosshairVal(dataNberValue, wilshire12moPerformance, index+12),
                    crosshairDataWilshire12moFuturePerformance: value
                  })
                }}
              />
          <AreaSeries
                data =  {displaySeries(this.state.dateRangeEnd, futureDateAddition, "x")} 
                color= "transparent"
              />
          <DiscreteColorLegend
              style={legendStyle}
              items={[
                {
                  title: 'Recession >= "High" Likelihood (12 months Ahead)', 
                  color: "#ff9999"
                }, 
                {
                  title: 'Wilshire 12-month FUTURE Performance', 
                  color: "#000066"
                },
                {
                  title: 'Wilshire 18-month FUTURE Performance', 
                  color: "#0000e6"
                },
                {
                  title: 'Wilshire 24-month FUTURE Performance', 
                  color: "#6666ff"
                }
              ]}
              orientation="horizontal"
              />
          <Crosshair 
            values={this.state.crosshairAllDataValues}
            titleFormat={(d) => ({title: 'Date', value: yrMonthFormat(d[0].x)})}
            itemsFormat={(d) => 
              [{title: '12-mo FUTURE Performance', value: math.format(d[6].y, 3)+"%"},
              {title: '18-mo FUTURE Performance', value: math.format(d[7].y, 3)+"%"},
              {title: '24-mo FUTURE Performance', value: math.format(d[8].y, 3)+"%"}
              ]
              }
            />

        </FlexibleXYPlot >


      </div>


     {/* ------------------------------TABLE -------------------------------*/}               
     <div className={recessionIndicatorStyles.tableSection} >
     <ToggleVisibility
                whatState = {this.state.hideTable}
                hideID = "Table"
                hideOnClick = {this.toggleCompVisibility}
                showText = "Show Data Table"
                hideText = "Hide Data Table"
              />

        {!this.state.hideTable &&
              <Table 
                tableContainerClass = {recessionIndicatorStyles["Table-container"]}
                data={this.state.tenThreeMerged}
                />}

        
      </div>
    </div>
    )

  }

}

export default RecessionIndicator;
