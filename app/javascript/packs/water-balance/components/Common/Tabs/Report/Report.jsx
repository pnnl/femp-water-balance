import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import WarningIcon from '@material-ui/icons/Warning';
import Table2 from './Table2';
import Table1 from './Table1';
import selectn from 'selectn';

const toNumber = value => {
	if (value === undefined || value === null) {
		return 0;
	}
	return parseFloat(value.toString().replace(/,/g, ''));
};

const style = {
	color: '#2196f3',
};

const WaterUse = {};

class Report extends React.Component {
	ScenarioOne = waterUse => {
		return (
			<Fragment>
				<Typography variant='body2' gutterBottom>
					Here are your water balance results of the data you’ve entered:
				</Typography>
				<br />
				<br />
				<Table1 values={waterUse} /> <br /> <br /> <br />
				<Typography variant='body2' gutterBottom>
					The water balance results shown here provide you the annual water use for each
					end-use and amount of "<b>unknown</b>
					" water use. This unknown water use is the difference between the total water
					supplied to the campus and the sum of the end-uses. This unknown component may
					be a result of inaccurate data entered in the tool, accounting errors in the
					water supply data, or water leaks. <br />
					<br />
					<b>If your unknown is greater than 20% in the pie chart, you may want to:</b>
					<br />
					<ul>
						<li>
							Revisit the inputs you’ve entered in the tool to make sure they are
							reasonable estimates of actual water use. Look for entries that make a
							big impact on the water use such as the number of occupants, number of
							loads, and number of meals.
						</li>

						<li>
							Check your water supply data to make sure you’ve entered the correct
							units.
						</li>
						<li>
							Check your units. Have you entered any data that may be in the wrong
							units?
						</li>
					</ul>
					<br />
					After checking your end-use inputs and water supply data and you still have a
					large unknown portion, your campus may potentially have a high leak rate in the
					distribution system. Performing a leak detection survey is a sound recommended
					next step. Go to FEMP's Best Management Practice (BMP) on &nbsp;
					<a
						style={style}
						href='https://www.energy.gov/eere/femp/best-management-practice-3-distribution-system-audits-leak-detection-and-repair'
					>
						Distribution System Leak Detection and Repair
					</a>
					&nbsp; to get information on getting started.
					<br />
					<br />
					<b>What else is the data telling you? </b>
					<br />
					<br />
					Which end-uses represent the majority of your water use? Is there one or two
					end-uses that represent the lion share of the consumption? Use these results to
					help focus water conservation and efficiency efforts. For example if plumbing
					reveals the biggest water consumer, focus on high efficiency fixture
					replacement. Go to &nbsp;
					<a
						style={style}
						href='https://www.energy.gov/eere/femp/best-management-practices-water-efficiency'
					>
						FEMP BMPs
					</a>
					&nbsp; for a starting place on reducing water use for a variety of water using
					equipment.
					<br />
					<br />
					<b>Where to get more information: </b>
					<br />
					<br />
					<a
						style={style}
						href='https://www.energy.gov/eere/femp/best-management-practice-1-water-management-planning'
					>
						Water Management Planning
					</a>
					<br />
					<a
						style={style}
						href='https://www.energy.gov/eere/femp/prioritizing-building-water-meter-applications'
					>
						Water Metering
					</a>
					<br />
					<a
						style={style}
						href='https://www.energy.gov/eere/femp/water-efficient-technology-opportunities'
					>
						Water Efficient Technologies
					</a>
					<br />
					<a
						style={style}
						href='https://www.energy.gov/eere/femp/alternative-water-sources-maps'
					>
						Alternative Water
					</a>
					<br />
				</Typography>
			</Fragment>
		);
	};

