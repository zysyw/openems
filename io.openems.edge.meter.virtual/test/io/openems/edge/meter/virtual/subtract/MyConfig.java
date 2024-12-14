package io.openems.edge.meter.virtual.subtract;

import io.openems.common.test.AbstractComponentConfig;
import io.openems.common.types.MeterType;
import io.openems.common.utils.ConfigUtils;

@SuppressWarnings("all")
public class MyConfig extends AbstractComponentConfig implements Config {

	protected static class Builder {
		private String id;
		private MeterType type;
		private boolean addToSum;
		private String[] minuendsIds;
		private String[] subtrahendsIds;

		private Builder() {
		}

		public Builder setId(String id) {
			this.id = id;
			return this;
		}

		public Builder setType(MeterType type) {
			this.type = type;
			return this;
		}

		public Builder setAddToSum(boolean addToSum) {
			this.addToSum = addToSum;
			return this;
		}

		public Builder setMinuendsIds(String... minuendsIds) {
            this.minuendsIds = minuendsIds;
            return this;
        }

		public Builder setSubtrahendsIds(String... subtrahendsIds) {
			this.subtrahendsIds = subtrahendsIds;
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
	public MeterType type() {
		return this.builder.type;
	}

	@Override
	public boolean addToSum() {
		return this.builder.addToSum;
	}

	@Override
	public String[] minuends_ids() {
        return this.builder.minuendsIds;
    }

	@Override
	public String[] subtrahends_ids() {
		return this.builder.subtrahendsIds;
	}

	@Override
	public String minuends_target() {
		return ConfigUtils.generateReferenceTargetFilter(this.id(), this.minuends_ids());
	}

	@Override
	public String subtrahends_target() {
		return ConfigUtils.generateReferenceTargetFilter(this.id(), this.subtrahends_ids());
	}

}