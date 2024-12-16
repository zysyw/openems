package io.openems.edge.simulator.datasource.csv.predefined;

public enum Source {
	ZERO("zero.csv"), //
	H0_HOUSEHOLD_SUMMER_WEEKDAY_STANDARD_LOAD_PROFILE("h0-summer-weekday-standard-load-profile.csv"), //
	H0_HOUSEHOLD_SUMMER_WEEKDAY_PV_PRODUCTION("h0-summer-weekday-pv-production.csv"), //
	H0_HOUSEHOLD_SUMMER_WEEKDAY_NON_REGULATED_CONSUMPTION("h0-summer-weekday-non-regulated-consumption.csv"), //
	L411("411.csv"), //
	L412("412.csv"), //
	L413("413.csv"), //
	L421("421.csv"), //
	L422("422.csv"), //
	L431("431.csv"), //
	L441("441.csv"), //
	L442("442.csv"), //
	L451("451.csv"), //
	L452("452.csv"), //
	L4611("4611.csv"), //
	L4612("4612.csv"), //
	L462("462.csv"), //
	L471("471.csv"), //
	L472("472.csv"), //
	H0_HOUSEHOLD_SUMMER_WEEKDAY_PV_PRODUCTION2("h0-summer-weekday-pv-production2.csv");

	public final String filename;

	private Source(String filename) {
		this.filename = filename;
	}
}
