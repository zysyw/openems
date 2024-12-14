package io.openems.edge.meter.virtual.subtract;

import java.util.List;
import java.util.function.Consumer;

import io.openems.edge.common.channel.AbstractChannelListenerManager;
import io.openems.edge.common.channel.IntegerReadChannel;
import io.openems.edge.common.channel.LongReadChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.type.TypeUtils;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.meter.api.ElectricityMeter;

public class SubtractChannelManager extends AbstractChannelListenerManager {

    private final VirtualSubtractMeter parent;

    public SubtractChannelManager(VirtualSubtractMeter parent) {
        this.parent = parent;
    }

    /**
     * Called on Component activate().
     *
     * @param minuends    the Minuend Components
     * @param subtrahends the Subtrahend Components
     */
    protected void activate(List<OpenemsComponent> minuends, List<OpenemsComponent> subtrahends) {
        // Validate Minuends
    	if (minuends != null && !minuends.isEmpty()) {
	        for (OpenemsComponent minuend : minuends) {
	            if (minuend instanceof ElectricityMeter || minuend instanceof SymmetricEss) {
	                // OK
	            } else {
	                throw new IllegalArgumentException("Minuend [" + minuend.id() + "] is neither a Meter nor an ESS");
	            }
	        }
    	}

        // Validate Subtrahends
        for (OpenemsComponent subtrahend : subtrahends) {
            if (subtrahend instanceof ElectricityMeter || subtrahend instanceof SymmetricEss) {
                // OK
            } else {
                throw new IllegalArgumentException("Subtrahend [" + subtrahend.id() + "] is neither a Meter nor an ESS");
            }
        }

        this.activateSubtractInteger(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_POWER,
                SymmetricEss.ChannelId.ACTIVE_POWER);
        this.activateSubtractInteger(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_POWER_L1,
                SymmetricEss.ChannelId.ACTIVE_POWER);
        this.activateSubtractInteger(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_POWER_L2,
                SymmetricEss.ChannelId.ACTIVE_POWER);
        this.activateSubtractInteger(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_POWER_L3,
                SymmetricEss.ChannelId.ACTIVE_POWER);

        this.activateSubtractInteger(minuends, subtrahends, ElectricityMeter.ChannelId.REACTIVE_POWER,
                SymmetricEss.ChannelId.REACTIVE_POWER);
        this.activateSubtractInteger(minuends, subtrahends, ElectricityMeter.ChannelId.REACTIVE_POWER_L1,
                SymmetricEss.ChannelId.REACTIVE_POWER);
        this.activateSubtractInteger(minuends, subtrahends, ElectricityMeter.ChannelId.REACTIVE_POWER_L2,
                SymmetricEss.ChannelId.REACTIVE_POWER);
        this.activateSubtractInteger(minuends, subtrahends, ElectricityMeter.ChannelId.REACTIVE_POWER_L3,
                SymmetricEss.ChannelId.REACTIVE_POWER);

        this.activateSubtractLong(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_CONSUMPTION_ENERGY,
                SymmetricEss.ChannelId.ACTIVE_CHARGE_ENERGY);
        this.activateSubtractLong(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_CONSUMPTION_ENERGY_L1,
                SymmetricEss.ChannelId.ACTIVE_CHARGE_ENERGY);
        this.activateSubtractLong(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_CONSUMPTION_ENERGY_L2,
                SymmetricEss.ChannelId.ACTIVE_CHARGE_ENERGY);
        this.activateSubtractLong(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_CONSUMPTION_ENERGY_L3,
                SymmetricEss.ChannelId.ACTIVE_CHARGE_ENERGY);

        this.activateSubtractLong(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_PRODUCTION_ENERGY,
                SymmetricEss.ChannelId.ACTIVE_DISCHARGE_ENERGY);
        this.activateSubtractLong(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_PRODUCTION_ENERGY_L1,
                SymmetricEss.ChannelId.ACTIVE_DISCHARGE_ENERGY);
        this.activateSubtractLong(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_PRODUCTION_ENERGY_L2,
                SymmetricEss.ChannelId.ACTIVE_DISCHARGE_ENERGY);
        this.activateSubtractLong(minuends, subtrahends, ElectricityMeter.ChannelId.ACTIVE_PRODUCTION_ENERGY_L3,
                SymmetricEss.ChannelId.ACTIVE_DISCHARGE_ENERGY);
    }

