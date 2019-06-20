/**************************MATH related Stuff****************************/
import * as math from 'mathjs';
import NormalDistribution from "normal-distribution";

//*********************** helperFunctions ******************************
import {mergedResponse, deepJSONArrayClone, dateYearsAgoAndYearAhead} from "../shared/helperFunctions/helperFunctions";

//************************ d3js *************************************
import * as d3 from "d3-time-format";

//Purpose of this function is to:
// 1) copy the data of two data sets and merged them into one
// 2) Add the nber recession data which is sliced to match
    //whatever longest data we have between mergeState1 and mergeState2
// 3) Perfom calculations related to obtaining the probability of a recession:
      // a) 3-mo equivalent Bond yield
      // b) Spread between 10-yr and 3-month bond equiv
      // c) Probability of recession
export const calcs = (mergeState1, mergeState2, nberState, name ) => {

  math.config({
    number: 'BigNumber',
    precision: 20
  })

  //******************* Find Spread ********************
  //Merged Data to display in table (and for ease of calcs)
  const mergedStates =
  mergedResponse(mergeState1, mergeState2, name);
  //console.log(mergedStates, "merged");

  //Mutate merged array to include bondEqBasis and spread between 10-yr and 3-month yields
  mergedStates.forEach( (eachObject) => {
    //Convert 90 day bill to Bond equivalent Basis, add new property to object:
    eachObject.bondEqBasis =
      math.format(math.eval(365*(eachObject.valueAdd)/(360-91*(eachObject.valueAdd)/100)));
    //Calculate the spread between 10-yr bond and 90-day bondEqBasis
    eachObject.spread = math.format(
      math.subtract(
        eachObject.value, eachObject.bondEqBasis), 4);
  });


  //***** Add the Actual (historical) Recession Values to the mergedStates ******
  //slice the portion of the Recession Values that match the length of the mergedStates Array
      const nberResponseTrimmed =
        nberState.slice(
          nberState.length-mergedStates.length);

  //Add nberValue to mergedStates
  mergedStates.forEach( (eachObject, index) => {
      const nberValue =  nberResponseTrimmed[index].value;
      eachObject.nberValue = nberValue;
      if(eachObject.nberValue === "1") {
        eachObject.nberDescr = "YES";
      } else {
        eachObject.nberDescr = "--";
      }
  });


  //************Find Probability of Recession *************
  //Add data objects with probability 12-months into the future
  //copy the last 12 months of data
  const last12MonthmergedStates = mergedStates.slice(mergedStates.length-12, mergedStates.length);

  //make a deep clone of the last 12 months of data
  const deepCloneLast12mo = deepJSONArrayClone(last12MonthmergedStates);

  //change the dates of the cloned array to be 12-months into the future
  const futureDatesArr = deepCloneLast12mo.map( (eachObject, index ) => {
      let newDate = eachObject.date.split("-");
      newDate[0] = Number(newDate[0])+1;
      let dateToString = newDate[0].toString();
      newDate[0]= dateToString;
      let joined = newDate.join("-");
      eachObject.date = joined;

      let id = "futureDatesArr"+index;
      let date =  eachObject.date;
      let value = "N/A";
      let valueAdd = "N/A";
      let spread = "N/A";
      let nberDescr = "--";
      let newObject = {id, date, value, valueAdd, spread, nberDescr};
      return newObject;
      }
  );

  //push the 12 months into the future dates into the merged array
  mergedStates.push(...futureDatesArr);

  //*********** Actual calculation of probability ********
  const factorOfSafety = 2;
  const alpha = -0.53331; //constant "fit" from data
  const beta =  -0.63304; //constant "fit" from data
  const recStdNormDist = new NormalDistribution();

  //Mutate merged array to include recession Probability
  mergedStates.forEach( (eachObject, index) => {
    if(index > 12 & eachObject.value !== 0){
    const x =  math.format(
                math.add(alpha, math.multiply(
                  beta, mergedStates[index-12].spread)));
    //Calculate probability using Cumulative Distribution Function
    eachObject.recProb = math.format(recStdNormDist.cdf(x), 4);
    //Adjust probability using factor of safety
    eachObject.recProbAdj = math.format(
      math.multiply(recStdNormDist.cdf(x), factorOfSafety), 4);
    }
    else {
      eachObject.recProb = "N/A";
      eachObject.recProbAdj = "N/A";
      eachObject.value = "N/A";
      eachObject.spread = "0";
    }
  });

  //Add description of what Probabilities results mean
  mergedStates.forEach( (eachObject)=>{
    if(eachObject.recProbAdj >= 0 && eachObject.recProbAdj < 0.25) {
      eachObject.recDescription = "Very Low";
    } else if (eachObject.recProbAdj >= 0.25 && eachObject.recProbAdj < 0.45 ) {
        eachObject.recDescription = "Low";
    } else if (eachObject.recProbAdj >= 0.45 && eachObject.recProbAdj < 0.5 ) {
        eachObject.recDescription = "Medium";
    } else if (eachObject.recProbAdj >= 0.5 && eachObject.recProbAdj < 0.7 ) {
      eachObject.recDescription = "High";
    } else if (eachObject.recProbAdj >= 0.7 ) {
      eachObject.recDescription = "Very High";
    } else {
      eachObject.recDescription = "N/A";
    }
  });

  //Change the Date to a recognizeable d3 dates
  //THIS MUST BE PLACED at the Bottom of this function because there are methods
  //above that mess with the dates already (for futures dates )
  mergedStates.forEach( (eachObject) => {
    //Parse the date string into a Date object
    eachObject.date = new Date(eachObject.date);
    //FOR DEBUGGING....
    eachObject.dateGetTime = eachObject.date.getTime();
    //Change the format to numerical month and year to allow for sorting
    //in tables
    let formatMonthTbl = d3.timeFormat("%Y-%m")
    eachObject.dateTbl = formatMonthTbl(eachObject.date);

  });

  //console.log(mergedStates, "mergedStates")


  return mergedStates;
};


