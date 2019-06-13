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
    userEndDate: "", 
    userStartDateError: "",
    userEndDateError: ""
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
          let testDate = event.target.value;
          //RegEx accepts M/D/YYYY and MM/DD/YYYY
          let testRegex = /^(((0?[1-9]|1[012])\/(0?[1-9]|1\d|2[0-8])|(0?[13456789]|1[012])\/(29|30)|(0?[13578]|1[02])\/31)\/((19|18)|[2-9]\d)\d{2}|0?2\/29\/(((19|18)|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([2468][048]|[3579][26])00)))$/;
        
          this.setState ({
              userStartDate: event.target.value		
            });
          
          const allowedCharacters = ["/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
          const numbersOnly = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
          
          if(testDate.length >= 1 && 
            !numbersOnly.includes(testDate[0])) {
              this.setState({
                userStartDateError: "Error! Please provide a month between 01 and 12"
            });
          } else {
             this.setState({
              userStartDateError: ""
             });
          };
            
          

          if (testDate === "") {
            this.setState({
              userStartDateError: ""
            });
          }

          //****check user MONTH input **
          if(testDate.length >= 3) {
              //check if 2 or 1 digit Month number
              if(numbersOnly.includes(testDate[0]) && numbersOnly.includes(testDate[1])) {
                //THEN IT IS A TWO DIGIT NUMBER.
                //Check if first Month digit is correct
                if(!["0", "1"].includes(testDate[0])){
                  this.setState({
                    userStartDateError: "Error! Please provide a month between 01 and 12"
                  });
                } 
                //If Second digit is incorrect, then error too.
                else if(!["0", "1", "2"].includes(testDate[1])) {
                  this.setState({
                    userStartDateError: "Error! Please provide a month between 01 and 12"
                  });
                } 
                else if(!allowedCharacters.includes(testDate[0]) || !allowedCharacters.includes(testDate[1])) {
                  this.setState({
                    userStartDateError: "Error! Please provide a valid month"
                  });
                }
                //if no "/" then needs a Slash
                else if(testDate[2] !== "/") {
                  this.setState({
                    userStartDateError: "Error! Please provide a '/' after the month"
                  });
                }


              } 
              //ELSE IT IS A ONE DIGIT MONTH NUMBER
              else if(!allowedCharacters.includes(testDate[0]) || !allowedCharacters.includes(testDate[1])) {
                this.setState({
                  userStartDateError: "Error! Please provide a valid month"
                });
              }
              //Check a "/" is used in the right spot
                else if(testDate[1] !== "/") {
                  this.setState({
                    userStartDateError: "Error! Please provide a '/' after the month"
                  });
                }
              };

          //*** Check user DAY input **
          //Check if we have a 2 digit Month
          if(numbersOnly.includes(testDate[0]) && numbersOnly.includes(testDate[1])) {
            //Then it is a 2 digit month.
            //check user input for days
            if(testDate.length >= 6)  {
              //Now check if 2 or 1 digit Day number
              if(numbersOnly.includes(testDate[3]) && numbersOnly.includes(testDate[4])) {
                //THEN IT IS A TWO DIGIT DAY
                //Check if first Month digit is correct
                if(!["0", "1", "2", "3"].includes(testDate[3])){
                  this.setState({
                    userStartDateError: "Error! Please provide a valid day"
                  });
                } 
                //If Second digit is incorrect, then error too.
                else if(!numbersOnly.includes(testDate[4])) {
                  this.setState({
                    userStartDateError: "Error! Please provide a valid day"
                  });
                } 
                //No more than 31 days 
                else if(["3"].includes(testDate[3]) && !["0", "1"].includes(testDate[4])) {
                  this.setState({
                    userStartDateError: "Error! Please provide a valid day"
                  });
                } 
                else if(!allowedCharacters.includes(testDate[3]) || !allowedCharacters.includes(testDate[4])) {
                  this.setState({
                    userStartDateError: "Error! Please provide a valid Day"
                  });
                }
                //if no "/" then needs a Slash
                else if(testDate[5] !== "/") {
                  this.setState({
                    userStartDateError: "Error! Please provide a '/' after the day"
                  });
                }

              } 
              //ELSE IT IS A ONE DIGIT DAY NUMBER
              else if(!allowedCharacters.includes(testDate[3]) || !allowedCharacters.includes(testDate[4])) {
                this.setState({
                  userStartDateError: "Error! Please provide a valid Day"
                });
              }
              //Check a "/" is used in the right spot
                else if(testDate[4] !== "/") {
                  this.setState({
                    userStartDateError: "Error! Please provide a '/' after the day"
                  });
                }
              } 
              else if(testDate.length < 6 && testDate.length > 4) {
                this.setState({
                  userStartDateError: ""
                });
              }; 
            } 
            ///** ELSE YOU'RE ON A ONE DIGIT MONTH
            else if(testDate.length >= 6)  {
              //Now check if 2 or 1 digit Day number
              if(numbersOnly.includes(testDate[2]) && numbersOnly.includes(testDate[3])) {
                //THEN IT IS A TWO DIGIT DAY
                //Check if first Month digit is correct
                if(!["0", "1", "2", "3"].includes(testDate[2])){
                  this.setState({
                    userStartDateError: "Error! Please provide a valid day"
                  });
                } 
                //If Second digit is incorrect, then error too.
                else if(!numbersOnly.includes(testDate[3])) {
                  this.setState({
                    userStartDateError: "Error! Please provide a valid day"
                  });
                } 
                //No more than 31 days 
                else if(["3"].includes(testDate[2]) && !["0", "1"].includes(testDate[3])) {
                  this.setState({
                    userStartDateError: "Error! Please provide a valid day"
                  });
                } 
                else if(!allowedCharacters.includes(testDate[2]) || !allowedCharacters.includes(testDate[3])) {
                  this.setState({
                    userStartDateError: "Error! Please provide a valid Day"
                  });
                }
                //if no "/" then needs a Slash
                else if(testDate[4] !== "/") {
                  this.setState({
                    userStartDateError: "Error! Please provide a '/' after the day"
                  });
                }

              } 
              //ELSE IT IS A ONE DIGIT DAY NUMBER
              else if(!allowedCharacters.includes(testDate[2]) || !allowedCharacters.includes(testDate[3])) {
                this.setState({
                  userStartDateError: "Error! Please provide a valid Day"
                });
              }
              //Check a "/" is used in the right spot
                else if(testDate[3] !== "/") {
                  this.setState({
                    userStartDateError: "Error! Please provide a '/' after the day"
                  });
                }
              }; 
  
          
          //FINALLY, Check the whole date using RegEx
          if(testDate.length >= 8){
            if(testDate.length === 8 && !testRegex.test(testDate)) {
              console.log(testDate.length, "===8")
              this.setState({
                userStartDateError: "Please enter a valid date"
              });    
            } else if(testDate.length === 9 && !testRegex.test(testDate)) {
              console.log(testDate.length, "===9")
              this.setState({
                userStartDateError: "Please enter a valid date"
              });
            } else if(testDate.length === 10 && !testRegex.test(testDate)) {
              console.log(testDate.length, "===10")
              this.setState({
                userStartDateError: "Please enter a valid date"
              });
            } else if(testDate.length === 10 && testRegex.test(testDate)) {
              console.log(testDate.length, "===10 GOOD")
              this.setState({
                userStartDateError: ""
              });
            } else if(testDate.length > 10 ) {
              console.log(testDate.length, "TOO MANY NUMS")
              this.setState({
                userStartDateError: "Please enter a valid date"
              });
            } else if(testDate.length === 9 && testRegex.test(testDate)) {
              console.log(testDate.length, "===9 GOOD")
              this.setState({
                userStartDateError: ""
              });
            } else if(testDate.length === 8 && testRegex.test(testDate)) {
              console.log(testDate.length, "===8 GOOD")
              this.setState({
                userStartDateError: ""
              });
            } else if (testDate.length <9) {
              this.setState({
                userStartDateError: ""
              });
            }
          }         
          
        };

        if(event.target.name === "userEndDate") {
          this.setState ({
            userEndDate: event.target.value		
          });
        };
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
      {errorStartDateMessage}
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
