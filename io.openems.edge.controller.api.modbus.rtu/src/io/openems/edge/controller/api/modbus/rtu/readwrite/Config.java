package io.openems.edge.controller.api.modbus.rtu.readwrite;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;
import io.openems.edge.controller.api.modbus.rtu.AbstractModbusRtuApi;

@ObjectClassDefinition(//
		name = "Controller Api Modbus/RTU Read-Write", //
		description = "This controller provides a read-write Modbus/RTU api.")
@interface Config {

	@AttributeDefinition(name = "Component-ID", description = "Unique ID of this Component")
	String id() default "ctrlApiModbusRtu0";

	@AttributeDefinition(name = "Alias", description = "Human-readable name of this Component; defaults to Component-ID")
	String alias() default "ModbusRTU read-write";

	@AttributeDefinition(name = "Is enabled?", description = "Is this Component enabled?")
	boolean enabled() default true;

	@AttributeDefinition(name = "Port-Name", description = "The name of the serial port - e.g. '/dev/ttyUSB0' or 'COM3'")
	String portName() default "/dev/ttyUSB0";

	@AttributeDefinition(name = "Component-IDs", description = "Components that should be made available via Modbus.")
	String[] component_ids() default { "_sum" };

	@AttributeDefinition(name = "Api-Timeout", description = "Sets the timeout in seconds for updates on Channels set by this Api.")
	int apiTimeout() default 60;

	@AttributeDefinition(name = "Max concurrent connections", description = "Sets the maximum number of concurrent connections via Modbus.")
	int maxConcurrentConnections() default AbstractModbusRtuApi.DEFAULT_MAX_CONCURRENT_CONNECTIONS;
	
	@AttributeDefinition(name = "Components target filter", description = "This is auto-generated by 'Component-IDs'.")
	String Component_target() default "(enabled=true)";

	String webconsole_configurationFactory_nameHint() default "Controller Api Modbus/TCP Read-Write [{id}]";
}