//********************************************************************
//Function to turn all props with strings into numbers to use with d3 / react-vis
export const numberfyMergedState = (mergedStatesArray) => {
  //create deep clone of mergeStatesArray and modify content to make all
  //values readable by d3js (so, either date or number format)
  const visObject = deepJSONArrayClone(mergedStatesArray).map ((eachObject) => {
      eachObject.id = eachObject.id + "VIS";
      delete eachObject.dateTbl;
      delete eachObject.recProb;
      delete eachObject.recProbAdj;
      delete eachObject.bondEqBasis;
      delete eachObject.nberDescr;
      switch (eachObject.recDescription) {
          case "N/A": eachObject.recDescription = 0
            break;
          case "Very High": eachObject.recDescription = 5
              break;
          case "High": eachObject.recDescription = 4
              break;
          case "Medium": eachObject.recDescription = 3
              break;
          case "Low": eachObject.recDescription = 2
              break;
          case "Very Low": eachObject.recDescription = 1
              break;
          default: eachObject.recDescription = 0
        };
      if(eachObject.value === "N/A") {
        eachObject.value = 0;
      };
      if(eachObject.spread === "N/A") {
        eachObject.spread = 0;
      };
      if(eachObject.valueAdd === "N/A") {
        eachObject.valueAdd = 0;
      };
      if(eachObject.nberValue !=="1") {
          eachObject.nberValue = 0;
        } else {eachObject.nberValue = 5.1;}

      return eachObject;
  });

  //console.log(visObject, "visObject");
  return visObject;
};

//********************************************************************
//Function to create x and y objects, which are friendly to d3 / react-vis
//NOTE that since we're using defaults, userStartDate and userEndDate are optional parameters
export const xAndYobjects = (array, xPropFromArray, yPropFromArray, userStartDate = "1600-01-01", userEndDate = "2100-01-01" ) => {
  //Since the state is set initially to "", then it defaults as
  // "" instead of the default value provided, hence, two following
  // if statements below
    if(userStartDate == "") {
      userStartDate = "1600-01-01";
    };
    if(userEndDate == "") {
      userEndDate = "2100-01-01";
    };

    //turn string dates into Date objects
    let datedUserStartDates = new Date([userStartDate]);
    let datedUserEndDates = new Date([userEndDate]);
    let datedUserStartDate, datedUserEndDate;

    //check right order of dates inputed, and re-order if necessary
   if(datedUserStartDates > datedUserEndDates) {
       datedUserStartDate = datedUserEndDates;
       datedUserEndDate = datedUserStartDates;
   } else {
       datedUserStartDate = datedUserStartDates;
       datedUserEndDate = datedUserEndDates;
   }


    //Find index in main array where
    let startIndex = array.findIndex( (object) => object[xPropFromArray].getTime() == datedUserStartDate.getTime() );
    let endIndex = array.findIndex( (object) => object[xPropFromArray].getTime() == datedUserEndDate.getTime() );

    //If startIndex not in array, set it to the closest earlier date
      //available, else set it to the beginning of time
      //this ASSUMES the array starts with the oldest date
    if(startIndex == -1) {
      array.map( (object, index)=> {
        if (array[0].date.getTime() > datedUserStartDate.getTime()) {
                 startIndex = 0;
        } else if(object.date.getTime() > datedUserStartDate.getTime()
            && array[index-1].date.getTime() < datedUserStartDate.getTime()) {
                  startIndex = index-1;
        }
             return startIndex;
        });
     }

    //If endIndex not in array, set to end of time
    if(endIndex == -1) {
        array.map( (object, index)=> {


            if(object.date.getTime() > datedUserEndDate.getTime()
            && array[index-1].date.getTime() < datedUserEndDate.getTime()){
                endIndex = index;
            }  else if
                (array[array.length-1].date.getTime() < datedUserEndDate.getTime())  {
                endIndex = array.length-1;
            }


            return endIndex;
            });


    }

    //slice originalArray according to indexes found.
    const dateRange = array.slice(startIndex, endIndex+1);

    //Assign d3 react-vis variable friendly x and y coordinates
            const xyMap = dateRange.map( (eachObject) => {
                 const x = eachObject[xPropFromArray];
                 const y = eachObject[yPropFromArray];
                 const newArray = {x, y};
                 return newArray;
            });
          //console.log(xyMap, "xAndYObjects");
          return xyMap;
};

