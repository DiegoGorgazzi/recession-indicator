import React, { Component } from "react";
import recessionIndicatorStyles from "./RecessionIndicator.module.css";
import axios from "axios";

//*********************** components **********************************
import Table from '../../components/Table/Table';
import {calcs} from "../../logic/logic";

//************************* react-vis *******************************
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines,
  XAxis, YAxis, VerticalBarSeries } from 'react-vis';
import 'react-vis/dist/style.css';

//******************** BootstrapTable **********************************
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

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
    vixState:[],
    tenThreeMerged:[]
  }

  componentDidMount () {
    axios.all([
      axios.get(tenYearYield),
      axios.get(threeMonthYield),
      axios.get(nberUSrecess),
      axios.get(willshire5000),
      axios.get(vix)
      ])
        .then(axios.spread(
          (tenYrYldResponse,
            threeMthYldResponse,
            nberResponse, willshireResponse, vixResponse ) => {

            this.setState({
            tenYearInt:
              filteredResponse(tenYrYldResponse.data.observations, "10-yr-yields"),
            threeMonthInt:
              filteredResponse(threeMthYldResponse.data.observations, "3-month-yields"),
            nberRecession:
              filteredResponse(nberResponse.data.observations, "US-recession"),
            willshireState:
              filteredResponse(willshireResponse.data.observations, "Whillshire-5000"),
            vixState:
              filteredResponse(vixResponse.data.observations, "Vix")
            });

          console.log(this.state.tenYearInt, "ten");
          console.log(this.state.threeMonthInt, "three");
          console.log(this.state.nberRecession, "nber");
          //console.log(this.state.willshireState, "willshire");
          //console.log(this.state.vixState, "vix");
          }
        ));

      }

      componentDidUpdate(previousProps, previousState, snapshot) {
        if(previousState.tenThreeMerged.length === 0) {
          this.setState({
            tenThreeMerged: calcs(this.state.tenYearInt, this.state.threeMonthInt, this.state.nberRecession )
          });
        }

      }

  render() {

    const data1 = [
      {x: 0, y: 8},
      {x: 1, y: 5},
      {x: 2, y: 4},
      {x: 3, y: 9},
      {x: 4, y: 1},
      {x: 5, y: 7},
      {x: 6, y: 6},
      {x: 7, y: 3},
      {x: 8, y: 2},
      {x: 9, y: 0}
    ];

    const data2 = [
      {x: 0, y: 10},
      {x: 1, y: 5},
      {x: 2, y: 7},
      {x: 3, y: 11},
      {x: 4, y: 3},
      {x: 5, y: 4},
      {x: 6, y: 5},
      {x: 7, y: 6},
      {x: 8, y: 2},
      {x: 9, y: 1}
    ];

    return (
    <div>
      <p>Hello </p>

      <div>
        <XYPlot height={350} width={600}
          colorType="linear"
          colorDomain={[0, 1]}
          colorRange={["white", "black"]}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <VerticalBarSeries data={data2} color="#ff9999" stroke="#f70"/>
          <LineSeries data={data1} color={0.75}/>
       </XYPlot>
     </div>

        <Table data={this.state.tenThreeMerged}/>

    </div>
    )

  }

}

export default RecessionIndicator;
