import { JsonrpcResponseSuccess } from "../base";

export interface Cumulated {
    [channelAddress: string]: number | null
}

/**
 * Wraps a JSON-RPC Response for a queryHistoricTimeseriesEnergy.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "result": {
 *     "data": Cumulated
 *     }
 * }
 * </pre>
 */
export class QueryHistoricTimeseriesEnergyResponse extends JsonrpcResponseSuccess {

    public constructor(
        public override readonly id: string,
        public override readonly result: {
            data: Cumulated;
        },
    ) {
        super(id, result);
    }
    
    /**
     * Prints the result to the console in a formatted way.
     */
    public printResult(): void {
        console.log("QueryHistoricTimeseriesEnergyResponse:");
        console.log("ID:", this.id);

        console.log("Data:");
        for (const [channelAddress, values] of Object.entries(this.result.data)) {
            console.log(`  Channel: ${channelAddress}`);
            console.log("  Values:", values);
        }
    }
}
