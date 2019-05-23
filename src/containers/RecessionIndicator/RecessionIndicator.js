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
      ])
        .then(axios.spread( (tenYrYldResponse, threeMthYldResponse,
          nberResponse, willshireResponse, vixResponse ) => {
            this.setState({
            tenYearInt: tenYrYldResponse.data.observations,
            threeMonthInt: threeMthYldResponse.data.observations,
            });
          console.log(this.state.tenYearInt, "ten");
          console.log(this.state.threeMonthInt, "three");
          }
        ));

      axios.get(nberUSrecess).then(nberResponse => {
        this.setState({
        nberRecession: nberResponse.data.observations
        });
        console.log(this.state.nberRecession, "nber");
      });

      axios.get(willshire5000).then(willshireResponse => {
        this.setState({
        willshireState: willshireResponse.data.observations
        });
        console.log(this.state.willshireState, "willshire");
      });

      axios.get(vix).then(vixResponse => {
        this.setState({
        vixState: vixResponse.data.observations
        });
        console.log(this.state.vixState, "vix");
      });

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
