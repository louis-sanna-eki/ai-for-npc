import React, { useState } from 'react';
import { Slider } from '@material-ui/core';

function MySlider() {
  const [value, setValue] = useState<number>(30);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  return (
    <div>
      <Slider
        value={value}
        onChange={handleChange}
        min={0}
        max={100}
        step={20}
        marks
      />
    </div>
  );
}

export default MySlider;
