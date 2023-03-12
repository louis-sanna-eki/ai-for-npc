import React, { useState } from "react";
import { Slider } from "@material-ui/core";

function MySlider({ marks }: { marks: { value: string, label: string }[] }) {
  const max = marks.length - 1

  const valueLabelFormat = (value: number) => {
    return marks[value]?.label ?? '';
  }

  return (
    <div>
      <Slider
        onChange={console.log}
        min={0}
        max={max}
        step={1}
        getAriaValueText={valueLabelFormat}
        marks
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat}
      />
    </div>
  );
}

export default MySlider;
