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
//************************ d3js *************************************
import * as d3 from "d3-time-format";

//************************* react-vis *******************************
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines,
  XAxis, YAxis, VerticalBarSeries, AreaSeries, DiscreteColorLegend, 
 ChartLabel, Crosshair} from 'react-vis';
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
    //**** CROSSHAIR RELATED STATES ***
    crosshairDataRecDescr: "",
    crosshairDataNberValue: "",
    crosshairDataWilshireIndex: "",
    crosshairDataWilshire12moPerformance: "",
    crosshairDataWilshire18moPerformance: "",
    crosshairDataWilshire24moPerformance: "",
    crosshairAllDataValues: []
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
          this.state.crosshairDataWilshire24moPerformance
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
    
    //WILSHIRE PERFORMANCE
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

    //************************ RETURN ************************************
    return (
    <div>
      <h1 className={recessionIndicatorStyles.title}>
        The Stock Market & Predicting Recessions 
      </h1>
      
      <div className={recessionIndicatorStyles.TimeRangeController}>
      <TimeRangeController
        clickTimeRange={this.handleTimeRangeClick}
        userStartTimeState = {this.state.userStartDate}
				userEndTimeState = {this.state.userEndDate} 
        userDateHandler = {this.handleUserDateInput}
        userDateSetter = {this.applyUserInputDate} 					
			/>

      {this.state.userStartDateError} {this.state.userEndDateError}
      </div>

      {/* ------------- RECESSION AND PREDICTIONS CHART --------------*/}
      <div>
      {this.state.userDateOutOfRangeError}
        <XYPlot height={350} width={600}
          margin={{bottom:50, left: 100}}
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
            className="alt-y-label"
            includeMargin={false}
            xPercent={-0.12}
            yPercent={0.80}
            style={{
              transform: 'rotate(-90)',
              "fontWeight": "bold" 
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
                  crosshairDataWilshire24moPerformance: otherChartCrosshairVal(dataNberValue, wilshire24moPerformance, index+12)
                })
              }}
            />

          <DiscreteColorLegend
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
          
        </XYPlot>
      </div>
      
      {/* -------------WILSHIRE CUMULATIVE PERFORMANCE CHART --------------*/}
      <div className={recessionIndicatorStyles.chartArea}>

        <XYPlot height={350} width={600}
          margin={{bottom:50, left: 100}}
          xType="time"
          colorType="linear"
          onMouseMove = {this.crosshairAllDataHandler}
          onMouseLeave= {() => {
            this.setState({
              crosshairDataWilshireIndex: "",
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
            className="alt-y-label"
            includeMargin={false}
            xPercent={-0.12}
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
               color="blue"
               onNearestX = {(value, {index}) => {
                this.setState({
                  crosshairDataRecDescr: value,
                  crosshairDataNberValue: value,
                  crosshairDataWilshireIndex: value,
                  crosshairDataWilshire12moPerformance: otherChartCrosshairVal(dataNberValue, wilshire12moPerformance, index+12),
                  crosshairDataWilshire18moPerformance: otherChartCrosshairVal(dataNberValue, wilshire18moPerformance, index+12),
                  crosshairDataWilshire24moPerformance: otherChartCrosshairVal(dataNberValue, wilshire24moPerformance, index+12)
                })
              }}
            />
          <AreaSeries
                data = {displaySeries(this.state.dateRangeEnd, futureDateAddition, "x")}
                color= "transparent"
              />
          <DiscreteColorLegend
            items={[
              {
                title: 'Recession >= "High" Likelihood (12 months Ahead)', 
                color: "#ff9999"
              }, 
              {
                title: 'Wilshire 5000, Price Index', 
                color: "blue"
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
          

        </XYPlot>

  
        </div>
        
        {/* -------------WILSHIRE PAST PERFORMANCE CHART --------------*/}
        <div className={recessionIndicatorStyles.chartArea}>

          <XYPlot height={350} width={600}
            margin={{bottom:50, left: 100}}
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
              className="alt-y-label"
              includeMargin={false}
              xPercent={-0.12}
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
                  onNearestX = {(value) => {
                    this.setState({
                      crosshairDataRecDescr: value,
                      crosshairDataNberValue: value,
                      crosshairDataWilshire24moPerformance: value
                    })
                  }}
              />  
            <LineSeries
                  data = { displaySeries(this.state.dateRangeEnd, wilshire18moPerformance, "x")} 
                  color="#009900"
                  onNearestX = {(value) => {
                    this.setState({
                      crosshairDataRecDescr: value,
                      crosshairDataNberValue: value,
                      crosshairDataWilshire18moPerformance: value
                    })
                  }}
              />  
            <LineSeries
                  data = { displaySeries(this.state.dateRangeEnd, wilshire12moPerformance, "x")} 
                  color="#003300"
                  onNearestX = {(value, {index}) => {
                    this.setState({
                      crosshairDataRecDescr: value,
                      crosshairDataNberValue: value,
                      crosshairDataWilshireIndex: otherChartCrosshairVal(dataNberValue, wilshireIndex, index+12),
                      crosshairDataWilshire12moPerformance: value
                    })
                  }}
                />
            <AreaSeries
                  data =  {displaySeries(this.state.dateRangeEnd, futureDateAddition, "x")} 
                  color= "transparent"
                />
            <DiscreteColorLegend
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
                [{title: '12-mo Performance', value: d[3].y},
                 {title: '18-mo Performance', value: d[4].y},
                 {title: '24-mo Performance', value: d[5].y}
                ]
                }
              />

          </XYPlot>


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
              <Table data={this.state.tenThreeMerged}/>}

        
      </div>
    </div>
    )

  }

}

export default RecessionIndicator;
