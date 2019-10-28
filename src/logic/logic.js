/**************************MATH related Stuff****************************/
import {create, all} from 'mathjs';
import NormalDistribution from "normal-distribution";

//*********************** helperFunctions ******************************
import {mergedResponse, deepJSONArrayClone} from "../shared/helperFunctions/helperFunctions";

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

  const config = {
    number: 'BigNumber',
    precision: 20
  };

  const math = create(all, config);

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
      math.format(math.evaluate(365*(eachObject.valueAdd)/(360-91*(eachObject.valueAdd)/100)));
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