package io.openems.edge.simulator.predictor;

import io.openems.common.test.AbstractComponentConfig;
import io.openems.common.utils.ConfigUtils;
import io.openems.edge.predictor.api.prediction.LogVerbosity;

@SuppressWarnings("all")
public class MyConfig extends AbstractComponentConfig implements Config {

	protected static class Builder {
		private String id;
		private String datasourceId;
		private String[] channelAddresses;
		private LogVerbosity logVerbosity;

		private Builder() {
		}

		public Builder setId(String id) {
			this.id = id;
			return this;
		}

		public Builder setDatasourceId(String datasourceId) {
			this.datasourceId = datasourceId;
			return this;
		}

		public Builder setChannelAddresses(String... channelAddresses) {
			this.channelAddresses = channelAddresses;
			return this;
		}

		public Builder setLogVerbosity(LogVerbosity logVerbosity) {
			this.logVerbosity = logVerbosity;
			return this;
		}

		public MyConfig build() {
			return new MyConfig(this);
		}
	}

	/**
	 * Create a Config builder.
	 *
	 * @return a {@link Builder}
	 */
	public static Builder create() {
		return new Builder();
	}

	private final Builder builder;

	private MyConfig(Builder builder) {
		super(Config.class, builder.id);
		this.builder = builder;
	}

	@Override
	public String[] channelAddresses() {
		return this.builder.channelAddresses;
	}

	@Override
	public String datasource_id() {
		return this.builder.datasourceId;
	}

	@Override
	public String datasource_target() {
		return ConfigUtils.generateReferenceTargetFilter(this.id(), this.datasource_id());
	}

	@Override
	public LogVerbosity logVerbosity() {
		return this.builder.logVerbosity;
	}

}