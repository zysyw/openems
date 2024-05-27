package io.openems.edge.controller.api.modbus.rtu.readonly;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

import io.openems.edge.controller.api.modbus.rtu.AbstractModbusRtuApi;

@ObjectClassDefinition(//
		name = "Controller Api Modbus/RTU Read-Only", //
		description = "This controller provides a read-only Modbus/RTU api.")
@interface Config {

	@AttributeDefinition(name = "Component-ID", description = "Unique ID of this Component")
	String id() default "ctrlApiModbusRtu0";

	@AttributeDefinition(name = "Alias", description = "Human-readable name of this Component; defaults to Component-ID")
	String alias() default "";

	@AttributeDefinition(name = "Is enabled?", description = "Is this Component enabled?")
	boolean enabled() default true;

	@AttributeDefinition(name = "Port", description = "Port on which the server should listen.")
	int port() default AbstractModbusRtuApi.DEFAULT_PORT;

	@AttributeDefinition(name = "Component-IDs", description = "Components that should be made available via Modbus.")
	String[] component_ids() default { "_sum" };

	@AttributeDefinition(name = "Max concurrent connections", description = "Sets the maximum number of concurrent connections via Modbus.")
	int maxConcurrentConnections() default AbstractModbusRtuApi.DEFAULT_MAX_CONCURRENT_CONNECTIONS;

	@AttributeDefinition(name = "Components target filter", description = "This is auto-generated by 'Component-IDs'.")
	String Component_target() default "(enabled=true)";
	
	@AttributeDefinition(name="ToDo", description = "ToDo")
	String rs485() default "modbus0";

	String webconsole_configurationFactory_nameHint() default "Controller Api Modbus/RTU Read-Only [{id}]";
}
