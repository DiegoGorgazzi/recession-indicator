import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

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
      axios.get(nberUSrecess),
      axios.get(willshire5000),
      axios.get(vix)
      ])
        .then(axios.spread( (tenYrYldResponse, threeMthYldResponse,
          nberResponse, willshireResponse, vixResponse ) => {
            this.setState({
            tenYearInt: tenYrYldResponse.data.observations,
            threeMonthInt: threeMthYldResponse.data.observations,
            nberRecession: nberResponse.data.observations,
            willshireState: willshireResponse.data.observations,
            vixState: vixResponse.data.observations,
            });
          console.log(this.state.tenYearInt);
          console.log(this.state.threeMonthInt);
          console.log(this.state.nberRecession);
          console.log(this.state.willshireState);
          console.log(this.state.vixState);
          }
        ));
}


  render() {
    return (
    <div>
      <p>Hello </p>

    </div>
  )


  }


}

export default RecessionIndicator;
