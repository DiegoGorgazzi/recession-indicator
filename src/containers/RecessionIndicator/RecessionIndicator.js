import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

//******************** BootstrapTable **********************************
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { ColumnToggle } from 'react-bootstrap-table2-toolkit';

//*********************** helperFunctions ******************************
import {filteredResponse} from "../../shared/helperFunctions/helperFunctions";

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
    //helper function to merge two sets of data.
    //We need to merge data because react-bootstrap-table requires each column
    //to be part of the same data set. It will also be easier to
    //graph data if they both have same starting date.
    const mergedResponse = (mainToBeMerged, additionalArr, name) => {
      //Since data sets have different starting dates, we need to
      //check to see which is the longest array to map through
          if(mainToBeMerged.length > additionalArr.length) {
            return mainToBeMerged.map((eachObject, index) => {
              const date = eachObject.date;
              const value = eachObject.value;
              const id = name + index;
              const valueAdd= additionalArr[index].value
              const mergedObject = {id, date, value, valueAdd};
              return mergedObject;
              }
            );
          } else {
              return additionalArr.map((eachObject, index) => {
                const date = additionalArr[index].date;
                let value;
                //the shorter data set needs to start index count only
                //when the dates of both data sets match.
                //So while the length of the longer array is longer
                //than the length of the shorter array, the value will be zero.
                  if(index < (additionalArr.length - mainToBeMerged.length) ) {
                    value = 0;
                  } else {
                    value =
                    //since we need to start at mainToBeMerged[0], we need to subtract
                    //the difference in length in both arrays from the index count.
                    mainToBeMerged[index-(additionalArr.length - mainToBeMerged.length)]
                    .value;
                  }
                const id = name + index;
                const valueAdd= eachObject.value;
                const mergedObject = {id, date, value, valueAdd};
                return mergedObject;
              }
            );
          }
        };

    const tenThreeMerged = mergedResponse(this.state.tenYearInt, this.state.threeMonthInt, "merged");
    console.log(tenThreeMerged, "merged");

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
    }
  ];

    const defaultSorted = [{
    dataField: 'date',
    order: 'desc'
    }];

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
                  pagination={ paginationFactory() }
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
