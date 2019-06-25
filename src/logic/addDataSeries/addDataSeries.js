//*********************** helperFunctions ******************************
import {deepJSONArrayClone} from "../../shared/helperFunctions/helperFunctions";

//************************ d3js *************************************
import * as d3 from "d3-time-format";


export const addDataSeries = (stateWithData) => {
    const dataStateCloneDate = deepJSONArrayClone(stateWithData);
   //console.log(dataStateCloneDate, "DATASTATECLONEDATE")
    //Change the Date to a recognizeable d3 dates
    dataStateCloneDate.forEach( (eachObject) => {
      //Parse the date string into a Date object
      eachObject.date = new Date(eachObject.date);
      //FOR DEBUGGING....
      eachObject.dateGetTime = eachObject.date.getTime();
      //Change the format to numerical month and year to allow for sorting
      //in tables
      let formatMonthTbl = d3.timeFormat("%Y-%m")
      eachObject.dateTbl = formatMonthTbl(eachObject.date);
    });
  
    let dataFilteredArray = [];
    dataStateCloneDate.map( (eachObject, index) => {
      //There's an issue with the Data provided by the Federal Reserve
      //If their daily data is lacking a value, they replaced the value 
      //with a "." So I'm having to change all the dots to a zero
      //otherwise d3 i.e. react-vis won't plot the data
      //strangely, the FED graph shows the data in the crosshair
      //but doesn't display the curve so you can see large gaps in their chart
      if(eachObject.value === ".") {
        eachObject.value = "0"
      } 
      else {
      eachObject.value = Number(eachObject.value);
      }
    //Only collect the data for a monthly closing prices so I had to 
    //filter through the data and extract end-of-month closing days.
    //Unfortunately, the data provided is not clean and sometimes
    //it skips days (and replaces them with a ".")
    //so I'm using the previous day
    //in the future, if you have the same problem, you can try 
    //index-3 instead (and increase if index > 2)
    if(index > 1) {
        let prevIndex = dataStateCloneDate[index-1].date.getMonth();
        let nextIndex = dataStateCloneDate[index].date.getMonth();
        if (prevIndex !== nextIndex) {          
          eachObject = dataStateCloneDate[index-1];
          if(eachObject.value === "0") {
            eachObject = dataStateCloneDate[index-2];
          }
          dataFilteredArray.push(eachObject);
        }
      }
      return dataFilteredArray;
    });
    return dataFilteredArray;
};