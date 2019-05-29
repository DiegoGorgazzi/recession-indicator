import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

/*********************** components **********************************/
import Table from '../../components/Table/Table';

//******************** BootstrapTable **********************************
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { ColumnToggle } from 'react-bootstrap-table2-toolkit';

/**************************MATH related Stuff****************************/
import * as math from 'mathjs';
import * as numbers from 'numbers';
import NormalDistribution from "normal-distribution";

//*********************** helperFunctions ******************************
import {filteredResponse, mergedResponse} from "../../shared/helperFunctions/helperFunctions";

//************************ data ****************************************
import {tenYearYield} from "../../data/fedReserveAPI";
import {threeMonthYield} from "../../data/fedReserveAPI";
import {nberUSrecess} from "../../data/fedReserveAPI";
import {willshire5000} from "../../data/fedReserveAPI";
import {vix} from "../../data/fedReserveAPI";

class RecessionIndicator extends Component {

  state = {
    tenYearInt: [],
    threeMonthInt: [],
    nberRecession: [],
    willshireState: [],
    vixState:[]
  }

  componentDidMount () {
    axios.all([
      axios.get(tenYearYield),
      axios.get(threeMonthYield),
      ])
        .then(axios.spread( (tenYrYldResponse, threeMthYldResponse ) => {

            this.setState({
            tenYearInt: filteredResponse(tenYrYldResponse.data.observations, "10-yr-yields"),
            threeMonthInt: filteredResponse(threeMthYldResponse.data.observations, "3-month-yields"),
            });

          console.log(this.state.tenYearInt, "ten");
          console.log(this.state.threeMonthInt, "three");
          }
        ));

      axios.get(nberUSrecess).then(nberResponse => {
        this.setState({
          nberRecession: filteredResponse(nberResponse.data.observations, "US-recession")
        });
        //console.log(this.state.nberRecession, "nber");
      });

      axios.get(willshire5000).then(willshireResponse => {
        this.setState({
          willshireState: filteredResponse(willshireResponse.data.observations, "Whillshire-5000")
        });
        //console.log(this.state.willshireState, "willshire");
      });

      axios.get(vix).then(vixResponse => {
        this.setState({
          vixState: filteredResponse(vixResponse.data.observations, "Vix")
        });
        //console.log(this.state.vixState, "vix");
      });

}

  render() {

    /*************************** Math Calcs ***************************/
    math.config({
      number: 'BigNumber',
      precision: 20
    })

    /******************* Find Spread ********************/
    //Merged Data to display in table (and for ease of calcs)
    const tenThreeMerged =
    mergedResponse(this.state.tenYearInt, this.state.threeMonthInt, "merged");
    //console.log(tenThreeMerged, "merged");

    //Mutate merged array to include bondEqBasis
    tenThreeMerged.forEach( (eachObject) => {
      //Convert 90 day bill to Bond equivalent Basis, add new property to object:
      eachObject.bondEqBasis =
        math.format(math.eval(365*(eachObject.valueAdd)/(360-91*(eachObject.valueAdd)/100)));
    });

    //Mutate merged array to include spread between 10-yr and 3-mo
    tenThreeMerged.forEach( (eachObject) => {
      //Calculate the spread between 10-yr bond and 90-day bondEqBasis
      eachObject.spread = math.format(math.subtract(eachObject.value, eachObject.bondEqBasis), 4);
    });

    /************Find Probability of Recession *************/

    //Add data objects with probability 12-months into the future
    //copy the last 12 months of data
    let newArr = tenThreeMerged.slice(tenThreeMerged.length-12, tenThreeMerged.length);

    //make a deep clone of the last 12 months of data
    let deepClone = newArr.map( (eachObject, index) => {
         eachObject = {...newArr[index]};
         return eachObject;
    });

    //change the dates of the cloned array to be 12-months into the future
    let futureDatesArr = deepClone.map( (eachObject, index ) => {
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
        let newObject = {id, date, value, valueAdd, spread};
        return newObject;
        }
    );

    //push the 12 months into the future dates into the merged array
    tenThreeMerged.push(...futureDatesArr);
    console.log(tenThreeMerged, "tenThreeMerged");


    /****** Actual calculation of probability ********/
    const factorOfSafety = 2;
    const alpha = -0.53331; //constant "fit" from data
    const beta =  -0.63304; //constant "fit" from data
    const recStdNormDist = new NormalDistribution();

    //Mutate merged array to include recession Probability
    tenThreeMerged.forEach( (eachObject, index) => {
      if(index > 12 & eachObject.value !== 0){
      const x =  math.format(
                  math.add(alpha, math.multiply(
                    beta, tenThreeMerged[index-12].spread)));
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


    tenThreeMerged.forEach( (eachObject)=>{
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


    /************************ RETURN *************************************/
    return (
    <div>
      <p>Hello </p>

        <Table data={tenThreeMerged}/>

    </div>
  )


  }


}

export default RecessionIndicator;
