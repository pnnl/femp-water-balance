import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import "./report.css";
import { DiscreteColorLegend, RadialChart } from "react-vis";

class BarChart extends React.Component {
	render(props) {
		let waterUse = this.props.data;
		let data = [];
		let i = 0;
		waterUse.map((key, i) => {
			const colors = [
				"#47ACB1",
				"#FFCD33",
				"#F9AA7B",
				"#FF991F",
				"#676766",
				"#ADD5D7",
				"#A5A8AA",
				"#F26522",
			];

			if (key.water != 0 && key.name != "Total Water Supply") {
				data.push({
					label: key.name.toString(),
					angle: key.water,
					color: colors[i++],
				});
			}
		});
		return (
			<Fragment>
				<div ClassName='pie-chart-container'>
					<Typography className='title' variant='body2' gutterBottom>
						Water Balance Pie Chart
					</Typography>
					<div className='pie-chart'>
						<RadialChart
							data={data}
							height={300}
							width={300}
							margin={{
								left: 70,
								right: 10,
								top: 30,
								bottom: 90,
							}}
							colorType='literal'
						/>
					</div>
					<div className='legend'>
						<DiscreteColorLegend
							items={data.map(d => d.label)}
							colors={data.map(d => d.color)}
						/>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default BarChart;
