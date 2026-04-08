"use client";

import { SunLight } from "./SunLight";
import { Rain } from "./Rain";
import { Snow } from "./Snow";
import { Leaves } from "./Leaves";

export function WeatherOverlay({ month }: { month: number }) {
  // 0 = Jan, 1 = Feb, 2 = Mar, 3 = Apr, 4 = May, 5 = Jun
  // 6 = Jul, 7 = Aug, 8 = Sep, 9 = Oct, 10 = Nov, 11 = Dec

  // Winter: December, January, February -> Snow
  if ([11, 0, 1].includes(month)) return <Snow />;
  
  // Spring: March, April, May -> Rain
  if ([2, 3, 4].includes(month)) return <Rain />;
  
  // Summer: June, July, August -> SunLight
  if ([5, 6, 7].includes(month)) return <SunLight />;
  
  // Autumn: September, October, November -> Leaves
  if ([8, 9, 10].includes(month)) return <Leaves />;

  return null;
}