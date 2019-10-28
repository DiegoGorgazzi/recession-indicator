import {create, all} from 'mathjs';
import {deepJSONArrayClone} from '../../shared/helperFunctions/helperFunctions';
import {pastPerformance} from './pastPerformance';

const config = {
  number: 'BigNumber',
  precision: 20
};

const math = create(all, config);


math.config({
    number: 'BigNumber',
    precision: 20
  })

//Function to return futurePerformance "X" amount of months
//in the Future
export const futurePerformance = (arrayOverallPerformance, monthsInFuturePerf) => {
    //Important, do NOT clone an array resulting from xAndYobjects
    //because the xAndYobjects limits the data to whatever 
    //date it's passed as a state, meaning that if you
    //zoom into the chart for the last 20 yrs, it'll pretend
    //anything before 20yrs is not there thus messing up your calcs

    const pastArray = pastPerformance(arrayOverallPerformance, monthsInFuturePerf)
    
    let futureOverallPerformance = deepJSONArrayClone(pastArray);
    
    return futureOverallPerformance.map( (eachObject, index)=>{
            let movedObject;
            let movedY;
            
            if(index + (monthsInFuturePerf) < futureOverallPerformance.length) {
            movedY = futureOverallPerformance[index + monthsInFuturePerf].y    
            movedObject = {x: eachObject.x, y: movedY}
            } 
            
            else {
            movedObject = {x:eachObject.x, y:0}
            }
            
            return movedObject
        
        });
    
  };