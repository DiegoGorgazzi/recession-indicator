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

    //helper function to filter only Date and Value
    const filteredResponse = (toBeFiltered) => {
      const mapFilter = toBeFiltered.map((eachObject) => {
          const date = eachObject.date;
          const value = eachObject.value;
          const filteredObject = {date, value};
          return filteredObject;
      });
    return mapFilter;
    }

    axios.all([
      axios.get(tenYearYield),
      axios.get(threeMonthYield),
      ])
        .then(axios.spread( (tenYrYldResponse, threeMthYldResponse ) => {
          //const filtered10yr = filteredResponse(tenYrYldResponse.data.observations);
          //const filtered3mo = filteredResponse(threeMthYldResponse.data.observations);

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



    return (
    <div>
      <p>Hello </p>

    </div>
  )


  }


}

export default RecessionIndicator;
