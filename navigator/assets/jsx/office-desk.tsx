import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const OfficeDeskIcon = (props: SvgProps) => (
  <Svg width={800} height={800} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      stroke="#71717A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M1 22v-9.5a.5.5 0 0 1 .5-.5h21a.5.5 0 0 1 .5.5v2M18 12V9.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2"
    />
    <Path
      stroke="#71717A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13 15v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-7M13 18h10M1 15h22M11.75 2h-7.5C3.56 2 3 2.537 3 3.2v4.6C3 8.463 3.56 9 4.25 9h7.5C12.44 9 13 8.463 13 7.8V3.2c0-.663-.56-1.2-1.25-1.2ZM8 9v3"
    />
  </Svg>
);
export default OfficeDeskIcon;
