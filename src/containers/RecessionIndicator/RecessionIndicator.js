import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';

import {filteredResponse} from "../../shared/helperFunctions/helperFunctions";

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
            tenYearInt: filteredResponse(tenYrYldResponse.data.observations),
            threeMonthInt: filteredResponse(threeMthYldResponse.data.observations),
            });

          console.log(this.state.tenYearInt, "ten");
          console.log(this.state.threeMonthInt, "three");
          }
        ));

      axios.get(nberUSrecess).then(nberResponse => {
        this.setState({
          nberRecession: filteredResponse(nberResponse.data.observations)
        });
        console.log(this.state.nberRecession, "nber");
      });

      axios.get(willshire5000).then(willshireResponse => {
        this.setState({
          willshireState: filteredResponse(willshireResponse.data.observations)
        });
        console.log(this.state.willshireState, "willshire");
      });

      axios.get(vix).then(vixResponse => {
        this.setState({
          vixState: filteredResponse(vixResponse.data.observations)
        });
        console.log(this.state.vixState, "vix");
      });

}

  render() {
    const columns = [{
      dataField: 'date',
      text: 'Date'
    }, {
      dataField: 'value',
      text: 'Yield'
    }];


    return (
    <div>
      <p>Hello </p>
      <BootstrapTable
        key="1"
        keyField='ten-yr-yields'
        data={ this.state.tenYearInt }
        columns={ columns }
        bootstrap4 = { true }
        bordered = {true}

        />

    </div>
  )


  }


}

export default RecessionIndicator;
