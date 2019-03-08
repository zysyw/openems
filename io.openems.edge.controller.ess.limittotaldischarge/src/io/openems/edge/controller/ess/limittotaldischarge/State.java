package io.openems.edge.controller.ess.limittotaldischarge;

import io.openems.edge.common.channel.doc.OptionsEnum;

public enum State implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	NORMAL(0, "Normal"), //
	MIN_SOC(1, "Min-SoC"), //
	FORCE_CHARGE_SOC(2, "Force-Charge-SoC");

	private final int value;
	private final String name;

	private State(int value, String name) {
		this.value = value;
		this.name = name;
	}

	@Override
	public int getValue() {
		return value;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public OptionsEnum getUndefined() {
		return UNDEFINED;
	}
}