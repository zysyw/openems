import { NgModule } from "@angular/core";
import { Common_Autarchy } from "./autarchy/Autarchy";
import { Common_Consumption } from "./consumption/Consumption";
import { CommonEnergyMonitor } from "./energy/energy";
import { Common_Grid } from "./grid/grid";
import { Common_Production } from "./production/production";
import { Common_Selfconsumption } from "./selfconsumption/SelfConsumption";
import { Common_EnergyEfficiency } from "./energyefficiency/EnergyEfficiency";
import { Common_CarbonEmissionIntensity } from "./carbonemissionintensity/EnergyEfficiency";

@NgModule({
  imports: [
    Common_Autarchy,
    Common_Consumption,
    CommonEnergyMonitor,
    Common_Grid,
    Common_Production,
    Common_Selfconsumption,
    Common_EnergyEfficiency,
    Common_CarbonEmissionIntensity,
  ],
  exports: [
    Common_Autarchy,
    Common_Consumption,
    CommonEnergyMonitor,
    Common_Grid,
    Common_Production,
    Common_Selfconsumption,
    Common_EnergyEfficiency,
    Common_CarbonEmissionIntensity,
  ],
})
export class Common { }
