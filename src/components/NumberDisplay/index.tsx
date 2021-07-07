import React from "react";
import "./NumberDisplay.scss";

interface NumberDisplaryProps {
    value: number;

}
const NumberDisplay: React.FC <NumberDisplaryProps> = ({value}) => {
    return <div className="NumberDisplay">{value.toString().padStart(3,"0")}</div>
}

export default NumberDisplay;
