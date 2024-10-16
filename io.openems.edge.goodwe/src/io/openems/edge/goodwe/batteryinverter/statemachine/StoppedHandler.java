package io.openems.edge.goodwe.batteryinverter.statemachine;

import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.goodwe.batteryinverter.statemachine.StateMachine.State;

public class StoppedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var battery = context.getParent();
		battery._setStartStop(StartStop.STOP);
		return State.STOPPED;
	}
}