    private void activateSubtractInteger(List<OpenemsComponent> minuends, List<OpenemsComponent> subtrahends,
                                         ElectricityMeter.ChannelId meterChannelId, SymmetricEss.ChannelId essChannelId) {
        final Consumer<Value<Integer>> callback = (ignore) -> {
            // Calculate Minuends Sum
            Integer minuendsSum = null;
            for (OpenemsComponent minuend : minuends) {
                if (minuend instanceof ElectricityMeter meter) {
                    IntegerReadChannel channel = meter.channel(meterChannelId);
                    minuendsSum = TypeUtils.sum(minuendsSum, channel.getNextValue().get());
                } else if (minuend instanceof SymmetricEss) {
                    IntegerReadChannel channel = ((SymmetricEss) minuend).channel(essChannelId);
                    Integer value = channel.getNextValue().get();
                    if (meterChannelId.name().contains("_L")) {
                        value = value / 3; // Divide by 3 for phase-specific power
                    }
                    minuendsSum = TypeUtils.sum(minuendsSum, value);
                }
            }

            // Calculate Subtrahends Sum
            Integer subtrahendsSum = null;
            for (OpenemsComponent subtrahend : subtrahends) {
                if (subtrahend instanceof ElectricityMeter meter) {
                    IntegerReadChannel channel = meter.channel(meterChannelId);
                    subtrahendsSum = TypeUtils.sum(subtrahendsSum, channel.getNextValue().get());
                } else if (subtrahend instanceof SymmetricEss) {
                    IntegerReadChannel channel = ((SymmetricEss) subtrahend).channel(essChannelId);
                    Integer value = channel.getNextValue().get();
                    if (meterChannelId.name().contains("_L")) {
                        value = value / 3; // Divide by 3 for phase-specific power
                    }
                    subtrahendsSum = TypeUtils.sum(subtrahendsSum, value);
                }
            }

            // Calculate Result
            final Integer result = TypeUtils.subtract(minuendsSum, subtrahendsSum);

            // Update Channel
            IntegerReadChannel channel = this.parent.channel(meterChannelId);
            channel.setNextValue(result);
        };

        // Add Listeners for Minuends
        for (OpenemsComponent minuend : minuends) {
            if (minuend instanceof ElectricityMeter) {
                this.addOnSetNextValueListener(minuend, meterChannelId, callback);
            } else if (minuend instanceof SymmetricEss) {
                this.addOnSetNextValueListener(minuend, essChannelId, callback);
            }
        }

        // Add Listeners for Subtrahends
        for (OpenemsComponent subtrahend : subtrahends) {
            if (subtrahend instanceof ElectricityMeter) {
                this.addOnSetNextValueListener(subtrahend, meterChannelId, callback);
            } else if (subtrahend instanceof SymmetricEss) {
                this.addOnSetNextValueListener(subtrahend, essChannelId, callback);
            }
        }
    }

    private void activateSubtractLong(List<OpenemsComponent> minuends, List<OpenemsComponent> subtrahends,
                                      ElectricityMeter.ChannelId meterChannelId, SymmetricEss.ChannelId essChannelId) {
        final Consumer<Value<Long>> callback = (ignore) -> {
            // Calculate Minuends Sum
            Long minuendsSum = null;
            for (OpenemsComponent minuend : minuends) {
                if (minuend instanceof ElectricityMeter meter) {
                    LongReadChannel channel = meter.channel(meterChannelId);
                    minuendsSum = TypeUtils.sum(minuendsSum, channel.getNextValue().get());
                } else if (minuend instanceof SymmetricEss) {
                    LongReadChannel channel = ((SymmetricEss) minuend).channel(essChannelId);
                    Long value = channel.getNextValue().get();
                    if (meterChannelId.name().contains("_L")) {
                        value = value / 3; // Divide by 3 for phase-specific power
                    }
                    minuendsSum = TypeUtils.sum(minuendsSum, value);
                }
            }

            // Calculate Subtrahends Sum
            Long subtrahendsSum = null;
            for (OpenemsComponent subtrahend : subtrahends) {
                if (subtrahend instanceof ElectricityMeter meter) {
                    LongReadChannel channel = meter.channel(meterChannelId);
                    subtrahendsSum = TypeUtils.sum(subtrahendsSum, channel.getNextValue().get());
                } else if (subtrahend instanceof SymmetricEss) {
                    LongReadChannel channel = ((SymmetricEss) subtrahend).channel(essChannelId);
                    Long value = channel.getNextValue().get();
                    if (meterChannelId.name().contains("_L")) {
                        value = value / 3; // Divide by 3 for phase-specific power
                    }
                    subtrahendsSum = TypeUtils.sum(subtrahendsSum, value);
                }
            }

            // Calculate Result
            final Long result = TypeUtils.subtract(minuendsSum, subtrahendsSum);

            // Update Channel
            LongReadChannel channel = this.parent.channel(meterChannelId);
            channel.setNextValue(result);
        };

        // Add Listeners for Minuends
        for (OpenemsComponent minuend : minuends) {
            if (minuend instanceof ElectricityMeter) {
                this.addOnSetNextValueListener(minuend, meterChannelId, callback);
            } else if (minuend instanceof SymmetricEss) {
                this.addOnSetNextValueListener(minuend, essChannelId, callback);
            }
        }

        // Add Listeners for Subtrahends
        for (OpenemsComponent subtrahend : subtrahends) {
            if (subtrahend instanceof ElectricityMeter) {
                this.addOnSetNextValueListener(subtrahend, meterChannelId, callback);
            } else if (subtrahend instanceof SymmetricEss) {
                this.addOnSetNextValueListener(subtrahend, essChannelId, callback);
            }
        }
    }
}
