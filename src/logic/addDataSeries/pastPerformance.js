import * as math from 'mathjs';
import {deepJSONArrayClone} from '../../shared/helperFunctions/helperFunctions';

math.config({
    number: 'BigNumber',
    precision: 20
  })


//Function to return pastPerformance "X" amount of months
//in the past
export const pastPerformance = (arrayOverallPerformance, monthsInPastPerf) => {
  //Important, do NOT clone an array resulting from xAndYobjects
  //because the xAndYobjects limits the data to whatever 
  //date it's passed as a state, meaning that if you
  //zoom into the chart for the last 20 yrs, it'll pretend
  //anything before 20yrs is not there thus messing up your calcs
  const arrayOverallPerformanceClone = deepJSONArrayClone(arrayOverallPerformance);
  
  return arrayOverallPerformanceClone.map( (eachObject, index)=>{
    let newObject;
    let perfCalc;
    if(index>(monthsInPastPerf-1)) {
      perfCalc = Number(math.format(
                  math.multiply(
                    math.subtract(
                      math.divide((arrayOverallPerformanceClone[index].value), 
                        (arrayOverallPerformanceClone[index-monthsInPastPerf].value)), 
                    1),
                  100), 
                4))
      newObject = {x:eachObject.date, y:perfCalc}
    } 
    
    if (index < monthsInPastPerf) {
      newObject = {x:eachObject.date, y:0}
    }
    
    return newObject

  });             
};