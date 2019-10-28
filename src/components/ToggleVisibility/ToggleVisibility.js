import React from "react";
import ToggleVisibilityStyles from "./ToggleVisibility.module.css";

const toggleVisibility = props => {
  if (props.whatState) {
    return (
      <div className={ToggleVisibilityStyles.showMore}>
        <span id={props.hideID} onClick={props.hideOnClick}>
          {props.showText}
          <span
            className={ToggleVisibilityStyles.showMoreArrowDown}
            id={props.hideID}
            onClick={props.hideOnClick}
          >
            &#8964;
          </span>
        </span>
      </div>
    );
  } else {
    return (
      <div className={ToggleVisibilityStyles.showMore}>
        <span id={props.hideID} onClick={props.hideOnClick}>
          <span
            className={ToggleVisibilityStyles.showMoreArrowUp}
            id={props.hideID}
            onClick={props.hideOnClick}
          >
            &#8963;
          </span>
          {props.hideText}
        </span>
      </div>
    );
  }
};

export default toggleVisibility;