	ScenarioTwo = waterUse => {
		return (
			<Fragment>
				<Typography variant='body2' gutterBottom>
                    <WarningIcon style={{color: '#F8A000', margin: '15px 7px -5px 11px'}} />
					Looks like there may be a problem with your water balance. The sum of the water
					end-uses is greater than the total water supplied to your campus.
				</Typography>
				<br />
				<br />
				<Table2 values={waterUse} /> <br /> <br /> <br />
				<Typography variant='body2' gutterBottom>
					Please revisit your data entries. Here are some tips that may help: <br />
					<ul>
						<li>
							Check to make sure you entered the total annual potable water supply in
							the Water Supply tab
						</li>

						<li>
							Look for entries that make a big impact on the water use such as the
							number of occupants, number of loads, and number of meals. Have any of
							these entries been overestimated? Start with the end-uses that are the
							biggest consumers.
						</li>
						<li>
							Check your units. Have you entered any data that may be in the wrong
							units?
						</li>
						<li>
							If you have a master meter that measures the total water supplied to the
							campus, has it been calibrated recently? Your total water supply may be
							underestimated if the meter is out of calibration. Contact your water
							utility to see if they can provide you a calibration report.
						</li>
						<li>
							Once you’ve revised entries, rerun the tool and see if the water balance
							has improved.
						</li>
					</ul>
				</Typography>
			</Fragment>
		);
	};

	createWaterUse = (key, name, water) => {
		WaterUse[key] = {};
		WaterUse[key]['name'] = name;
		WaterUse[key]['water'] = water;
	};

	addPercent = total => {
		Object.keys(WaterUse).map(key => {
			if (key != 'waterSupply') {
				let percent = (WaterUse[key].water / total) * 100;
				let roundTotal = Math.round(percent * 10) / 10;
				WaterUse[key].percent = roundTotal;
			}
		});
	};

	scenario = values => {
		let scenario = null;
		let keys = [
			'waterSupply',
			'kitchen',
			'vehicle',
			'other',
			'steam',
			'plumbing',
			'laundry',
			'tower',
			'irrigation',
		];

		let lables = [
			'Total Water Supply',
			'Commercial Kitchen',
			'Vehicle Wash',
			'Other Processes',
			'Steam Boilers',
			'Plumbing',
			'Laundry',
			'Cooling Towers',
			'Irrigation',
		];

		let waterUse = [
			toNumber(selectn('modules.water_supply.potable_water')(values)),
			toNumber(selectn('modules.kitchen_facilities.water_use')(values)),
			toNumber(selectn('modules.vehicle_wash.vehicle_wash.water_use')(values)),
			toNumber(selectn('modules.other_processes.other_processes.water_use')(values)),
			toNumber(selectn('modules.steam_boilers.water_use')(values)),
			toNumber(selectn('modules.plumbing.plumbing.water_usage')(values)),
			toNumber(selectn('modules.laundry.laundry.water_usage')(values)),
			toNumber(selectn('modules.cooling_towers.water_use')(values)),
			toNumber(selectn('modules.irrigation.water_use')(values)),
		];

		for (let i = 0; i < keys.length; i++) {
			this.createWaterUse(keys[i], lables[i], waterUse[i]);
		}

		let total =
			WaterUse.kitchen.water +
			WaterUse.vehicle.water +
			WaterUse.other.water +
			WaterUse.steam.water +
			WaterUse.plumbing.water +
			WaterUse.tower.water +
			WaterUse.laundry.water +
			WaterUse.irrigation.water;

		if (total < WaterUse.waterSupply.water) {
			scenario = 1;
			let unknown = WaterUse.waterSupply.water - total;
			let roundUnknown = Math.round(unknown * 10) / 10;
			WaterUse.unknown = {
				water: roundUnknown,
				name: 'Unknown',
			};
			this.addPercent(WaterUse.waterSupply.water);
		} else if (total > WaterUse.waterSupply.water) {
			let roundTotal = Math.round(total * 10) / 10;
			this.createWaterUse('endUse', 'Sum of End-Uses', roundTotal);
			scenario = 2;
		}

		return scenario;
	};

	getWaterUse = () => {
		return WaterUse;
	};

	render() {
		const { campus } = this.props;
		let scenario = this.scenario(campus);
		let waterUse = this.getWaterUse();
		return (
			<Fragment>
				<Typography variant='h5' gutterBottom>
					Water Balance Results
				</Typography>
				<div>{scenario == 1 ? this.ScenarioOne(waterUse) : this.ScenarioTwo(waterUse)}</div>
			</Fragment>
		);
	}
}
export default Report;
