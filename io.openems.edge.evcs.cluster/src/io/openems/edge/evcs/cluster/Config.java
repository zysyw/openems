package io.openems.edge.evcs.cluster;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(//
		name = "EVCS Cluster Peak Shaving", //
		description = "Limits the maximum charging power of all electric vehicle charging stations "
				+ "depending on the ecxess power, the maximum allowed discharge of the storage and the maximum allowed grid input power.")
@interface Config {

	@AttributeDefinition(name = "Component-ID", description = "Unique ID of this Component")
	String id() default "evcsCluster0";

	@AttributeDefinition(name = "Alias", description = "Human-readable name of this Component; defaults to Component-ID")
	String alias() default "";

	@AttributeDefinition(name = "Is enabled?", description = "Is this Component enabled?")
	boolean enabled() default true;

	@AttributeDefinition(name = "Debug Mode", description = "Activates the debug mode")
	boolean debugMode() default false;

	@AttributeDefinition(name = "Hardware current limit per phase", description = "The maximum power in Watt that can be used by one phase of the cable (For all EVCSs).", required = true)
	int hardwarePowerLimitPerPhase() default 7000;

	@AttributeDefinition(name = "Evcs-IDs", description = "IDs of EVCS devices ordered by the priority. "
			+ "(Only Managed Evcss will be considered because their charging power can be adjusted)")
	String[] evcs_ids() default { "evcs0", "evcs1" };

	@AttributeDefinition(name = "Evcs target filter", description = "This is auto-generated by 'Evcs-IDs'.")
	String Evcs_target() default "(enabled=true)";

	@AttributeDefinition(name = "Ess-ID", description = "ID of Ess device. 'NONE' for no ESS")
	String ess_id() default "ess0";

	@AttributeDefinition(name = "Grid-Meter-ID", description = "ID of the Grid-Meter.")
	String meter_id() default "meter0";

	String webconsole_configurationFactory_nameHint() default "EVCS Cluster Peak Shaving[{id}]";

}
