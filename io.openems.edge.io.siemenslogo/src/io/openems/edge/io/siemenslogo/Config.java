package io.openems.edge.io.siemenslogo;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(//
		name = "Siemens Logo 8 Output Relay ", //
		description = "Siemens Logo! 8 as Relais-Board")
@interface Config {

	@AttributeDefinition(name = "Component-ID", description = "Unique ID of this Component")
	String id() default "io.openems.edge.io.siemenslogo0";

	@AttributeDefinition(name = "Alias", description = "Human-readable name of this Component; defaults to Component-ID")
	String alias() default "";

	@AttributeDefinition(name = "Is enabled?", description = "Is this Component enabled?")
	boolean enabled() default true;

	@AttributeDefinition(name = "Modbus-ID", description = "ID of Modbus bridge.")
	String modbus_id() default "modbus0";

	@AttributeDefinition(name = "Modbus Unit-ID", description = "The Unit-ID of the Modbus device.")
	int modbusUnitId() default 0;

	@AttributeDefinition(name = "Modbus target filter", description = "This is auto-generated by 'Modbus-ID'.")
	String Modbus_target() default "(enabled=true)";

	String webconsole_configurationFactory_nameHint() default "io.openems.edge.io.siemenslogo [{id}]";

}