// ********************************************************************
//Function to let the user toggle date ranges
//use index = 0 for dateRangeStart
//use index = 1 for dateRangeEnd
export const setStartEndDate = (dateRangeId, index) => {

    switch (dateRangeId) {
      case "2yrRange":
        return dateYearsAgoAndYearAhead(2)[index];
      case "5yrRange":
        return dateYearsAgoAndYearAhead(5)[index];
      case "10yrRange":
         return dateYearsAgoAndYearAhead(10)[index];
      case "20yrRange":
        return dateYearsAgoAndYearAhead(20)[index];
      case "30yrRange":
         return dateYearsAgoAndYearAhead(30)[index];
      case "50yrRange":
         return dateYearsAgoAndYearAhead(50)[index];
      case "allyrRange":
         return dateYearsAgoAndYearAhead(300)[index];
      }

};

// **********************************************************
// Function to check date as user inputs it for better User Experience
// Tries to catch the most common mistakes 
// so, to catch all, regex is tested at the end
export const checkDateInput = (eventTargetValue, setDateStatePropError) => {
  let testDate = eventTargetValue;
  //RegEx a little forgiving for better user exp... accepts M/D/YYYY and MM/DD/YYYY
  let testRegex = /^(((0?[1-9]|1[012])\/(0?[1-9]|1\d|2[0-8])|(0?[13456789]|1[012])\/(29|30)|(0?[13578]|1[02])\/31)\/((19|18)|[2-9]\d)\d{2}|0?2\/29\/(((19|18)|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([2468][048]|[3579][26])00)))$/;

  const allowedCharacters = ["/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const numbersOnly = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let state;

  if(testDate.length >= 1 && 
    !numbersOnly.includes(testDate[0])) {
    state = {[setDateStatePropError]: "Error! Please provide a month between 01 and 12"}
  } else {
      state = {[setDateStatePropError]: ""}
  };
    
  if (testDate === "") {
    state =  {[setDateStatePropError]: ""}
  }

  //****check user MONTH input **
  if(testDate.length >= 3) {
      //check if 2 or 1 digit Month number
      if(numbersOnly.includes(testDate[0]) && numbersOnly.includes(testDate[1])) {
        //THEN IT IS A TWO DIGIT NUMBER.
        //Check if first Month digit is correct
        if(!["0", "1"].includes(testDate[0])){
          state = { [setDateStatePropError]: "Error! Please provide a month between 01 and 12"}
        } 
        //If Second digit is incorrect, then error too.
        else if(testDate[0] === "1" && !["0", "1", "2"].includes(testDate[1])) {
          state = {[setDateStatePropError]: "Error! Please provide a month between 01 and 12"}  
        } 
        //if either first or second digit have anything other than allowed characters, then error
        else if(!numbersOnly.includes(testDate[0]) || !allowedCharacters.includes(testDate[1])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid month"}  
        }
        //if no "/" then needs a Slash
        else if(testDate[2] !== "/") {
          state = {[setDateStatePropError]: "Error! Please provide a '/' after the month"}
        }
      } 
      //ELSE IT IS A ONE DIGIT MONTH NUMBER
      else if(!allowedCharacters.includes(testDate[0]) || !allowedCharacters.includes(testDate[1])) {
        state = {[setDateStatePropError]: "Error! Please provide a valid month"}
      }
      //Check a "/" is used in the right spot
        else if(testDate[1] !== "/") {
          state = {[setDateStatePropError]: "Error! Please provide a '/' after the month"}
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
          state = {[setDateStatePropError]: "Error! Please provide a valid day"}  
        } 
        //If Second digit is incorrect, then error too.
        else if(!numbersOnly.includes(testDate[4])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid day"}
        } 
        //No more than 31 days (RegEx will catch actual mistakes at the end)
        else if(["3"].includes(testDate[3]) && !["0", "1"].includes(testDate[4])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid day"} 
        } 
        else if(!allowedCharacters.includes(testDate[3]) || !allowedCharacters.includes(testDate[4])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid Day"}
        }
        //if no "/" then needs a Slash
        else if(testDate[5] !== "/") {
          state = {[setDateStatePropError]: "Error! Please provide a '/' after the day"}
        }
      } 
      //ELSE IT IS A ONE DIGIT DAY NUMBER
      else if(!allowedCharacters.includes(testDate[3]) || !allowedCharacters.includes(testDate[4])) {
        state = {[setDateStatePropError]: "Error! Please provide a valid Day"}
      }
      //Check a "/" is used in the right spot
        else if(testDate[4] !== "/") {
          state = {[setDateStatePropError]: "Error! Please provide a '/' after the day"}
        }
      } 
      else if(testDate.length < 6 && testDate.length > 4) {
        state = { [setDateStatePropError]: ""}  
      }; 
    } 
    ///** ELSE YOU'RE ON A ONE DIGIT MONTH
    else if(testDate.length >= 6)  {
      //Now check if 2 or 1 digit Day number
      if(numbersOnly.includes(testDate[2]) && numbersOnly.includes(testDate[3])) {
        //THEN IT IS A TWO DIGIT DAY
        //Check if first Month digit is correct
        if(!["0", "1", "2", "3"].includes(testDate[2])){
          state = {[setDateStatePropError]: "Error! Please provide a valid day"} 
        } 
        //If Second digit is incorrect, then error too.
        else if(!numbersOnly.includes(testDate[3])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid day"}
        } 
        //No more than 31 days 
        else if(["3"].includes(testDate[2]) && !["0", "1"].includes(testDate[3])) {
          state = { [setDateStatePropError]: "Error! Please provide a valid day"}
        } 
        else if(!allowedCharacters.includes(testDate[2]) || !allowedCharacters.includes(testDate[3])) {
          state = {[setDateStatePropError]: "Error! Please provide a valid Day"}
        }
        //if no "/" then needs a Slash
        else if(testDate[4] !== "/") {
          state = {[setDateStatePropError]: "Error! Please provide a '/' after the day"}
        }
      } 
      //ELSE IT IS A ONE DIGIT DAY NUMBER
      else if(!allowedCharacters.includes(testDate[2]) || !allowedCharacters.includes(testDate[3])) {
        state = {[setDateStatePropError]: "Error! Please provide a valid Day"}
      }
      //Check a "/" is used in the right spot
        else if(testDate[3] !== "/") {
          state = {[setDateStatePropError]: "Error! Please provide a '/' after the day"}
        }
      }; 


  //FINALLY, Check the whole date using RegEx
  //Check format M/D/YYYY
  if(testDate.length >= 8){
    if(testDate.length === 8 && !testRegex.test(testDate)) {
      //console.log(testDate.length, "===8")
      state = {[setDateStatePropError]: "Please enter a valid date"}   
    } 
    //check format MM/D/YYYY and M/DD/YYYY
    else if(testDate.length === 9 && !testRegex.test(testDate)) {
      //console.log(testDate.length, "===9")
      state = {[setDateStatePropError]: "Please enter a valid date"}
    } 
    //check format MM/DD/YYYY
    else if(testDate.length === 10 && !testRegex.test(testDate)) {
      //console.log(testDate.length, "===10")
      state = {[setDateStatePropError]: "Please enter a valid date"}
    } 
    //If format MM/DD/YYYY OK then reset state
    else if(testDate.length === 10 && testRegex.test(testDate)) {
      //console.log(testDate.length, "===10 GOOD")
      state = {[setDateStatePropError]: ""}
    } 
    //if too many characters, then error
    else if(testDate.length > 10 ) {
      //console.log(testDate.length, "TOO MANY NUMS")
      state = {[setDateStatePropError]: "Please enter a valid date"}
    } 
    //if format MM/D/YYYY and M/DD/YYYY OK then reset state
    else if(testDate.length === 9 && testRegex.test(testDate)) {
        //console.log(testDate.length, "===9 GOOD")
        state = {[setDateStatePropError]: ""}
    } 
    //if format M/D/YYYY OK then reset state
    else if(testDate.length === 8 && testRegex.test(testDate)) {
        //console.log(testDate.length, "===8 GOOD")
        state = {[setDateStatePropError]: ""}
    } 
    //if user deletes his wrong format, reset state
    else if (testDate.length <9) {
        state = {[setDateStatePropError]: ""}
    }
  };         

  return state;
  
};
