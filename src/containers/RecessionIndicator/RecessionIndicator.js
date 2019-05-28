import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

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
        console.log(this.state.nberRecession, "nber");
      });

      axios.get(willshire5000).then(willshireResponse => {
        this.setState({
          willshireState: filteredResponse(willshireResponse.data.observations, "Whillshire-5000")
        });
        console.log(this.state.willshireState, "willshire");
      });

      axios.get(vix).then(vixResponse => {
        this.setState({
          vixState: filteredResponse(vixResponse.data.observations, "Vix")
        });
        console.log(this.state.vixState, "vix");
      });

}

  render() {

    /*************************** Math Calcs ***************************/
    math.config({
      number: 'BigNumber',
      precision: 20
    })

    /************** Find Spread ********************/
    //Merged Data to display in table (and for ease of calcs)
    const tenThreeMerged =
    mergedResponse(this.state.tenYearInt, this.state.threeMonthInt, "merged");
    console.log(tenThreeMerged, "merged");

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

    /************** Find Probability of Recession ********************/
    const factorOfSafety = 2;
    const alpha = -0.53331; //constant "fit" from data
    const beta =  -0.63304; //constant "fit" from data
    const recStdNormDist = new NormalDistribution;

    //Mutate merged array to include recession Probability
    tenThreeMerged.forEach( (eachObject) => {
      const x =  math.format(math.add(alpha, math.multiply(beta, eachObject.spread)));
      //Calculate probability using Cumulative Distribution Function
      eachObject.recProb = math.format(recStdNormDist.cdf(x), 4);
      //Adjust probability using factor of safety
      eachObject.recProbAdj = math.format(math.multiply(recStdNormDist.cdf(x), factorOfSafety), 4);
    });




    /******************react-bootstrap-table2***************/
    const { ToggleList } = ColumnToggle;
    const columns = [{
      dataField: 'date',
      text: 'Date',
      sort: true
    }, {
      dataField: 'value',
      text: '10-yr avg yield, %'
    },
    {
      dataField: 'valueAdd',
      text: '3-month avg yield, %'
    },
    {
      dataField: 'spread',
      text: 'Yield Spread, 10-yr & 3-mo (Bond Equiv.)',
      hidden: true
    }
  ];

    const defaultSorted = [{
    dataField: 'date',
    order: 'desc'
    }];

    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing { from } to { to } of { size } Results
      </span>
    );

    const options = {
    paginationSize: 6,
    pageStartIndex: 1,
    // alwaysShowAllBtns: true, // Always show next and previous button
    // withFirstAndLast: false, // Hide the going to First and Last page button
    // hideSizePerPage: true, // Hide the sizePerPage dropdown always
    // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    firstPageText: 'First',
    prePageText: 'Back',
    nextPageText: 'Next',
    lastPageText: 'Last',
    nextPageTitle: 'First page',
    prePageTitle: 'Pre page',
    firstPageTitle: 'Next page',
    lastPageTitle: 'Last page',
    showTotal: true,
    paginationTotalRenderer: customTotal,
    sizePerPageList: [{
      text: '18 moths', value: 18
      }, {
      text: '3 years', value: 36
      }, {
      text: '6 years', value: 72
      }, {
      text: 'All', value: tenThreeMerged.length
    }] // A numeric array is also available. the purpose of above example is custom the text
    };


    /************************ RETURN *************************************/
    return (
    <div>
      <p>Hello </p>

        <ToolkitProvider
          keyField="id"
          data={ tenThreeMerged }
          columns={ columns }
          columnToggle
        >
          {
            props => (
              <div>
                <ToggleList { ...props.columnToggleProps } />
                <hr />
                <BootstrapTable
                  { ...props.baseProps }
                  defaultSorted= { defaultSorted }
                  pagination={ paginationFactory(options) }
                />
              </div>
            )
          }
        </ToolkitProvider>

    </div>
  )


  }


}

export default RecessionIndicator;
